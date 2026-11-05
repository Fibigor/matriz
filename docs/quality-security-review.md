# Matriz — Revisão de qualidade e segurança da ficha 04

## Âmbito e evidência

Revisão realizada em 05-11-2026 sobre o último incremento disponível antes destas alterações: commit `70e0eca` (`feat: implement local email and password authentication, replacing Keycloak OIDC`), branch `main`, inicialmente sem alterações locais. O Code Review foi limitado a esse incremento; o Security Review cobriu autenticação/sessão/CSRF e autorização de projetos e tarefas. Os critérios de negócio usados foram RN-01/RN-05, US-05/US-10 e o contrato `openapi.yaml`.

O Code Review direto não encontrou defeitos confirmados que justificassem um finding. A revisão de segurança read-only também não encontrou vulnerabilidades confirmadas. Isto não é certificação de segurança nem prova de ausência de vulnerabilidades.

## Testes e resultados observados

| Nível | Verificação | Resultado |
|---|---|---|
| Unitário | `mvn -q -f backend\pom.xml test '-Dapi.version=1.44'` | 12 testes passaram: 5 em `InputsTest`, 1 em `LoginThrottleTest` e 6 em `ApiIntegrationTest`. Inclui título válido, espaços, limite de 200 pontos de código Unicode e rejeição de 201. |
| Integração | Mesmo comando Maven; PostgreSQL 17 isolado por Testcontainers, migrations Flyway aplicadas. | Criação/consulta de tarefa persistida e título inválido verificados. Carla, sem participação, recebeu 404 em GET/PUT/DELETE da tarefa de Ana; uma nova consulta por Ana confirmou título, estado e versão intactos. |
| Componentes frontend | `npm test` em `frontend` | 13 testes passaram. |
| Build frontend | `npm run build` em `frontend` | TypeScript e Vite concluíram o build. |
| E2E | `PLAYWRIGHT_BASE_URL=http://localhost:18084 npm run test:e2e` em `frontend` | Suite completa: 5/5 passaram, incluindo o percurso da ficha 04, CRUD/colaboração, login inválido, navegação/teclado e auditorias axe-core. |
| Análise estática | Docker Semgrep CE: [ADR-0005](adr/0005-semgrep-static-analysis.md), `.semgrep.yml`, `p/java` e `p/typescript` | 135 regras executadas em 29 ficheiros; 0 findings; execução terminou sem erros. |
| CI GitHub Actions | Run [42084239819](https://github.com/Fibigor/matriz-ai-powered/actions/runs/42084239819), commit `71d9fd7` | Todos os jobs passaram: Semgrep, testes backend, testes/build frontend e E2E. O job E2E usa `ubuntu-24.04`, compatível com Playwright 1.56.1. |
| Contrato | Parsing local de `openapi.yaml` com PyYAML | YAML válido; versão OpenAPI declarada 3.1.0 e 12 paths. Não é validação semântica integral do contrato OpenAPI. |
| Diff | `git diff --check` | Passou; Git emitiu apenas avisos de conversão LF/CRLF nos ficheiros de teste alterados. |

O primeiro ensaio Maven desta alteração revelou uma asserção de teste incoerente: esperava encontrar o nome do campo no texto genérico da exceção. A regra de produção não foi alterada; a asserção passou a verificar o estado 422 e o campo `title` na propriedade tipada da exceção. A execução Maven final passou.

O E2E usou Compose com o projeto isolado `matriz-ficha04-check`, portas alternativas 18084/55434 e credenciais fictícias de `.env.example`. Os serviços foram parados depois do ensaio; o volume dedicado foi preservado. Não foi usado `down -v` nem alterado `.env`.

## Segurança e Code Review

| Área | Resultado e validação |
|---|---|
| Autorização de tarefas / IDOR | Nenhuma vulnerabilidade confirmada na revisão do código. A regressão de integração usa duas contas de demonstração e confirma bloqueio de leitura, edição e eliminação por pessoa sem participação, com 404 conforme RN-01 e sem alteração do recurso. |
| Sessão, autenticação e CSRF | Nenhuma vulnerabilidade confirmada na revisão read-only. Os testes existentes exercitam login, CSRF, logout e bloqueio de tentativas; não foram reexecutados testes dinâmicos de segurança separados. |
| Code Review do incremento `70e0eca` | Nenhum bug confirmado identificado no diff analisado que justificasse finding. Não foram efetuadas alterações de produção. |
| Análise estática | Semgrep Community Edition foi executado localmente com os rulesets públicos `p/java` e `p/typescript` e uma regra local para CORS wildcard em Java; não encontrou findings. A execução no workflow GitHub Actions também passou no run [42084239819](https://github.com/Fibigor/matriz-ai-powered/actions/runs/42084239819). |

## Limitações e decisões

- A suite E2E local completa passou e a pipeline GitHub Actions passou no run [42084239819](https://github.com/Fibigor/matriz-ai-powered/actions/runs/42084239819), no commit `71d9fd7`.
- O scan Semgrep local terminou sem findings; os rulesets públicos são obtidos do registry e podem evoluir independentemente do repositório.
- O contrato foi analisado apenas quanto à sintaxe YAML; não foi executado um validador completo de OpenAPI 3.1.
- A revisão de segurança foi estática e limitada ao código e regras disponíveis; não incluiu teste de penetração, teste exaustivo de concorrência, configuração de produção ou dependências com ferramenta especializada.
- A validação de autorização cobre o recurso criado no ensaio e os métodos GET/PUT/DELETE previstos; não demonstra segurança de todos os endpoints ou de todas as combinações possíveis.
- Não foram corrigidos findings de produção porque não foram confirmados. As alterações desta ficha limitam-se a testes e documentação.

O plano e a rastreabilidade dos cenários estão em [test-plan.md](test-plan.md). Os comandos de teste existentes estão documentados no [README](../README.md). Esta revisão não efetuou commit, push nem deploy; a demonstração Render atualmente publicada e a expiração da base estão registadas em [verification.md](verification.md).
