# ADR-0002 — Autenticação local com sessão no servidor

- **Estado:** Aceite
- **Ficha de referência:** [Ficha Prática 03 — 29/10/2026](https://moodle.esmad.ipp.pt/mod/resource/view.php?id=4838).
- **Data da decisão OIDC/Keycloak:** 30/10/2026.
- **Data da decisão posterior de substituir OIDC/Keycloak por autenticação local:** Não registada nos documentos consultados.

## Contexto

A demonstração necessita de autenticação sem depender de um IdP externo. Uma abordagem OIDC/Keycloak foi usada anteriormente, mas foi substituída pela decisão de autenticação local. O âmbito aprovado não inclui registo público nem recuperação de palavra-passe.

## Decisão

Usar contas previamente disponibilizadas, autenticadas por email e palavra-passe. O backend usa Spring Security, hashes scrypt e sessão mantida no servidor. CSRF protege o login e as restantes operações de escrita; o cookie de sessão usa HttpOnly e SameSite Strict, com Secure quando configurado para HTTPS.

## Consequências

- Não é necessário configurar um IdP externo para a demonstração.
- As contas são previamente provisionadas; não existe registo público nem recuperação de palavra-passe.
- O frontend tem de obter e enviar o token CSRF nas escritas.
- Reiniciar o backend invalida as sessões existentes.
- O modelo serve a demonstração aprovada; não equivale à validação de uma política de identidade para produção.

## Alternativas consideradas

- **OIDC/Keycloak:** abordagem histórica, substituída pela autenticação local atual.
- Não há evidência documental de avaliação de outros fornecedores ou fluxos de identidade.

## Referências

- [Arquitetura](../architecture.md), identidade e ciclo de acesso.
- [Plano de implementação](../implementation-plan.md), decisões validadas pelo autor.
- [Verificação](../verification.md), migração de autenticação e resultados.
