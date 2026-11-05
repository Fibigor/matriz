# ADR-0005 — Análise estática com Semgrep

- **Estado:** Aceite
- **Ficha de referência:** [Ficha Prática 04 — 05/11/2026](https://moodle.esmad.ipp.pt/mod/resource/view.php?id=5139).
- **Data da decisão:** 05/11/2026.

## Contexto

A ficha 04 pede atividades de Quality Assurance e revisão de segurança. Antes desta decisão, o repositório não tinha uma ferramenta de análise estática configurada. O projeto usa Java/Spring Boot e React/TypeScript, e a verificação deve poder correr localmente e na CI.

## Decisão

Adotar Semgrep Community Edition, executado em Docker localmente e num job dedicado do GitHub Actions. A configuração combina os rulesets públicos `p/java` e `p/typescript` com a regra local `.semgrep.yml` para CORS wildcard em Java. A execução da CI usa `--error`, pelo que findings fazem o job falhar.

## Consequências

- A análise pode ser reproduzida localmente com Docker, sem adicionar dependências à aplicação.
- O scan local e o da CI partilham a mesma configuração; a obtenção dos rulesets públicos requer acesso ao registry Semgrep.
- A execução local registada em `quality-security-review.md` terminou sem findings. A CI também passou no run [42084239819](https://github.com/Fibigor/matriz-ai-powered/actions/runs/42084239819).
- O resultado de um scan não é certificação de segurança nem substitui testes, revisão de código ou revisão de segurança.

## Alternativas consideradas

Não havia analisador estático configurado anteriormente. Não existe comparação formal registada com SonarQube, Checkstyle ou PMD; não se afirma que essas ferramentas tenham sido avaliadas e rejeitadas.

## Referências

- [Configuração Semgrep](../../.semgrep.yml).
- [Workflow CI](../../.github/workflows/ci.yml).
- [Comando local](../../README.md).
- [Plano de testes da Ficha 04](../test-plan.md).
- [Revisão de qualidade e segurança](../quality-security-review.md).
