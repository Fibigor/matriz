---
name: validacao-matriz
description: "Escolha e execucao segura de verificacoes existentes da Matriz, com registo fiel de comandos, resultados e limitacoes."
---

# Validacao da Matriz

## Escolher verificacoes

1. Consultar `AGENTS.md`, o README e os scripts/manifests atuais antes de escolher um comando.
2. Executar a verificacao mais pequena que cobre o comportamento alterado; alargar apenas se a alteracao ou uma falha o justificar.
3. Nao instalar dependencias nem criar novos comandos de teste sem aprovacao.
4. Distinguir verificacoes executadas agora de resultados historicos em `docs/verification.md`.

## Comandos documentados

Na raiz do repositorio:

```powershell
mvn -f backend\pom.xml test '-Dapi.version=1.44'
```

Para frontend, dentro de `frontend`:

```powershell
npm test
npm run build
```

Os E2E (`npm run test:e2e`) precisam de API, Vite e seed local disponiveis, ou de `PLAYWRIGHT_BASE_URL=http://localhost:8080` para o Compose. Confirmar que o ambiente foi autorizado e esta pronto antes de os executar; nao iniciar nem parar servicos alheios.

## Protecao do ambiente

- Nao ler/imprimir segredos. Nao substituir `.env` por `.env.example`; o README descreve como preparar a configuracao com seguranca.
- Nunca usar `docker compose down -v` nem apagar volumes, bases de dados, dados de demonstração ou artefactos de outras tarefas.
- Nao executar migrations, testes destrutivos, deploy ou workflows contra servicos reais sem autorizacao explicita.
- Se um comando nao puder ser executado, reportar o impedimento e nao inferir sucesso.

## Registo do resultado

Para cada verificacao, indicar comando, diretoria/ambiente quando relevante, resultado observado e falhas. Nao chamar um build de prova de acessibilidade, seguranca ou prontidao de producao. Resultados de uma execucao anterior devem ser identificados como historicos, com a referencia e data documentadas.
