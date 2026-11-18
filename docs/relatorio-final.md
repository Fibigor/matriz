# Matriz — Relatório final

**Data:** 18-11-2026 · **Versão de referência:** candidato académico `0.4.0-rc.1`.

Este relatório resume o trabalho desenvolvido e os pontos pedidos na entrega da ficha 05. Os resultados são os documentados nas fontes indicadas, não novas execuções realizadas para elaborar este relatório. Não constitui publicação de release ou validação do cliente.

## 1. Alterações implementadas

A Matriz evoluiu de uma especificação e arquitetura para uma aplicação de gestão de projetos e tarefas com interface, API e persistência reais.

- **Projetos e colaboração:** criação, pesquisa, consulta, edição e eliminação de projetos; participantes por email completo; tarefas com estado, prioridade, vários responsáveis, comentários e progresso global.
- **Extensões de tarefas:** chave `MAT-n`, tipo, peso e motivo de fecho opcionais, relações RELATED/BLOCKS/DUPLICATES, anexos, histórico, Markdown básico e templates.
- **Identidade:** substituição da abordagem Keycloak/OIDC por autenticação local com Spring Security, hash scrypt, sessão no servidor e CSRF. Posteriormente, registo público exclusivamente académico, sem confirmação por email nem auto-login.
- **Usabilidade:** detalhe partilhado entre painel e página, proteção de rascunhos, templates por ciclo de edição, ações compactas, nomes acessíveis e melhorias de foco.
- **Entrega e documentação:** Dockerfile multi-stage, Compose com PostgreSQL e volume persistente, migrations Flyway, seed fictício opt-in, GitHub Actions, OpenAPI, ADRs, instruções de execução, changelog e notas da versão candidata.
- **Desafios opcionais A/B/C:** scan Trivy já integrado com exceção HIGH exata
  vigente (não remediado); logs JSON ECS nativos Boot só no perfil local
  `observability`; workflow de imagem de teste GHCR de prerelease configurado,
  **sem publicação comprovada**. Detalhes e alcance abaixo.

A solução mantém um monólito modular com Java 21/Spring Boot, React/TypeScript e PostgreSQL 17, usando JDBC e Flyway. O frontend compilado e a API são entregues no mesmo JAR.

Fontes: [requisitos](requirements.md), [arquitetura](architecture.md), [release notes](../RELEASE_NOTES.md) e [rastreabilidade das fichas](coursework-review.md).

## 2. Resultados de testes e pipeline

| Verificação | Resultado documentado | Alcance |
|---|---|---|
| Backend | **58 testes PASS**, execução B1 do incremento de usabilidade | Não reexecutados na elaboração deste relatório |
| B — observabilidade/JSON | Engenheiro relatou Maven selecionado **6 testes PASS**, zero falhas/erros/skips, exit 0/BUILD SUCCESS em **18-11 às 21:09:28Z**, diff-check PASS | Após duas tentativas falhadas durante desenvolvimento de testes; não execução do agente documental, não suite completa nem soma aos 58 anteriores |
| Frontend e build | Em 18-11, às **18:33:05 UTC**, **141/141 testes PASS em 10 ficheiros** e build TypeScript/Vite PASS | Execução local posterior à correção das assertions de foco; não comprova CI remoto |
| E2E completo | Em 18-11, **11:55–11:56 UTC**, **11/11 PASS**, numa execução completa sem retries | Fecho T024, 28/28 tarefas, com revisão independente `review-t024-full-closure` PASS; não é soma de seleções |
| Visual humano | Aprovação do autor em 18-11, às **09:42:49Z** | Evidência distinta dos testes automáticos; não certifica acessibilidade integral |
| CI remoto — relato preexistente | Run [44371108744](https://github.com/Fibigor/matriz/actions/runs/44371108744), branch `main`, commit `cf0a74102d3061493ee44c5b74261d18bf150342`: **SUCCESS**, concluído em **18-11, às 18:46:03 UTC**, conforme registo anterior deste relatório | O registo anterior atribuía consulta à API pública após confirmação do autor e sucesso aos quatro jobs. Não consultado nesta revisão; URL `Fibigor/matriz` difere deste repositório `Fibigor/matriz-ai-powered`, proveniência por reconciliar |
| CI remoto — histórico | Logs fornecidos pelo autor das **14:08 UTC** (HIGH bloqueante) e **18:31 UTC** (140/141 testes frontend PASS, falha temporal de foco) | Falhas anteriores, registadas como ultrapassadas pelo relato SUCCESS posterior; preservadas como histórico, com a ressalva de proveniência acima |

A pipeline define análise estática, testes backend/frontend, build e job integrado com imagem Docker, scans de bibliotecas e E2E. O relato remoto acima é preservado, mas não confirma aqui este repositório nem cobre alterações locais posteriores B/C ou ausência de vulnerabilidades.

O HIGH de CI originou uma exceção temporária aprovada: exclusivamente **`picomatch@4.0.7` / `CVE-2026-112366` / HIGH / frontend npm**, todas as ocorrências dessa versão no lock com `dev: true`, sem `FixedVersion` reportada e antes de **2026-11-25T00:00:00Z exclusivo**, sem renovação automática. Outros findings, fix disponível, dependência de produção, expiração ou erros de scanner/cobertura continuam bloqueantes. É aceitação delimitada de risco, não remediação ou scan limpo.

**Ainda por confirmar nesta síntese:** reconciliação da proveniência remota,
prova negativa controlada da política atual e uploads/retenção reais dos
artefactos. O relato de run bem-sucedido não comprova, por si só, esses pontos.

Comandos, cronologia e limitações: [verification.md](verification.md). Política: [constraints.md](constraints.md#excecao-temporaria-ci). Definição: [ci.yml](../.github/workflows/ci.yml).

### Cobertura A/B/C e limites da evidência

| Desafio opcional | Estado e evidência | O que não comprova |
|---|---|---|
| **A — scan de dependências** | **Já integrado**; Trivy e gate preservados, com a exceção exata descrita acima. | Não remediado nem scan limpo. Sem novo scan nesta edição; risco, validade e bloqueios mantêm-se. |
| **B — observabilidade/JSON** | **Implementado; validação local relatada**. `logging.structured.format.console: ecs` apenas em `observability`, sem encoder/dependência nova. Evento SLF4J real capturado com aspas/quebra de linha; teste valida `@timestamp` parseável, `log.level`, `log.logger` e `message` após parsing. | Não valida toda a saída do processo como JSON nem um processo default isolado: o contexto secundário default já não reconfigura logging global. Não houve paragem real da DB; teste bloqueia só a aquisição JDBC do health indicator. Health, CSRF, sessão e autorização preservados no teste. |
| **C — imagem GHCR** | **CONFIGURADO localmente com revisão independente PASS por relato**, não desafio comprovado por publicação. [release.yml](../.github/workflows/release.yml) guarda release published/prerelease true/draft false, commit exato, último CI push desse commit e quatro jobs existentes SUCCESS; após F1 revalida identidades/runs/attempts antes/depois dos jobs e antes de build/push. | Sem Docker build desta release, autenticação GHCR, chamadas rede/CI remoto/release/push/publicação. Sem run/digest publicado; revalidação não é atómica com registry/build/push. |

C configura imagem `ghcr.io/<owner>/<repo>` lowercase e apenas tag
`test-<release-id>-sha-<commit>` (SHA completo), sem `latest`. Login usa
`GITHUB_TOKEN`, `packages: write` só no job `publish`; summary regista
digest/commit/run anterior. API CI pública sem token: privado, rate limit ou erro
bloqueiam. **Gate CI anterior do mesmo commit não prova scan da imagem
reconstruída nem igualdade de digest**; release não repete scan/E2E nessa imagem.

O engenheiro C relatou Python inline YAML/AST/estrutura/permissões/**41 casos
PASS**, `bash -n` de **dois blocos PASS**, **cinco casos digest PASS** e
UTF-8/whitespace PASS, hash de `ci.yml` preservado. `actionlint`/`shellcheck`
indisponíveis. Não foram executados pelo agente documental. B teve duas
tentativas falhadas antes do resultado final; não apagadas nem convertidas
retroativamente em sucesso.

**Fecho independente local B/C, relatado pelo utilizador em 18-11-2026:**
Revisor Matriz / `revisão-final-f1`, **APROVADO sem achados**, no escopo
`.github/workflows/release.yml`, `docs/development.md` e `docs/verification.md`
após F1. A revisão anterior de B e dos oito caminhos não tinha achados exceto
F1, agora corrigido; o bloqueio fica histórico, não pendência atual.
O revisor relatou Python real via `python -B -` com mocks, **99/99 casos e
215 chamadas API simuladas PASS**, YAML **1**, AST **1**, estrutura **23/23**,
`bash -n` **3/3**, digest **5/5**, **57 referências/13 fragmentos** e
UTF-8/NUL/newline/whitespace/diff-check documental PASS. A fixture inicial
duplicava artificialmente um run e falhou; corrigida só em memória, rerun
integral green. Sem novo Maven: os seis testes B continuam relato do engenheiro
às **21:09:28Z**. `actionlint`/`shellcheck` indisponíveis; sem rede, Docker,
serviços, release ou publicação. Não são execuções do agente documental nem
revisão desta escrita de fecho. [Proveniência e limites](verification.md#documentacao-abc-20261118).

Executar C remotamente exige **aprovação separada**: criar prerelease publicada
aciona push GHCR; push/CI prévios podem ter efeitos Render por `checksPass`.
Configuração não é publicação ou aceitação do cliente; a revisão PASS é local,
não prova atomicidade API/registry nem scan/igualdade do digest reconstruído.
Logs JSON não sanitizam automaticamente dados sensíveis; usar só dados fictícios,
sem corpos/passwords/tokens/cookies. [Operação e restrições](development.md#prerelease-de-teste-ghcr)
e [proveniência detalhada](verification.md#documentacao-abc-20261118).

## 3. Problemas encontrados e soluções

| Problema | Solução e aprendizagem |
|---|---|
| Dificuldades com Keycloak na fase de deployment, relatadas pelo autor | Retirar a dependência do IdP e adotar autenticação local com sessão, scrypt e CSRF. Adequar a complexidade ao ambiente da demonstração, sem apresentar esta escolha como identidade pronta para produção. |
| Atualização de dependências e compatibilidade | Migração aprovada para Spring Boot 4, adaptação ao Jackson e verificação do contrato, testes e scans. Atualizar versões exige validar comportamento, não apenas eliminar alertas. |
| Assertion de foco pós-registo falhava temporalmente no CI | As três assertions passaram a esperar pela condição com `waitFor`, sem sleeps nem alteração da aplicação. A presença da mensagem de sucesso não garante que o efeito de foco já terminou. |
| Dupla confirmação ao fechar o detalhe em página | Correção da coordenação entre toolbar e guard de navegação, mantendo a proteção de rascunhos e testes de regressão. |
| Novo finding HIGH após scans históricos sem HIGH/CRITICAL | Exceção exata, temporária e visível, aprovada pelo autor. Um scan anterior não garante ausência futura de alertas; aceitar risco não equivale a corrigi-lo. |

A substituição Keycloak→autenticação local está documentada no [ADR-0002](adr/0002-local-session-authentication.md); a motivação de deployment foi confirmada pelo autor. Os restantes diagnósticos e verificações constam de [verification.md](verification.md).

## 4. Utilização de agentes e modelos de IA

O GitHub Copilot apoiou análise, planeamento, implementação, documentação e revisão. Segundo informação fornecida pelo autor, os modelos utilizados foram **maioritariamente**:

| Atividade | Modelo |
|---|---|
| Planeamento | **GPT-6.1 Sol** |
| Orquestração e implementação | **GPT-6 Luna** |

Esta distribuição descreve a utilização predominante relatada, não um inventário técnico de todas as sessões. Não é atribuída uma identidade de modelo a cada agente ou revisão sem registo.

O **Planeador Matriz** apoiou especificação e decomposição; o **Orquestrador Matriz** coordenou tarefas aprovadas; os engenheiros de **Backend**, **Frontend** e **Documentação e Configuração** executaram trabalho delimitado; o **Revisor Matriz** conferiu alterações e evidências em leitura.

No incremento de usabilidade, o Spec Kit ajudou a organizar especificação, plano e tarefas. As decisões, aprovações e validação humana mantiveram-se necessárias. O fluxo seguido foi analisar, propor, aprovar, implementar, verificar e rever, preservando o trabalho existente.

Exemplos concretos: conciliar requisitos antes da implementação, rever a substituição da autenticação e investigar falhas de testes sem alterar requisitos apenas para obter resultados verdes. A IA foi usada no desenvolvimento; não é uma funcionalidade do produto.

Referências: [agentes](../.github/agents/), [desenvolvimento e Spec Kit](development.md#agentes-e-spec-kit) e [regras do projeto](../AGENTS.md).

## 5. Limitações e trabalho pendente

- **Âmbito académico:** sem aceitação do cliente ou prontidão de produção; utilizar apenas dados fictícios. A demonstração Render é temporária, não garantia de disponibilidade.
- **Identidade:** registo sem prova de posse do email, sem recuperação de palavra-passe ou envio de email. Sessões e throttles em memória por instância não sobrevivem ao reinício.
- **Evidência:** o relato CI remoto preexistente requer reconciliação do repositório/proveniência; não cobre B/C locais. Prova negativa controlada da política, uploads/retenção reais e entrega portável de evidência externa não confirmados nesta síntese. Resultados de fases distintas não são somados nem atualizados retroativamente.
- **Desafios opcionais:** A conserva HIGH aceite temporariamente, não remediado;
  B tem seis testes selecionados relatados, não uma nova suite backend completa;
  C não tem publicação remota comprovada e exige aprovação separada.
  Revisão independente local B/C PASS por relato pós-F1, sem aproveitar gates
  antigos como nova aprovação ou encerrar revisões de outros incrementos.
- **Segurança e acessibilidade:** testes, revisão e Axe em cenários selecionados não constituem pentest, certificação de segurança ou conformidade WCAG integral. A validação de anexos não é antivírus ou certificação de PDF.
- **Operação:** capacidade de anexos/histórico, backups/recuperação, política de retenção e carga/alvo p95 continuam por definir. Não há purga automática aprovada.

A entrega deve identificar a branch/commit final e garantir acesso do formador ao repositório. O relatório não substitui essa confirmação nem as evidências detalhadas.
