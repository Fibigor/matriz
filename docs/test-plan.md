# Matriz — Plano de testes da ficha 04

## Extensões — plano atual de 13-11-2026

Âmbito aprovado pelo autor, RN-13–19/US-12–19; não validação do cliente. Esta escrita **não executa** comandos abaixo: confronta fontes e reports guardados. [verification](verification.md#extensões-de-tarefas--13-11-2026) regista 41/43/6, sem confundir critérios com execuções.

| ID | Resultado esperado | Evidência existente e verificação final |
|---|---|---|
| V4-01 | Migração vazia/populada V3→V4; MAT global único, ordem de backfill, lacunas permitidas, UUID/datas/versões preservados, sem eventos fictícios. | Maven final 41 passou, incluindo V3 populada→V4/MAT/defaults; arranque vazio V1–V4 da imagem fresca e persistência após recriação app/db confirmados separadamente nos artefactos finais. |
| V4-02 | PUT antigo conserva type/weight omitidos; weight null limpa, type null no PUT 422; motivos só DONE, omissão/transição/reabertura e todos os DONE no progresso. | Backend 41; campos antigos mantêm semântica. |
| V4-03 | RELATED reversa idempotente, BLOCKS/DUPLICATES dirigidas, mesmo projeto/nested scope, sem self; duas versões, 409 antigo, incremento duplo só na criação/remoção explícita. | Backend, componentes e E2E de revisão. |
| V4-04 | Múltiplos bloqueadores: início permitido, conclusão só todos DONE; reabertura com dependente DONE e novo bloqueador não DONE para DONE recusados; ciclos/races reversas e disjuntas; remoção/eliminar desbloqueia sem mudar estados. | Backend com lock de projeto; histórico sobrevivente sem incremento na cascata. |
| V4-05 | 5 diretos e 5/comentário, 4 MiB; PNG/JPEG/GIF/WebP/PDF/TXT/MD, UTF-8/Unicode/NUL/markup, nome sanitizado, vazio/formato/count/tamanho; multipart JSON-part e JSON antigo. | Backend incluindo concorrência e servlet HTTP real; 400/413/415/422 distintos, não antivírus/parsing completo. |
| V4-06 | Download revalida acesso, MIME/length/attachment/nosniff/no-store; só autor ou gestor participante elimina; revogação/inatividade inclusive writer à espera do lock. | Backend final e HTTP da imagem fresca: downloads/bytes/hashes/headers, 401 anónimo, 404 alheio e 403 não autor confirmados; E2E e browser Markdown só de leitura passaram. Inspeção humana continua pendente, sem garantia exaustiva de segurança. |
| V4-07 | Falha tardia DB/ficheiro reverte lote/comentário/evento; texto obrigatório, sem cmtedit/delete/upload posterior; história typed text/number/userIds, null/listas vazias, snapshots/cascatas/paginação/idempotência. | Backend com falha induzida/FKs; componentes attachments/activity. |
| V4-08 | Markdown básico seguro, HTTP/HTTPS, sem HTML/imagens/GFM; 3 templates/confirmreplace/tipo não automático, 2 000 Unicode mantido. | MarkdownEditor/taskTemplates; vite.config descobre .test.ts e .test.tsx. |
| V4-09 | Mesmo detalhe hash/painel (>960 px)/página móvel/resize; foco/Escape/inert/retorno; preserveDraft em falha/navegação/mudança para página. | Componentes/E2E; inspeção humana screenshots/teclado pendente. |
| V4-10 | Atribuir/retirar e criar/remover link conserva título/descrição/tipo/peso, avança só base local reconhecida; refetch externo não avança base suja; 409/recuperação confirmada; retry/Enter sem alvo não submetem. | 6 regressões + sexto E2E; 43 finais com 13 originais e 2 templates descobertos. |
| V4-11 | Mesma imagem final passa build/gates npm/JAR/Semgrep/E2E; migração e persistência após recriação, readiness/outage/recovery, sem perder volumes/dados; revisão independente. | **Parte local passou**: 41/43/6, imagem/contentores frescos, Trivy 0 HIGH/CRITICAL (294/294 npm, 63/63 JAR), Semgrep 135/47/0, actionlint 1.7.7 PASS; migração populada no Maven, ambos IDs novos no mesmo volume, snapshots/bytehashes iguais após recriação e recuperação DB; readiness 503/liveness 200 durante paragem só da DB própria. App/db próprios parados, volume retido. **Revisão independente/humana e GitHub Actions no âmbito/branch atual, uploads/retenção reais pendentes**. |

Comentários/links/história: page=1, pageSize=20 (1–100), ascendente (createdAt,id), snapshot count/items; beyond-end vazio, zero total zero páginas. Seletor pesquisa só página indicada; filtro visual de história não é parâmetro global API. Autorizar antes de executar; usar ambiente fictício isolado e preservar `.env`/volumes.

## Âmbito e critérios de referência

Este plano deriva dos requisitos e critérios da ficha 03, não apenas do comportamento atual. O foco é criação e consulta de tarefas e a fronteira de autorização entre participantes, conforme RF-05, RF-06, RF-10 e US-05/US-06/US-10. A API e as respostas esperadas seguem `openapi.yaml`; os detalhes de validação de título seguem RN-02/RN-05.

Todos os dados persistentes dos testes de integração vivem no PostgreSQL isolado por Testcontainers. Os testes criam o seu próprio projeto; o E2E usa nomes únicos e elimina o projeto criado. Os testes não alteram dados dos projetos demo existentes.

## Cenários selecionados

| ID | Cenário e entrada | Resultado esperado | Nível e teste |
|---|---|---|---|
| UT-01 | Título válido com espaços exteriores. | `Inputs.title` remove apenas espaços das extremidades e devolve o texto normalizado. | Unitário — `InputsTest.acceptsValidTaskTitleAfterTrimming`. |
| UT-02 | Título com exatamente 200 pontos de código Unicode. | Aceite sem truncagem; caracteres suplementares contam como um ponto de código cada. | Unitário — `InputsTest.acceptsTaskTitleAtUnicodeCodePointLimit`. |
| UT-03 | Título apenas com espaços ou com 201 pontos de código. | Rejeitado como `ApiException` de validação; o limite não é contornado por Unicode suplementar. | Unitário — `InputsTest.rejectsBlankAndOverLimitTaskTitles`. |
| INT-01 | Ana, participante/gestora, cria uma tarefa válida num projeto novo e consulta-a numa nova sessão autenticada. | `POST` devolve 201 e título/estado inicial/prioridade/responsáveis coerentes; `GET` devolve os mesmos dados persistidos. | Integração — `ApiIntegrationTest.taskCreationPersistsAndNonParticipantsCannotReadUpdateOrDeleteIt`. |
| INT-02 | Carla, sem participação no projeto de Ana, tenta consultar, editar e eliminar a tarefa criada em INT-01. | Cada operação devolve 404; nova consulta por Ana confirma que a tarefa, versão e estado não foram alterados. | Integração / autorização — mesmo teste INT-01; PostgreSQL real via Testcontainers. |
| INT-03 | Título composto apenas por espaços na criação da tarefa. | A API devolve 422 e não apresenta criação como sucesso. | Integração — `ApiIntegrationTest.createsAndReadsPersistedTaskAndRejectsInvalidInput`. |
| E2E-01 | Autenticar, criar um projeto de teste, abri-lo, criar uma tarefa e consultar a listagem. | A tarefa aparece exatamente uma vez na interface do projeto; no fim, o projeto isolado é eliminado pela interface. | E2E — `Ficha 04: autenticar, abrir projeto, criar tarefa e confirmar listagem` em `frontend/e2e/matriz.spec.ts`. |

O caso negativo de autorização usa duas contas de demonstração distintas. A resposta 404 para o utilizador sem participação segue a regra RN-01 de não distinguir recursos alheios de inexistentes. Testes unitários verificam a regra isolada; testes de integração exercitam controller, autorização, serviços e PostgreSQL; o E2E valida o percurso observável na interface.

## Comandos

Executar a partir da raiz:

```powershell
mvn -f backend\pom.xml test '-Dapi.version=1.44'
```

Executar testes de componentes e build frontend:

```powershell
Set-Location frontend
npm test
npm run build
```

Executar E2E contra Vite/API/seed locais já iniciados, ou contra o Compose:

```powershell
Set-Location frontend
npx playwright install chromium
npm run test:e2e
```

```powershell
Set-Location frontend
$env:PLAYWRIGHT_BASE_URL='http://localhost:8080'
npm run test:e2e
```

Os E2E necessitam de uma instância Matriz de teste com o seed fictício ativo. Não usar os testes contra dados reais. Para comandos de arranque e configuração, seguir as instruções do README; não substituir `.env` existente nem apagar volumes.

## Registo dos resultados

Os resultados observados para esta ficha e respetivas limitações estão em [quality-security-review.md](quality-security-review.md). Um cenário só deve ser marcado como executado quando o comando terminar e o resultado for observado; cobertura de código não substitui os critérios acima.
