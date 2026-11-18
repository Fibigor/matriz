# Quickstart — validação futura do delta

**Procedimentos planeados, nenhuma execução nova nesta P1.** Ler [plan.md](plan.md), [modelo transitório](data-model.md), [delta de contrato](contracts/delta.md), `AGENTS.md`, README e `docs/verification.md`. Não usar este guião como autorização de implementar, arrancar serviços, instalar ou alterar dados.

## Pré-requisitos e gates

1. P1 revista pelo Revisor Matriz; tasks/caminho aprovados e gerados, análise cruzada realizada e implementação autorizada/concluída. Não existem tasks nesta entrega.
2. Aprovação de execução/comandos/alvo e caminhos para reports/capturas. Java 21/Maven, Docker/Testcontainers, Node/npm e dependências já disponíveis; não instalar implicitamente. Usar só contas/projetos/ficheiros fictícios de teste.
3. Frontend/API correspondentes ao mesmo delta. Registar branch/revisão ou identificação de fontes/build e versão efetiva do alvo.
4. Para E2E, Vite e API com seed disponíveis/autorizados ou Compose autorizado em URL explícita. `frontend/playwright.config.ts` tem um worker, sem webServer: não inicia serviços. Não inferir autorização de uso de instância pelo relatório de 17-11.
5. Testes API isolados usam PostgreSQL Testcontainers, não DB alheia. Não apagar volumes, mudar IDs/seed, ler `.env`, repor dados ou reiniciar serviços para libertar quota. A quota de registo é 5 pedidos/endereço remoto observado/15 min; coordenar cenários para não confundir 429 com erro funcional. Testes locais de fronteira UI não devem enviar pedidos inválidos; fronteiras API ficam no ambiente isolado de teste.

## Comandos existentes (só numa fase autorizada)

Na raiz:

```powershell
mvn -f backend\pom.xml test '-Dapi.version=1.44'
```

Dentro de `frontend`:

```powershell
npm test
npm run build
```

Só com alvo E2E disponível e autorizado:

```powershell
npm run test:e2e
```

Usa por omissão `http://localhost:5173`, com API/proxy/seed existentes. Alternativa documentada, **apenas se Compose em 8080 for o alvo confirmado e autorizado**, no mesmo processo PowerShell:

```powershell
$env:PLAYWRIGHT_BASE_URL='http://localhost:8080'
npm run test:e2e
```

Outro porto exige URL real aprovada, não assumir 18086 disponível. Não há comando de arranque/instalação nesta fase. Se faltar alvo/pré-requisito, registar **bloqueado**, não passed. Builds/testes podem gerar saídas: confirmar autorização dessas saídas antes da execução; não criar pastas de evidência adicionais por iniciativa.

## V1 — Registo e compatibilidade (FR-001–003/015; SC-001/002)

- Nos testes API/App existentes, parametrizar 5/6/200/201 pontos ASCII, astral (por exemplo 🚀) e espaços; misturar espaços nas extremidades e aceitar seis espaços, sem trim/composição. 6 e 200 aceites, 5 e 201 recusados sem truncagem. Testar null/vazio e confirmação exata diferente só local.
- Ver ajuda exatamente «Mínimo de 6 caracteres»; curto corresponde ao mínimo; excesso mostra «Palavra-passe demasiado longa». Asserções negativas de número máximo no conteúdo de registo, tanto ajuda como resumo/erro de campo. Injetar resposta servidor de excesso no teste App e verificar os dois canais e foco no campo, mesmo quando frontend enviou valor localmente válido.
- Não usar `taskTemplates.codePoints` para password. Cobrir 200 astral (400 unidades UTF-16), 201 astral e 6 espaços. Login de conta antiga com password curta ainda funciona; login máximo 200 e mensagens não mudam.
- API: 201 JSON apenas mensagem, `/auth/me` continua 401 anónimo, sem perfil/hash/password. UI regressa ao login com foco/email e password vazia, nenhum POST login automático ou armazenamento/transporte de password. Depois login explícito: projetos vazios, pode criar próprio e logout.
- Manter suites de CSRF, quota independente, caminhos codificados, 409 concorrente email, scrypt e erros/transporte sem retry automático. Não testar quota derrubando serviço partilhado.

## V2 — Participantes (FR-011–015; SC-002)

- No teste isolado, criar conta fictícia por registo, projeto do gestor e outro projeto sem acesso. Gestor adiciona pelo email completo; variante com caixa/espaços resolve mesma conta. Unicode aceite pelo registo/login também deve poder ser adicionado; testar 254/255 unidades UTF-16 após normalização.
- Nova conta vê só projetos próprios e aquele onde foi adicionada, papel membro, sem gestão nem herança dos projetos demo/alheios.
- Repetir email e misturar userId legado: 204 sempre que elegível, uma associação via GET/contagem isolada. Duas requisições concorrentes email/email e email/userId produzem uma participação, não 500 ou criação duplicada; usar helper de race existente da suite API.
- Casos XOR: ambos, nenhum, ambos com um null, único null, vazio, email parcial/inválido, unknown field. Esperar 422 de validação (unknown/malformado 400); nenhuma escrita. `userId` exato legado continua válido, sem alterar seed/IDs.
- Email válido inexistente e conta inativa: mesmo 422/field email e «Conta não elegível.», sem expor perfil. Revalidar ator depois da espera pelo lock; testar desativação/ausência de participação e alteração de elegibilidade do alvo no teste isolado.
- Sem sessão 401, sem CSRF 403, membro sem gestão 403, projeto alheio/inexistente 404. Remoção do gestor/participante atribuído continua recusada; remoção elegível confirmada retira acesso.
- UI: form só gestor, label/email completo sem sugestões/lista, exemplo fictício em vez de user-bruno, payload apenas email, nomes/funções/«Inativo» sem IDs apresentados. Erros associados/focados conservam entrada; busy bloqueia duplicação; 204 mostra confirmação neutra, não «novo membro criado».

## V3 — Ciclos de templates (FR-005–007/015; SC-003)

Em **criação e edição**, percorrer TASK/BUG/IMPROVEMENT:

1. Mudar tipo sem tocar descrição. Aplicar manualmente conteúdo exato já existente (objetivo/passos/critérios; reprodução/esperado/obtido; problema/proposta/critérios).
2. Descrição não vazia: cancelar confirmação mantém texto e ação disponível; confirmar aplica e desativa/cinzenta.
3. Editar/apagar descrição não reativa; outro tipo ainda não aplicado disponível; regressar a aplicado bloqueado. Verificar handler/disabled, não só cor.
4. Edição: guardar com sucesso, falhar PUT, receber refetch externo limpo/sujo ou atualização local de atribuições/relações: conjunto não reinicia; base suja não avança por GET.
5. Recuperar versão atual com confirmação substitui os dados segundo fluxo atual mas **não** limpa conjunto desta edição; cancelar mantém tudo.
6. Alternar painel→página e resize atravessando 960px conserva mesmo textarea/conjunto; cancelar navegação/fecho também. Fechar realmente/reabrir inicia conjunto vazio, outra tarefa independente.
7. Criação: POST falhado conserva conjunto/texto; GET/refetch e erro recuperável do projeto não desmontam NewTask. Só POST confirmado seguido de nova criação limpa conjunto.

## V4 — Detalhe e seletores (FR-004/008/009/015; SC-004–006)

- Desktop 1440×1000: abrir pela lista/painel; maximizar e X à direita, sem texto antigo visível mas com nomes acessíveis. Foco inicial no fecho, Tab/Shift+Tab circunscritos, Escape respeita rascunhos; cancelar mantém todos os drafts, aceitar fecha e devolve foco. Fundo inert só enquanto modal.
- Maximizar por link conserva rascunho/árvore; link com modificador mantém navegação nativa. Hash direto/móvel abre página sem modal/trap, X volta ao projeto pelo guard; não apresentar maximização sem destino numa página já completa.
- Markdown descrição/comentário: «Editar»/«Pré-visualizar»; atividade: «Comentários»/«Histórico»/«Toda a atividade». Todos negrito+sublinhado sem fundo/borda/relevo/sombra, inclusive hover/seleção, com seleção distinguida por cor/espessura e foco visível. Botões pressed corretos, Tab/Enter/Espaço; não há modo «Escrever». Não alterar paginação/filtragem da história.
- Guardar/Eliminar lado a lado no painel/página e móvel, type/submit corretos; delete cancela sem pedido, confirma uma vez, busy bloqueia ambos, erro mantém texto. Preservar indicação destrutiva.
- Repetir a 390×844 e largura 320px, nomes/títulos longos: caixas sem overlap e `scrollWidth <= innerWidth`; verificar retângulos dos botões com sobreposição vertical (mesma linha) e ordem das ações. Inspeção visual de CSS computado, foco e seleção; screenshot isolado não prova teclado.

## V5 — Anexos (FR-010/015; SC-005/006)

- Selecionar ficheiros diretos e de comentário (chooser/drop/paste): metadados seguidos de X, nome «Retirar {ficheiro}». Retirar só altera seleção, não envia DELETE. Sem auto-upload.
- Guardados diretos e de comentário nas três vistas de atividade: metadados → seta «Descarregar {ficheiro}» → X «Eliminar {ficheiro}» apenas canDelete. Sem rótulos de ação visíveis nessas linhas; nome acessível distingue ficheiros.
- Autor/gestor participante podem eliminar com confirmação; membro não autor não vê ação e API recusa forja. Autor removido/inativo não conserva acesso/download. Cancelar mantém anexo e rascunhos.
- Download continua autenticado/blobs/filename/revogação de URLs; erros 401/transporte visíveis, busy evita repetição, sem sucesso inventado. Limites de 5/4MiB/validação e multipart inalterados.
- Desktop/móvel/320px com nomes/metadados longos: ações depois dos metadados na linha, focáveis e utilizáveis, sem overlap/overflow; seleção preservada em erro de envio. Axe nos estados cobertos mais inspeção visual/teclado, sem declarar conformidade integral.

## Registar evidência e limites

Por cada execução futura: autorização/alvo/versão, comando e diretório, resultado observado com totais/falhas, fonte dos reports/capturas, critério FR/SC coberto e limitações. Não guardar passwords/segredos em relatórios. Revisor Matriz faz revisão independente em leitura antes de aceitação.

`docs/verification.md`, secção «Execução local autorizada do registo e revisão por leitura — 17-11-2026», já relata execução posterior ao bloqueio antigo T4, 1 E2E e quatro Axe com capturas e limites de reconstrução. Essa execução não foi repetida nem prova os critérios deste delta. Não declarar T4 sempre pendente nem assumir disponibilidade/autorização atual dos serviços. Testes/build/E2E e visual deste incremento continuam por executar.
