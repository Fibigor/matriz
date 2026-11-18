# Research — Usabilidade de contas, tarefas e participantes

Data: 2026-11-17. Investigação local por leitura, fase P1 autorizada apenas nos cinco artefactos. Seguidos `contexto-matriz`, `validacao-matriz` e `speckit-plan` lendo os respetivos SKILL.md, por ausência de mecanismo nativo de invocação. Sem delegação/internet/testes/builds/serviços ou leitura de segredos.

## Proveniência e decisões já esclarecidas

Fontes: [spec](spec.md)/checklist/feature.json existentes; `AGENTS.md`, constituição, README e `docs/{requirements,constraints,user-stories,architecture,database,implementation-plan,verification}.md`, `openapi.yaml`, código e testes inventariados em [plan](plan.md). Nenhum PDF/PPT foi fornecido/consultado nesta fase; não há páginas/slides ou inspeção de diagramas/imagens a alegar.

**Decisões do autor transmitidas no encaminhamento**, não inferências nem validação cliente: registo 6–200 pontos sem trim/composição, máximo não divulgado na UI/erro de excesso; login inalterado; ícones e seletores acessíveis; templates atuais uma aplicação por tipo/ciclo transitório, sem reset por save/refetch/layout; guardar/eliminar lado a lado; email completo conhecido, sem diretório/convites, compatibilidade userId e XOR, idempotência concorrente, sem mudar seed/IDs. Aprovação presente «segue o plano anterior» cobre **somente** os cinco ficheiros P1. Cabeçalho histórico da spec não deve ser editado.

## R1 — Comprimento e mensagens de registo

**Observação**: `IdentityService.register` usa codePointCount e 12–200 numa única condição/mensagem; `App.Register` usa spread bruto e mostra intervalo; `AuthController.login` tem mínimo não vazio e máximo 200. `taskTemplates.codePoints` faz trim, portanto não mede corretamente passwords só espaços. `ApiErrors.expected` copia a mensagem para `detail` e field; `api.ts` entrega ambos sem transformação.

**Decisão de desenho**: separar mínimo/excesso em backend e Register. Ajuda/erro curto «Mínimo de 6 caracteres»; excesso «Palavra-passe demasiado longa», sem número nos dois canais de erro. Manter valor bruto. Testar caminho servidor (não só validação local), incluindo resposta simulada segura com field password.

**Justificação**: coerência de validação e erro explícito, sem alterar login ou infraestrutura de erros.

**Alternativas rejeitadas**: reutilizar helper que faz trim; `length` UTF-16; `maxLength` HTML; ocultar só ajuda mantendo detalhe com 200; substituição textual global de números; fallback silencioso de registo 6 contra servidor 12. Cliente e servidor deste delta devem ser entregues juntos; não há requisito de compatibilidade com mensagem de backend antigo.

## R2 — Reutilização mínima de email

**Observação**: backend duplica trim/lowercase Locale.ROOT/regex/254 em IdentityService e AuthController; frontend `validEmail` local em App é usado por login/registo com trim Java explícito e sem `type=email`. Projects ainda envia userId.

**Decisão de desenho**: propor criação futura de `backend/src/main/java/pt/matriz/common/Emails.java` (normalização/validade puras) e `frontend/src/email.ts` (extração do validador existente), sem libs. Usar nos três consumidores backend e nos dois ficheiros UI; HTTP e mensagens continuam nos chamadores. Cobrir pelos testes existentes API/App/Tasks.

**Justificação**: um terceiro consumidor backend e segundo ficheiro frontend justificam partilha pequena, evitando regressão Unicode e dependência projects→identity. Extração não pode mudar regra/mensagem/login/throttle.

**Alternativas rejeitadas**: copiar terceira versão; importar helper privado de App ou serviço identity em projects; usar email HTML/nova biblioteca; trim Unicode alargado ou composição automática. Criações exigem aprovação futura; se não aprovadas, rever desenho, não criar por iniciativa.

## R3 — Contrato de adição e concorrência

**Observação**: POST members devolve 204 e exige userId em OpenAPI/DTO; serviço já usa transação, lock de projeto e ON CONFLICT, PK participation é composta. GET members já devolve nome/active/role; não devolve email. `ProjectService.access` não revalida conta ativa após espera; não assumir garantia que só está documentada nos serviços tasks.

**Decisão de desenho**: mesmo POST, exatamente uma propriedade fornecida email/userId. Presença explícita (incluindo null) via setters, padrão existente UpdateTask. Autorização antes de procurar alvo; revalidar ator após lock no addMember, procurar conta ativa por igualdade exata normalizada e proteger linha-alvo até inserção. Mesmo 422 «Conta não elegível.» para ausente/inativa, field do critério; XOR inválido no field email. Manter 204 neutro, ON CONFLICT dirigido à PK e consulta de permissões no servidor.

**Justificação**: acesso existente e idempotência inclusive entre as duas formas não requerem schema novo nem resposta adicional. Revalidação localizada preserva autorização sob espera; não prometer revalidação em todos os métodos de projetos.

**Alternativas rejeitadas**: endpoint de diretório/search, convite, aceitar ambos e escolher silenciosamente, resolver por displayName/parcial, 201 afirmando nova participação sem informação de criação, mudar IDs/seed ou adicionar emails ao GET. Só aceitar String não null para XOR perderia distinção entre ambos fornecidos com um null e critério único.

## R4 — Templates e lifecycle React

**Observação**: `taskTemplates.ts` já tem conteúdos TASK/BUG/IMPROVEMENT distintos. NewTask e TaskEditor aplicam manualmente com confirmação mas não registam aplicações; TaskEditor mantém árvore no refetch, save e recuperação. App/TaskDetailPanel mantêm filhos ao passar a página completa. NewTask está fora de LoadState mas condicionado por `resource.data && !resource.error`: erro recuperável desmonta-o.

**Decisão de desenho**: conjunto local imutável por editor/criação; desativação nativa e cinzento, handler protegido, só inserir após aplicação efetiva. Não resetar em save/refetch/recuperação/resize/maximizar. Manter NewTask montado após primeira carga inclusive em erro recuperável. Limpar conjunto na criação seguinte após sucesso; edição reinicia só por fechar/reabrir efetivamente/outra identidade.

**Justificação**: estado de interação da sessão de edição, não atributo da tarefa. Preserva base de rascunho sujo e avanço de versão só por resposta local reconhecida.

**Alternativas rejeitadas**: boolean por tipo atual que esquece anteriores, efeito dependente de task/version/description, persistência/localStorage, auto-template ao mudar tipo, reset após PUT ou GET, novo catálogo/hook genérico sem necessidade. `taskTemplates.ts` e o teste de conteúdos existentes ficam só leitura.

## R5 — Toolbar e seletores sem regressão semântica

**Observação**: toolbar só em TaskDetailPanel; hash standalone não passa pelo wrapper. CSS global desenha botões e outline de seleção; Markdown usa «Escrever» e `aria-pressed`, atividade já usa três botões pressed. Fecho/foco/Escape/inert implementados no painel; maximizar usa âncora/evento e preserva árvore.

**Decisão de desenho**: pequena toolbar partilhada dentro de ficheiro existente, indicação standalone explícita em App/TaskDetail. Maximizar só quando existe transição painel→página; X em ambos, guard intacto, alinhamento à direita. Botões de modo continuam nativos; CSS scoped texto negrito+sublinhado sem chrome, seleção por cor/espessura e foco próprio. Eliminar entra no form numa linha de duas colunas ao lado de Guardar, type button.

**Justificação**: não criar maximização sem destino numa página já completa, manter links/modificadores/navegação existentes e evitar remount/dupla toolbar. CSS não deve remover teclado.

**Alternativas rejeitadas**: spans clicáveis, tabs ARIA incompletas, title como único nome, CSS que remove todo foco, pôr delete dentro de form sem type, alterar comportamento global de botões, criar biblioteca de ícones.

## R6 — Ficheiros sem duplicação de renderização

**Observação**: FilePicker/AttachmentList já são partilhados por diretos e comentários em TaskActivity. canDelete vem do servidor; download usa blob/revogação URL; erros e confirmações existem.

**Decisão de desenho**: alterar somente apresentação nestes dois componentes e CSS scoped, SVG decorativo, nomes por ficheiro, metadados antes das ações, quebra de nomes sem overlap; X retirar, seta download e X delete autorizado. Testes de comentários cobrem reuso.

**Justificação**: não duplicar ações nem tocar no backend de anexos/permissões.

**Alternativas rejeitadas**: renderizador novo por comentário, usar href público não autenticado, apagar autorização/confirm/busy, ocultar erro para compactar, truncar metadados como única solução.

## R7 — Evidência e divergências documentais

**Observação**: fontes atuais e instruções ainda dizem 12; search local identificou todos os caminhos no inventário B5. `docs/verification.md` contém execução posterior autorizada do registo em «Execução local autorizada do registo e revisão por leitura — 17-11-2026»: relato de 1 E2E, quatro Axe e capturas, com limites de reconstrução independente; noutros documentos T4 continua com estado anterior.

**Decisão de desenho**: alinhar fontes/instruções futuramente mediante aprovação própria, com suplemento datado, sem reescrever resultados antigos. Estado posterior do registo é evidência anterior a este delta, não execução nossa. Testes de fronteira de 11/12 precisam mudar; passwords de fixture de comprimento 12 continuam válidas e não exigem substituição global.

**Justificação**: evitar tanto ignorar execução existente como reutilizá-la para provar novas regras.

**Alternativas rejeitadas**: tratar T4 como sempre pendente, declarar testes/serviços agora, reescrever histórico, editar AGENTS/skills pelo Planeador ou autorizar operação de serviço por constar de relatório.

## Conclusão

Não restam decisões funcionais por esclarecer dentro da spec e do encaminhamento. Desenho proposto, não comportamento provado. Gates pendentes: revisão independente P1; aprovação de tasks/caminho; tasks e análise cruzada; aprovação específica de implementação, novos helpers, canónicos/instruções e validação/alvo. Sem tarefas formais ou autorização de arranque automático.
