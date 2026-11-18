# ADR-0002 — Autenticação local com sessão no servidor

- **Estado:** Aceite
- **Ficha de referência:** [Ficha Prática 03 — 29/10/2026](https://moodle.esmad.ipp.pt/mod/resource/view.php?id=4838).
- **Data da decisão OIDC/Keycloak:** 30/10/2026.
- **Data da decisão posterior de substituir OIDC/Keycloak por autenticação local:** Não registada nos documentos consultados.

## Contexto

A demonstração necessita de autenticação sem depender de um IdP externo. Uma abordagem OIDC/Keycloak foi usada anteriormente, mas foi substituída pela decisão de autenticação local. **Na decisão original**, o âmbito aprovado não incluía registo público nem recuperação de palavra-passe; a evolução académica posterior está registada abaixo.

## Decisão

Usar contas previamente disponibilizadas, autenticadas por email e palavra-passe. O backend usa Spring Security, hashes scrypt e sessão mantida no servidor. CSRF protege o login e as restantes operações de escrita; o cookie de sessão usa HttpOnly e SameSite Strict, com Secure quando configurado para HTTPS.

## Consequências

- Não é necessário configurar um IdP externo para a demonstração.
- Na decisão original, as contas eram previamente provisionadas, sem registo público nem recuperação de palavra-passe.
- O frontend tem de obter e enviar o token CSRF nas escritas.
- Reiniciar o backend invalida as sessões existentes.
- O modelo serve a demonstração aprovada; não equivale à validação de uma política de identidade para produção.

## Evolução académica — 17 e 18-11-2026

Em **17-11-2026**, o autor aprovou acrescentar registo público exclusivamente académico, sem substituir sessão local/scrypt/CSRF. Conta ativa imediatamente, sem confirmação/envio de email; POST público com CSRF, sucesso 201 apenas mensagem «Conta criada. Inicie sessão.», regresso ao login **sem auto-login**. Recuperação de palavra-passe continua excluída. Divulgação de email existente por 409 e throttle independente foram aceites no âmbito documentado em RF-17/RN-20–22.

O delta de **18-11-2026** estabelece o mínimo de registo em 6 pontos de código brutos (máximo técnico 200, sem trim/truncagem/composição); login mantém compatibilidade com passwords antigas curtas. Não exige nova migration ou IdP. [Estado e evidência atuais](../verification.md#estado-vigente--18-11-2026). Aprovação do autor não é validação do cliente ou identidade de produção. A data desconhecida da substituição OIDC→local permanece desconhecida; estas datas não a reconstituem.

## Alternativas consideradas

- **OIDC/Keycloak:** abordagem histórica, substituída pela autenticação local atual.
- Não há evidência documental de avaliação de outros fornecedores ou fluxos de identidade.

## Referências

- [Arquitetura](../architecture.md), identidade e ciclo de acesso.
- [Plano de implementação](../implementation-plan.md), decisões validadas pelo autor.
- [Verificação](../verification.md), migração de autenticação e resultados.
