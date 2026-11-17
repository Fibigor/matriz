# Arquitetura — documentação atual e arquivo

Organização autorizada em **17-11-2026**, a partir da worktree observada com HEAD `778ffd1ff8cfa366b444edbb0cc21bcc9f9b28d2`. Numeração **documental**, distinta de versões de aplicação e migrations SQL. O candidato mantém `0.4.0-rc.1`. Ficheiros preparados na worktree; sem commit/tag/publicação nesta tarefa.

| Estado com proveniência | Conteúdo | Interpretação |
|---|---|---|
| [V1 arquitetura](v1/architecture.md) / [dados](v1/database.md) | Cópias integrais dos dois documentos encontrados em 17-11, antes desta edição, com apenas destinos relativos de links ajustados. | Misturam implementação de 13-11 e histórico da ficha 02. Não reconstruir nem atribuir-lhes uma baseline pura de outubro. Datas, conclusões, diagramas e limitações antigos mantidos. |
| [V1 SVG](v1/ui/wireframe.svg) / [PNG](v1/ui/wireframe.png) | Wireframe histórico transferido de `docs/ui/`, sem alteração de bytes. | Responsável único e API parcial são legítimos nesse histórico, mas não representam o produto atual. A associação à ficha 02 consta dos documentos de origem. |
| [Arquitetura atual](../architecture.md) / [dados](../database.md) / [wireframe](../ui/wireframe.svg) | Documentação atual completa, redigida em 17-11 por confronto com código, contrato e requisitos em vigor; consolidada nos caminhos canónicos após T1/T2. | Extensões aprovadas pelo autor em 13-11, não aceitação do cliente. Wireframe representativo, não screenshot nem prova de acessibilidade/renderização. |

**V3 não criada:** só uma evolução real e aprovada justificará outro estado; não se inventam fases intermédias. Entradas canónicas: [arquitetura](../architecture.md), [dados](../database.md) e [UI](../ui/README.md). [OpenAPI](../../openapi.yaml) e [ADRs](../adr/README.md) permanecem nos caminhos existentes, sem renumeração/cópia versionada do contrato.

**Consolidação posterior — 17-11-2026:** T1/T2 tinham separado a documentação atual sob a designação V2. Por preferência expressa do utilizador, o conteúdo completo passou para os caminhos canónicos acima e foram removidos os três ficheiros da cópia documental separada e os seus diretórios vazios. Não houve nova evolução funcional. V1 ficou byte a byte como encontrado antes desta consolidação; as migrations SQL, incluindo V2, não foram alteradas. No SVG atual retirou-se apenas “V2” dos dois títulos; os restantes bytes foram preservados.

## Proveniência e integridade

SHA-256 dos ficheiros **originais**, antes de arquivo/rebase de links:

| Origem | Bytes | SHA-256 |
|---|---:|---|
| `docs/architecture.md` | 30293 | `b3383ef3bf7c2c60f2783f817be14f805073301e1592ac71d8dfd2d6cf19be52` |
| `docs/database.md` | 17502 | `b58eadf5a3cf422fdd237ef88a9b84e4fbd124c293004f46a3cb20a4da7c3767` |
| `docs/ui/wireframe.svg` | 7316 | `4bd48889a57895f09b2450b96ff215b050f075d86181d5ec23421b73b3f0d5a4` |
| `docs/ui/wireframe.png` | 122403 | `d9233b385844ee95bca70c5c3edf42cc0704dcc1319d0bf6888c557778a80369` |

Os MD arquivados têm hashes novos por ajuste dos destinos relativos; não foram reescritos factos, títulos, textos ou diagramas. Links `architecture.md` entre os dois arquivos continuam locais; `ui/` aponta para os bytes históricos. Links de requisitos, evidência, README, release notes e contrato sobem até aos caminhos canónicos atuais: não congelam essas fontes como se fossem versões antigas. A referência histórica “duas operações” não descreve o OpenAPI atual.

A comparação e DEC-01 mantêm destino explícito via [entrada canónica](../architecture.md#comparação-de-alternativas-e-dec-01), incluindo as referências textuais existentes nos ADRs. A documentação é arquivo/rastreabilidade, não auditoria nem resolução retroativa das pendências.

## Fontes e limites

A documentação atual usa os módulos Java `identity`, `projects`, `tasks`, `common`, migrations V1–V4, frontend, Dockerfile, Compose, segurança e configuração operacional; liga as fontes concretas nas páginas. [Verificação](../verification.md) conserva os resultados documentados de 12/13-11. Não foram reexecutados testes, scans, workflows ou serviços, nem consultados logs externos nesta reorganização. Sem renderização Mermaid ou prova visual do novo SVG por esta escrita; as verificações estáticas são registadas separadamente.
