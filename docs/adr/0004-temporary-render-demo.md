# ADR-0004 — Publicar uma demonstração temporária no Render

- **Estado:** Aceite
- **Ficha de referência:** [Ficha Prática 03 — 29/10/2026](https://moodle.esmad.ipp.pt/mod/resource/view.php?id=4838), que pediu um modelo visual publicado para demonstração.
- **Data da decisão de usar Render para a demonstração:** 30/10/2026.
- **Data do primeiro deploy:** Não registada nos documentos consultados.

## Contexto

Uma demonstração acessível remotamente permite apresentar a interface sem exigir que cada pessoa prepare o ambiente local. A necessidade é demonstrativa; não constitui um requisito de produção nem aprova o uso de dados reais.

## Decisão

Disponibilizar temporariamente a aplicação Matriz no Render, na região Frankfurt, usando o Blueprint em `render.yaml`, planos gratuitos e dados fictícios. O backend e a interface da demonstração estão publicados em [https://matriz-demo-h27u.onrender.com](https://matriz-demo-h27u.onrender.com).

## Consequências

- As contas e os dados de demonstração são partilhados e podem ser alterados pelos visitantes; não usar dados pessoais ou confidenciais.
- O serviço gratuito pode suspender-se após inatividade. A base de dados gratuita atual, com duração de 30 dias, expira em 2 de dezembro de 2026; os limites e a data operacional estão registados em [verification.md](../verification.md).
- A expiração da base de alojamento não define a retenção dos dados ao nível da aplicação.
- Esta publicação serve apenas para demonstração. Não implica prontidão nem autorização de operação em produção.

## Alternativas consideradas

- **Demonstração apenas local:** não satisfaz a necessidade de apresentar um modelo acessível remotamente.
- Não há evidência documental de avaliação comparativa de outros fornecedores de alojamento.

## Referências

- [Blueprint Render](../../render.yaml).
- [Verificação](../verification.md), estado atual, URL e ciclo de vida da instância.
- [Restrições](../constraints.md), âmbito temporário e limites conhecidos.
