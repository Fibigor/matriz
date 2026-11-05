# Matriz — Plano de testes da ficha 04

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
