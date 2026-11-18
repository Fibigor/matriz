# Data model — delta sem nova persistência

Data: 2026-11-17. Desenho P1; fontes de verdade: [modelo canónico](../../docs/database.md), [requisitos](../../docs/requirements.md) e [spec](spec.md). Este documento descreve só as alterações de entrada/estado transitório.

## Entidades existentes

| Entidade | Campos/relações relevantes existentes | Delta proposto |
|---|---|---|
| Conta (`app_user`) | id/username internos únicos, display_name, email com índice único parcial `lower(email)`, password_hash, active | Password de entrada 6–200 pontos Unicode sem trim/composição; persiste só hash scrypt. Email/localização reusa normalização atual. Sem alterar colunas, índice, IDs ou contas/seed. |
| Participação (`participation`) | PK `(project_id,user_id)`, FKs projeto/conta, joined_at; gestor participa | Resolver alvo por email completo ou userId exato antes de inserir mesma associação. Repetição mantém uma linha, sem alterar joined_at/papel por duplicação. |
| Projeto (`project`) | id, owner_user_id, version e restantes dados existentes | Gestor continua derivado do proprietário; adição não promove, transfere ou concede acesso a outro projeto. Lock existente usado para serializar adições. |
| Tarefa (`task`) | UUID, projeto, MAT-n, tipo, descrição e versão existentes | Nenhum novo campo. Templates permanecem strings fixas no cliente; estado de aplicação não vai no JSON. |
| Anexo (`task_attachment`) | tarefa, comment_id opcional, metadados, BYTEA, autor; canDelete derivado na API | Nenhum delta persistido; só ícones/layout. Seleção não enviada é File[] local, retirar não elimina dados persistidos. |

Sem migrations, novos índices/tabelas, histórico de templates, alterações de retenção ou estado de sessão/throttle. V1–V4 preservadas.

## Input transitório de participação

`MemberInput` proposto: `email`, `userId` e flags de presença na desserialização, técnica já existente em UpdateTask. Não é entidade DB nem campo de resposta.

- Exatamente uma propriedade **fornecida**; ambas incluindo uma null são inválidas.
- Escolhida deve conter string válida não null/não vazia; userId mantém identidade exata.
- Email: null inválido; trim Java U+0000–U+0020, lowercase Locale.ROOT, comprimento normalizado ≤254 unidades UTF-16 e regex vigente Unicode compatível login. Sem composição ou normalização de ID.
- Critério ausente/ambíguo: 422 com erro no field email; alvo inexistente/inativo: mesma mensagem «Conta não elegível.» no field do critério. Não distinguir estados no retorno.
- HTTP malformado/tipo inválido/campo desconhecido continua 400 segundo configuração existente.

### Transição transacional

Sessão/CSRF → autorização gestor/lock de projeto → revalidar ator ativo/participação após espera → validar XOR e critério → localizar alvo ativo por igualdade parametrizada e proteger linha-alvo até commit → INSERT na PK com ON CONFLICT dirigido → 204. Ausência de alvo/falha implica nenhuma participação criada, sem alterar hash/conta/projeto/versão ou criar convite.

Concorrência email/email e email/userId resolve para o mesmo id e mesma PK; exatamente uma linha. Contas inativas não são ativadas por repetir adição. Sem diretório global ou persistência do critério usado.

## Ciclo transitório dos templates

Cada `NewTask`/`TaskEditor` conserva `appliedTypes: Set<TaskType>` apenas na memória React dessa criação/edição. Tipos existentes: TASK/BUG/IMPROVEMENT, conteúdo reutilizado de `frontend/src/taskTemplates.ts`.

| Evento | Texto/estado do editor | appliedTypes |
|---|---|---|
| Iniciar criação ou abrir tarefa noutro ciclo | Dados iniciais vigentes | vazio |
| Mudar tipo | Apenas tipo muda; descrição intacta | conserva |
| Aplicar tipo ainda não usado, descrição vazia ou confirmação aceite | Copiar template; rascunho sujo | acrescentar tipo atual |
| Cancelar confirmação | Não alterar | conserva, sem acrescentar |
| Editar/apagar descrição depois da aplicação | Alteração manual preservada | conserva |
| Tentar reaplicar tipo já usado | Nenhuma substituição; controlo disabled/cinzento | conserva |
| PUT confirmado ou falhado | Base/texto segundo fluxo atual | conserva |
| GET/refetch limpo/sujo/erro/avanço local de versão | Não substituir base suja; NewTask não desmonta por erro recuperável | conserva |
| Recuperar versão atual com confirmação | Substituir dados conforme operação existente | conserva; não é novo ciclo |
| Painel→página/resize/navegação cancelada | Mesma árvore e rascunhos | conserva |
| POST criação confirmado → criação seguinte | Limpar título/descrição segundo fluxo atual | novo conjunto vazio |
| Fechar e depois reabrir efetivamente/outra tarefa | Nova montagem por identidade, não por versão | novo conjunto vazio |

Não partilhar conjunto entre tarefas/editor de criação e editor de detalhe, não usar localStorage/sessionStorage, não colocar `appliedTypes` em Task/PUT/DB. Não reiniciar por `revision`, `dirty`, save ou alterações manuais.

## Estado visual transitório preservado

Modo Editar/Pré-visualizar, vista de atividade e páginas atuais continuam locais; aparência textual não modifica payloads/filtros/paginação. Draft flags/guards, File[] selecionados, locks síncronos de submissão e canDelete derivado continuam com responsabilidades existentes. Maximizar muda apresentação, não identidade/ciclo do detalhe.

## Validações relacionadas

FR-001–003: contagem bruta de password por pontos de código, casos 5/6/200/201, astral e só espaços; nunca usar helper de tarefa que faz trim. FR-005–007: máquina de estados acima; FR-011–015: XOR, elegibilidade e unicidade da associação. Prova planeada em [quickstart.md](quickstart.md); nenhuma execução nesta fase.
