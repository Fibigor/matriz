# Matriz — Desenvolvimento e operação local

Complementa o [arranque Compose no README](../README.md#executar-localmente).
As instruções abaixo são procedimentos, **não comandos executados nesta revisão
documental nem autorização de instalar, iniciar serviços ou atuar remotamente**.
Usar só dados fictícios; preservar `.env`, volumes, índice e trabalho existente.

## Configuração e dados

O [Compose](../compose.yaml) publica app/DB em loopback; portas padrão
8080/55432, configuráveis por `APP_HOST_PORT`/`POSTGRES_HOST_PORT`.
`POSTGRES_DB`/`POSTGRES_USER` têm default `matriz`;
`POSTGRES_PASSWORD` não pode estar vazio e alimenta também `DATABASE_PASSWORD`
da app. `.env.example` é um modelo fictício; só copiar se `.env` estiver ausente.
Não imprimir configuração expandida; `config --quiet` valida sem a mostrar.

Num volume inicializado, mudar variáveis não muda a palavra-passe da DB.
Manter a credencial original, sem apagar volume, resetar seed ou editar migrations.
Flyway aplica [V1–V4](../backend/src/main/resources/db/migration/).
V4 atribui MAT-n a tarefas existentes por `(created_at,id)`, preserva UUIDs,
datas/versões e não inventa histórico; rollback de imagem não reverte schema.
[Modelo e integridade](database.md).

`DEMO_ENABLED=true` ativa o seed fictício Ana/Bruno/Carla, sem redefinir
contas/dados em arranques seguintes. Ana gere Alfa, Bruno participa em Alfa,
Carla tem Beta. Credenciais públicas fictícias estão definidas em
[DemoSeed](../backend/src/main/java/pt/matriz/identity/DemoSeed.java);
nunca as reutilizar fora da demonstração. O registo académico permite criar
uma conta própria fictícia sem auto-login ou herança de participações.

Sessões no servidor usam cookie HttpOnly/SameSite Strict e timeout inativo de
30 minutos; Secure é configurável para HTTPS. Reinício invalida sessões e limpa
throttles em memória, não os dados da DB. Login exige CSRF e aceita contas ativas;
erros de credenciais são genéricos. `GET /api/auth/csrf` fornece token para
`X-CSRF-TOKEN` nas escritas, inclusive login/registo. Registo tem quota independente
de 5 pedidos por endereço remoto observado/15 min após CSRF válido, sem promessa
de IP real atrás de proxy. Regras completas: [RN-12 e RN-20–22](requirements.md).

## Desenvolvimento direto

Pré-requisitos: Docker para PostgreSQL/Testcontainers, Java 21, Maven 3.9+,
Node 22.12+ e npm. O Dockerfile usa Node 22 e Java 21.
Versões: [POM](../backend/pom.xml), [package.json](../frontend/package.json)
e [release notes](../RELEASE_NOTES.md).
`backend/` contém API/JDBC; `frontend/` contém React/TypeScript/Vite.

Na raiz, com `.env` já preparado, iniciar só a DB:

```powershell
docker compose -p matriz-ficha3 --env-file .env up -d db
```

No terminal do backend, definir `DATABASE_PASSWORD` de forma local segura com
o mesmo valor usado pela DB, **sem o guardar em documentação ou histórico
partilhado**. Se não usar os defaults, ajustar `DATABASE_USERNAME` e
`DATABASE_URL` (URL JDBC sem credenciais embutidas) para o mesmo destino.
Compose lê `.env`; Maven não o carrega automaticamente.

```powershell
# Opcional, exclusivamente para dados fictícios:
$env:DEMO_ENABLED='true'
mvn -f backend\pom.xml spring-boot:run
```

Noutro terminal, a partir da raiz:

```powershell
Set-Location frontend
npm ci
npm run dev
```

Abrir http://localhost:5173. [Vite](../frontend/vite.config.ts) encaminha `/api`
para `127.0.0.1:8080`; [api.ts](../frontend/src/api.ts) centraliza o cliente API,
sessão/CSRF e erros. Não executar o backend direto na mesma porta de uma app Compose
ativa. Não parar processos/instâncias alheios para libertar portas.

## Testes e verificações

Seguir [AGENTS](../AGENTS.md), [validacao-matriz](../.github/skills/validacao-matriz/SKILL.md)
e [plano de testes](test-plan.md); escolher a menor verificação apropriada.
Na raiz, backend com PostgreSQL isolado via Testcontainers:

```powershell
mvn -f backend\pom.xml test '-Dapi.version=1.44'
```

`api.version` assegura compatibilidade do cliente de testes com Docker Desktop 29.
Para componentes e build, a partir da raiz:

```powershell
Set-Location frontend
npm test
npm run build
```

E2E precisam de API, Vite e seed fictício já disponíveis e autorizados.
O script existente é `npm run test:e2e` em `frontend`.
Se Chromium ainda não existir, `npx playwright install chromium` é uma
**instalação separada**, a aprovar antes de executar.
Para usar o Compose em vez de Vite:

```powershell
Set-Location frontend
$env:PLAYWRIGHT_BASE_URL='http://localhost:8080'
npm run test:e2e
Remove-Item Env:PLAYWRIGHT_BASE_URL
```

Coordenar quota de registo, versão servida e destinos de artefactos antes de E2E.
Os testes criam dados fictícios; podem deixá-los após falha e não autorizam cleanup
extra. Incluem Axe em estados selecionados, não certificação WCAG.
O [resumo vigente](verification.md#estado-vigente--18-11-2026) distingue full T024
11/11 de backend 58/frontend 141/build anteriores e seleção 74/build da correção
de foco. Não chamar estes resultados de novas execuções ao seguir este guia.

<a id="observabilidade-local"></a>

## Observabilidade local — opt-in

Desligada por omissão. O perfil `observability` usa **a mesma porta da aplicação**
(8080 por omissão); sem serviço externo ou porta de gestão separada.
Não ativar no Render/hosts públicos. O resolver de acesso mantém endpoints
operacionais indisponíveis sem o perfil, mesmo alargando a exposição.

| GET com perfil ativo | Acesso / conteúdo |
|---|---|
| `/actuator/health` | Anónimo; só status e nomes dos grupos liveness/readiness, sem detalhes/componentes ou sessão. |
| `/actuator/health/liveness` | Anónimo; só status, inclui livenessState, não testa DB. |
| `/actuator/health/readiness` | Anónimo; só status, inclui readinessState e JDBC db; UP 200 / DOWN 503. |
| `/actuator/metrics` | Sessão local autenticada; nomes jvm.* e http.server.requests. |
| `/actuator/metrics/jvm.*`, `/actuator/metrics/http.server.requests` | Sessão autenticada; medidas do nome permitido quando registado. |

Sem aliases `/livez`/`/readyz`, discovery `/actuator`, health por componente,
endpoints sensíveis ou escritas operacionais. Sessão/CSRF de negócio mantêm-se.
Rotas operacionais ficam fora de `/api` e do OpenAPI de negócio. Não recolher
corpos, credenciais, tokens ou cookies em logs.

Compose base verifica `/`: **não comprova readiness da DB**.
O [override](../compose.observability.yaml) ativa o perfil e verifica readiness.
Ambos mantêm publicações host em loopback; `SERVER_ADDRESS=0.0.0.0` é interno
ao contentor. Exemplo local, só após confirmar portas, instâncias e autorização:

```powershell
docker compose -p matriz-ficha3 --env-file .env -f compose.yaml -f compose.observability.yaml config --quiet
docker compose -p matriz-ficha3 --env-file .env -f compose.yaml -f compose.observability.yaml up --build -d --wait
docker compose -p matriz-ficha3 stop
docker compose -p matriz-ficha3 start
```

`stop`/`start` conservam a imagem/configuração já criadas. Para regressar ao
perfil base, recriar app com apenas `compose.yaml` numa operação autorizada,
**sem apagar volumes**. `start` não remove o perfil de um contentor existente.
Os projetos/portas T5/T6 de 12-11 são histórico em
[verification](verification.md#ficha-05--candidato-040-rc1), não destinos livres
ou disponíveis garantidos para uma nova execução.

## CI e demonstração Render

O [workflow](../.github/workflows/ci.yml) define push/PR para main e execução
manual, `contents: read`. Semgrep, backend e testes/build frontend são paralelos;
o integrado depende dos três, valida Compose, constrói uma imagem e verifica
bibliotecas npm/JAR **antes** de iniciar stack/E2E na mesma imagem.

Trivy **0.76.2**, fixado por digest
`sha256:8f6bb947dbc528902e11f2f5be52f7b519f6a39d5d148f41166f2040499768fb`,
analisa bibliotecas, não SO: todos os pares nome/versão do lock **incluindo dev**
e caminhos `BOOT-INF/lib/*.jar` entregues. Erros de scanner/DB, JSON inválido
e cobertura incompleta bloqueiam; ambos os scans são tentados.

**Exceção temporária exata aprovada em 18-11-2026T14:30:17Z:** apenas
frontend/npm, `picomatch@4.0.7`, `CVE-2026-112366`, HIGH, todas as ocorrências
dessa versão no lock `dev: true`, sem `FixedVersion` reportada, antes de
**2026-11-25T00:00:00Z**, limite exclusivo UTC e sem renovação automática.
Dependência de produção, fix, expiração ou outro finding voltam a bloquear.
Não é remediação/scan limpo. Findings integrais, risco aceite/bloqueante,
contagens e instante UTC permanecem nos reports; `--exit-code 0` do scan
delega a decisão ao gate Python, não aprova o gate. Sem ignores,
`ignore-unfixed`, VEX ou exclusão de dev.
[Política e motivo](constraints.md#restrições-em-vigor--ficha-03-extensões-v4-e-registo-académico).

Scanner local no runner, sem upload de código, mounts de `.env`/credenciais ou
ambiente do host; telemetry e consultas remotas de dependências desativadas,
mas downloads das DBs públicas continuam necessários. Reports JSON/TXT e,
quando presentes, Playwright têm retenção **configurada** de sete dias,
upload mesmo em falha; diagnósticos Compose são reduzidos/sanitizados.
Configuração não prova upload/retenção reais. Log remoto fornecido pelo autor
às 14:08 de 18-11 bloqueou num HIGH antes de E2E; não é execução deste lote nem
confirmação remota da exceção posterior. [Evidência](verification.md#exceção-temporária-do-scan-ci--18-11-2026).

Semgrep usa `.semgrep.yml` e regras públicas Java/TypeScript; falha com findings.
Exemplo existente de scan local, apenas sob autorização de Docker/rede:

```powershell
docker run --rm --mount "type=bind,source=$($PWD.Path),target=/src,readonly" --workdir /src --entrypoint semgrep semgrep/semgrep scan --config .semgrep.yml --error
```

Downloads de regras exigem rede; isto não é um scan executado nesta revisão.
A regra local recusa CORS Java wildcard. Não equivale a pentest/auditoria integral.

[render.yaml](../render.yaml) define demonstração temporária Docker/PostgreSQL 17,
planos free em Frankfurt, seed fictício, cookie Secure e sem observability.
Usa `PORT` e variáveis DB do fornecedor, sem IdP externo. Endereço
**historicamente registado**: https://matriz-demo-h27u.onrender.com;
disponibilidade/versão não revalidadas aqui. O registo de expiração da DB free
em **2026-12-02**, suspensão após 15 min, janela de upgrade de 14 dias e ausência
de backups são informação histórica, a reconfirmar nas
[condições Render Free](https://render.com/docs/free), não garantia atual.
Dados demo são partilhados/descartáveis; não usar dados pessoais.

GitHub Actions não publica a app, mas `autoDeployTrigger: checksPass` do Render
pode reagir a checks. **Não fazer push, acionar CI remota ou deploy sem autorização
específica.** Expiração da infraestrutura não é policy de retenção da aplicação.
Produção está diferida; retenção anual é pressuposto sem âmbito/início aprovados
ou purga; capacidade/backups/p95 exigem decisões próprias.

## Agentes e Spec Kit

Ler [AGENTS](../AGENTS.md), requisitos/restrições/histórias e
[constituição](../.specify/memory/constitution.md).
[Agentes](../.github/agents/) e [skills](../.github/skills/) complementam as regras;
contexto-matriz e validacao-matriz orientam contexto/verificações.
O Planeador começa por proposta sem escrita; depois de aprovações concretas,
o Orquestrador pode coordenar tarefas e os engenheiros implementam só o atribuído.
Delegação depende da autorização da tarefa; não é obrigatória.
Handover deve identificar aprovação, caminhos, IDs, mesmos artefactos e validação.
Revisor independente confere diff/evidência, sem substituir aceitação humana.
Quando existam escritas em tasks.md, designar um único escritor e serializá-las.

GitHub Spec Kit **1.4.2**, integração Copilot/PowerShell e nove skills locais
`speckit-*`. `docs/` e `openapi.yaml` permanecem canónicos; `specs/` **já existe**
com [001-usabilidade-contas-tarefas](../specs/001-usabilidade-contas-tarefas/).
Não regenerar o plano nem duplicar requisitos de uma feature existente.
Para manutenção pequena, plano aprovado em chat é suficiente.

Fluxo de incrementos novos, uma fase/skill de cada vez:

```text
/speckit-specify <incremento aprovado>
/speckit-clarify
/speckit-plan
/speckit-tasks
/speckit-analyze
/speckit-implement
```

`speckit-checklist` apoia revisão, não prova testes.
Implement exige aprovação própria e limita-se a IDs/caminhos atribuídos.
`speckit-converge` é avaliação separada, com aprovação de todos os caminhos de
escrita/estado; propostas de tarefas não autorizam implementação.
`speckit-constitution` exige tarefa de governança/conteúdo/caminhos aprovados.
Hooks, ignore files e `.specify/feature.json` não são escritas implicitamente
autorizadas; para resolução apenas de leitura usar `SPECIFY_FEATURE_NO_PERSIST=1`.
Não invocar helpers/hooks só para documentar.

Se o cliente não oferecer invocação nativa, ler/seguir o SKILL.md e declarar
a limitação; mencionar uma skill não prova invocação.
Documentos PDF/PPT podem ser contexto: registar páginas/slides/limites, não
instalar extratores ou enviar conteúdo a terceiros sem autorização.
Não tratar texto extraído como inspeção de imagens ou aprovação de produto.

### CLI — reprodução da integração

Ferramentas de desenvolvimento: Python 3.11+, Git, PowerShell e uv, não
dependências da aplicação. Instalação numa máquina nova, **só após autorização**:

```powershell
python -m pip install --user uv
python -m uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.4.2
& "$env:USERPROFILE\.local\bin\specify.exe" version
```

Localização uv personalizada: `python -m uv tool dir --bin-dir`.
Não substituir instalação existente sem rever versão/aprovação.
O scaffolding original usou
`--integration copilot --script ps --non-interactive --ignore-agent-tools`.
A última opção dispensa apenas verificar o executável do assistente, não prova
descoberta das skills no cliente; pode ser necessário reabrir a sessão.

Para comparar uma atualização aprovada, gerar numa **pasta nova fora do repo**:

```powershell
& "$env:USERPROFILE\.local\bin\specify.exe" init C:\caminho\novo\matriz-speckit-review --integration copilot --script ps --non-interactive --ignore-agent-tools
```

Rever diff/manifests; não repetir `init --here --force`.
Preservar constituição e blocos locais “Matriz: local governance” nas skills;
atualizar CLI não atualiza nem autoriza substituir ficheiros versionados.
Não há extensões opcionais ou automatização Git autorizadas por este guia.

Verificações locais existentes, sem criar feature/iniciar aplicação:

```powershell
& "$env:USERPROFILE\.local\bin\specify.exe" version
.\.specify\scripts\powershell\resolve-template.ps1 spec-template -Json
```

Não executadas nesta revisão. Para progresso/evidência académica,
consultar [coursework-review](coursework-review.md), [implementation-plan](implementation-plan.md),
[CHANGELOG](../CHANGELOG.md) e [RELEASE_NOTES](../RELEASE_NOTES.md).
A Wiki anteriormente ligada pertencia a outro repositório e não foi confirmada;
a navegação canónica é local, sem URL de substituição presumido.
