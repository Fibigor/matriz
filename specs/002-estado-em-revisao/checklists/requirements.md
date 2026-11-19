# Specification Quality Checklist: Estado «Em revisão»

**Purpose**: Rever a qualidade dos requisitos antes de solicitar a fase de planeamento.
**Created**: 2026-11-18
**Feature**: [spec.md](../spec.md)
**Review Ownership**: Revisão de qualidade pelo Planeador na execução de `speckit-specify`.
**Marker Semantics**: `[x]` significa requisito revisto; não significa implementação ou teste executado.

## Content Quality

- [x] Sem detalhes de implementação: linguagens, frameworks e desenho de interfaces técnicas não são prescritos.
- [x] Foco no valor para o participante e nas condições de conclusão.
- [x] Texto orientado a intervenientes não técnicos; referências canónicas ficam na secção de fontes.
- [x] Todas as secções obrigatórias do template composto estão preenchidas.

## Requirement Completeness

- [x] Não restam marcadores de clarificação por resolver.
- [x] Requisitos verificáveis, incluindo origem imediata em revisão e ausência de novos papéis.
- [x] Critérios de sucesso mensuráveis por percursos, recusas, preservação e contagens.
- [x] Critérios de sucesso independentes das escolhas técnicas de implementação.
- [x] Cenários de aceitação definidos para conclusão, visibilidade e compatibilidade.
- [x] Casos de fronteira incluem estados antigos, bloqueadores, reabertura, motivo e concorrência.
- [x] Âmbito e exclusões explícitos.
- [x] Dependências, preservações e conflito com a permissão atual de conclusão direta identificados.

## Feature Readiness

- [x] FR-001 a FR-010 têm critérios de aceitação rastreáveis nas histórias.
- [x] Histórias cobrem entrada em revisão, conclusão, devolução, consulta e dados anteriores.
- [x] SC-001 a SC-006 permitem verificar os resultados sem depender da implementação.
- [x] A especificação descreve o comportamento, remetendo decisões técnicas para o plano.

## Notes

- As três decisões de comportamento foram recolhidas nesta conversa antes da escrita:
  revisão obrigatória, qualquer participante ativo pode concluir e entrada direta
  a partir de «Por fazer» permitida.
- Revisão de qualidade desta especificação: 16/16 critérios satisfeitos.
- Foi usado o conteúdo devolvido por
  `.specify\scripts\powershell\resolve-template.ps1 spec-template -Json`;
  a resolução terminou com exit 0.
- Não foi criada branch nem executado qualquer hook. Não existe
  `.specify\extensions.yml` no inventário consultado.
- A aprovação recebida abrange apenas `spec.md`, este checklist e
  `.specify\feature.json`. Não autoriza plano, tarefas ou implementação.
- `plan.md` e `tasks.md` ainda não existem nesta feature; `speckit-analyze`
  não foi executado porque esses pré-requisitos não estão presentes.
- Não foram executados testes da aplicação; os cenários são critérios futuros.
