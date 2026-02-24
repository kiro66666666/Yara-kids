# Status atual e próximos passos (segurança, pagamento e operação)

## ✅ Já concluído

### 1) Segurança de autenticação/admin
- Removido o escalonamento de privilégio no frontend (atalho secreto e promoção de admin no cliente).
- Removida validação admin por senha fixa no frontend.
- Papel administrativo migrado para leitura de role em metadata do usuário autenticado.

### 2) Pagamento com backend e robustez inicial
- Fluxo de pagamento movido para Edge Function (`process-payment`).
- Idempotência adicionada para evitar duplicação de tentativas/pedidos.
- Webhook implementado (`process-payment-webhook`) com reconciliação de status.
- Persistência de tentativas/eventos para rastreabilidade operacional.

### 3) Confiabilidade operacional (primeira camada)
- Rate limit adicionado para endpoints públicos críticos (newsletter, pagamento e webhook).
- Validações server-side iniciais no fluxo de pagamento.

## 🟡 Ainda pendente (recomendado fazer agora)

### Segurança e autorização (fechar ciclo)
- Aplicar RLS completa nas tabelas sensíveis com policies por role admin.
- Garantir que toda operação administrativa passe por validação server-side (não apenas guard no frontend).
- Revisar e centralizar variáveis de ambiente (Supabase URL/anon key em padrão único por ambiente).

### Pagamento (produção)
- Implementar captura real de cartão tokenizado (PCI-safe) e regras de antifraude básicas.
- Criar trilha de auditoria admin com histórico de transições de status e ator/origem.
- Adicionar retentativa controlada e reconciliação agendada para falhas temporárias do provedor.

### Operação e qualidade
- Padronizar catálogo único de mensagens de erro/sucesso (cliente + admin + functions).
- Adicionar logging estruturado com correlação (`request_id`, `idempotency_key`, `order_id`).
- Configurar alertas (falha de função, webhook, email, pagamento pendente além do SLA).

## 🔵 Extras de alto impacto (rápidos)

### Admin
- Dashboard com funil de checkout e taxa de abandono por etapa/canal.

### Cliente
- Histórico de pedidos com tracking por etapa (recebido, pago, separado, enviado, entregue).

### Atendimento
- Chat assistido com FAQ inteligente (handoff para WhatsApp humano).

### Segurança adicional
- CAPTCHA leve por heurística de abuso em newsletter/contato/login.

## Ordem sugerida (execução)
1. Fechar RLS + autorização server-side admin.
2. Completar pagamento produção (tokenização + auditoria + reconciliação agendada).
3. Padronizar erros/logs/alertas.
4. Entregar métricas admin e tracking cliente.
