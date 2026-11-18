# Delta proposto sobre openapi.yaml

Data: 2026-11-17. Fonte canónica: [openapi.yaml](../../../openapi.yaml). Aplicação com base `/api`. Este ficheiro é desenho P1, **não contrato completo alternativo**, nem autorização para editar OpenAPI/backend/frontend.

## 1. POST /api/auth/register

No schema canónico `RegistrationRequest.password`, mudar **apenas** `minLength: 12` para `minLength: 6`. Manter string/writeOnly, máximo 200 pontos de código Unicode, sem trim/truncagem/composição obrigatória; espaços contam.

Delta de mensagens 422/field password:

| Condição | `detail` e `errors[].message` propostos |
|---|---|
| null ou menos de 6 pontos de código | `Mínimo de 6 caracteres` |
| mais de 200 pontos de código | `Palavra-passe demasiado longa` |

Não divulgar número máximo nesses erros de registo. O máximo permanece **documentado no contrato técnico**; ocultação exigida é da interface de registo/erros, não remoção da regra de API. Nome `RegistrationRequest` confirmado por leitura do OpenAPI nesta P1.

Sem delta em campos displayName/email/JSON, confirmação só local, segurança pública com CSRF, quota/429/Retry-After, duplicado 409, resposta 201 só mensagem e ausência de autenticação/dados de conta. Login conserva mínimo não vazio, máximo 200 e mensagens/status existentes.

## 2. POST /api/projects/{projectId}/members

Operação canónica `addMember`, mantendo sessão+CSRF, gestor, JSON, 204 sem corpo (participação criada **ou já existente**).

No request inline atual:

- Manter objeto fechado (`additionalProperties:false`).
- Substituir obrigatoriedade única `[userId]` por alternativa exclusiva de **presença**: `oneOf` com required `[userId]` ou required `[email]`. Declarar ambos como propriedades no objeto; quando ambos presentes, ambas as alternativas validam required e o oneOf falha. Não aceitar uma propriedade null para contornar XOR.
- `userId`: manter `$ref` Id exato, sem normalizar IDs.
- `email`: reutilizar schema `LocalEmail` existente para sintaxe/comprimento/normalização; não introduzir formato HTML/regex mais restritiva nem diretório. Validar comprimento depois da normalização como no contrato vigente, não no valor bruto com espaços.
- Descrever igualdade completa após trim Java/lowercase Locale.ROOT, aceitando Unicode como registo/login, sem normalização de composição, prova de posse ou envio de convite.

Exemplos **de delta**, não operações novas: `{ "userId": "id-interno-existente" }` mantém integração; `{ "email": "pessoa@example.invalid" }` é a nova alternativa. Nunca enviar ambos. IDs de seed existentes não mudam.

| Situação | Resultado proposto/preservado |
|---|---|
| Uma conta ativa elegível por critério único válido | 204, associação única |
| Conta já participante, inclusive gestor já participante e pedidos concorrentes email/email ou email/userId | 204, sem nova associação/papel/versão; UI não afirma segunda criação |
| Nenhum critério ou ambos presentes, mesmo um null | 422, field `email`, mensagem explícita para escolher exatamente um |
| Critério escolhido null/vazio ou email sintaticamente inválido | 422, field do critério; sem escrita |
| Email válido inexistente ou conta inativa | 422, field `email`, `Conta não elegível.` em ambos |
| userId não elegível | 422, field `userId`, mesma mensagem legada |
| JSON malformado, tipo incompatível, campos desconhecidos | 400, tratamento existente |
| Sem autenticação/CSRF, membro sem gestão, projeto alheio/inexistente | Manter 401/403/404 conforme segurança e autorização atuais; procurar conta só depois de autorizar |

Idempotência continua também sob concorrência: lock de projeto/transação e PK `(project_id,user_id)` existentes, sem mudar schema. Não retornar a conta resolvida ou adicionar operação GET de contas.

GET members e DELETE members não mudam: GET já inclui `id`, `displayName`, `active`, `role`; UI deixa de mostrar id mas conserva-o internamente. Remoção exige regras atuais, sem promoção ou convite.

## 3. Sem outros deltas HTTP

Nenhum endpoint/payload de tarefas, comentários, anexos, atividade, relações ou sessão muda. Estado de templates é transitório e não integra Task/PUT. Download/permissões/headers e confirmações mantêm-se. Ícones, rótulos e aparência são delta UI em [plan.md](../plan.md), não novos contratos HTTP.

## 4. Aceitação de compatibilidade

FR-001–003/011/012/014/015 e SC-001/002: testar fronteiras Unicode e mensagens; clientes legados userId; XOR com omissão/null; erros inexistente/inativa iguais; concorrência mista com uma participação; gestão/CSRF/acesso preservados. Contrato e implementação cliente/servidor devem ser entregues coordenadamente. Validação planeada, não executada.
