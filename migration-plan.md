# Migration Plan — Frappe CRM → Skip (v2)

Veja `discovery.md` para o detalhamento da fonte. Decisões pós-revisão:

- ✅ **SLA completo** (response + resolution + business hours + holidays)
- ❌ **CallLog removido** (sem telefonia)
- ✅ **Multi-currency** (BRL default + USD/EUR/GBP/ARS)
- ✅ **Import CSV** (Lead, Contact, Organization)
- ✅ **Dashboard configurável** (widgets por usuário)

## 1. Migrations PocketBase (20 no total)

### Schema (0001–0015)

| #    | Migration                           | Conteúdo                                                                                                                                                       |
| ---- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0001 | `update_users`                      | name, role (admin/agent/viewer), avatar                                                                                                                        |
| 0002 | `create_lookups_basic`              | lead_statuses, deal_statuses, lead_sources, industries, territories, lost_reasons                                                                              |
| 0003 | `create_currencies`                 | code (BRL/USD/...), name, symbol, exchange_rate (vs base), is_default                                                                                          |
| 0004 | `create_business_hours`             | name (Conjunto), day_of_week (0-6), start_time, end_time                                                                                                       |
| 0005 | `create_holiday_lists` + `holidays` | list (name) → holidays (date, name, list→)                                                                                                                     |
| 0006 | `create_sla_policies`               | name, priority (Low/Medium/High/Urgent), response_time_min, resolution_time_min, business_hours→, holiday_list→                                                |
| 0007 | `create_organizations`              | + currency→, revenue, revenue_in_base                                                                                                                          |
| 0008 | `create_contacts`                   | full_name, email, phone, mobile, organization→, is_primary                                                                                                     |
| 0009 | `create_leads`                      | + sla→, sla_creation, response_due, first_responded_on, sla_status (FirstResponseDue/Failed/Fulfilled), currency→, revenue, revenue_in_base, lost_reason→      |
| 0010 | `create_deals`                      | + sla→, sla_creation, response_due, resolution_due, first_responded_on, resolved_on, sla_status, currency→, revenue, revenue_in_base, close_date, lost_reason→ |
| 0011 | `create_tasks`                      | title, priority, status, start_date, due_date, assigned_to→user, description, reference_type (lead/deal/contact), reference_id                                 |
| 0012 | `create_notes`                      | title, content, reference_type, reference_id, author→user                                                                                                      |
| 0013 | `create_status_change_log`          | record_type, record_id, from_status, to_status, changed_by→user, changed_at                                                                                    |
| 0014 | `create_notifications`              | recipient→user, kind, title, body, lead→, deal→, read                                                                                                          |
| 0015 | `create_dashboard_widgets`          | user→, type (kpi/chart-line/chart-bar/table/activity), title, config (json), position, size (sm/md/lg)                                                         |

### Seeds (0020–0025) — gap intencional para o validador Skip Cloud

| #    | Migration                      | Conteúdo                                                                                                     |
| ---- | ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 0020 | `seed_lookups`                 | statuses (New/Contacted/Qualified/Proposal/Won/Lost), 6 sources, 8 industries, 4 territories, 5 lost_reasons |
| 0021 | `seed_business_hours_holidays` | Comercial padrão Seg-Sex 9-18 + 12 feriados nacionais BR 2026                                                |
| 0022 | `seed_sla_default`             | 4 policies: Urgent (1h/4h), High (4h/24h), Medium (24h/72h), Low (72h/7d)                                    |
| 0023 | `seed_currencies`              | BRL (default, rate=1.0), USD (5.0), EUR (5.4), GBP (6.3), ARS (0.005)                                        |
| 0024 | `seed_users`                   | admin `teste@teste.com` / `Skip@Pass`                                                                        |
| 0025 | `seed_dashboard_default`       | 4 widgets padrão para o admin (KPI leads abertos, KPI deals abertos, gráfico funil, recent activity)         |

## 2. Hooks PocketBase (`pocketbase/pb_hooks/`)

| Arquivo           | Trigger                                                          | Função                                                                                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_helpers.js`     | (lib)                                                            | `createNotification`, `logStatusChange`, `findOrCreateOrganization`, **`calcSlaDue(slaPolicyId, fromIso)`** (considera business hours + holidays), `isInBusinessHours(date, bhId)`, `convertToBase(amount, currencyCode)` |
| `leads.pb.js`     | `onRecordCreate` (SLA setup) + `onRecordAfterUpdateSuccess`      | Aplicar SLA policy → setar `response_due`. Se `converted` virou true: criar Deal + Contact + Organization. Logar mudança de status.                                                                                       |
| `deals.pb.js`     | `onRecordCreate` (SLA setup) + `onRecordAfterUpdateSuccess`      | Aplicar SLA → `response_due` + `resolution_due`. Logar status. Marcar `close_date` ao Won/Lost.                                                                                                                           |
| `notes.pb.js`     | `onRecordAfterCreateSuccess`                                     | Marcar `first_responded_on` no parent (lead/deal) na primeira nota de staff.                                                                                                                                              |
| `tasks.pb.js`     | `onRecordCreate` / `onRecordAfterUpdateSuccess`                  | Notificar `assigned_to`.                                                                                                                                                                                                  |
| `tasks_due.pb.js` | `cronAdd` 9h diário                                              | Notificar tasks vencendo nas próximas 24h.                                                                                                                                                                                |
| `sla_check.pb.js` | `cronAdd` a cada 15 min                                          | Verificar SLA breach em leads/deals (response_due e resolution_due passados sem first_responded_on/resolved_on); marcar `sla_status = 'Failed'` + notificar owner.                                                        |
| `currency.pb.js`  | `onRecordCreate` / `onRecordUpdate` em leads/deals/organizations | Calcular `revenue_in_base = revenue * currency.exchange_rate`.                                                                                                                                                            |

## 3. Services (`src/services/`)

`leads.ts`, `deals.ts`, `contacts.ts`, `organizations.ts`, `tasks.ts`, `notes.ts`, `lookups.ts`, `slaPolicies.ts`, `businessHours.ts`, `holidayLists.ts`, `currencies.ts`, `dashboardWidgets.ts`, `csvImport.ts` (helpers de parse + batch create).

## 4. Páginas (`src/pages/`)

| Prioridade | Página                            | Rota                                                                                                    |
| ---------- | --------------------------------- | ------------------------------------------------------------------------------------------------------- |
| P0         | Login, Register                   | `/login`, `/register` (do template)                                                                     |
| P1         | Home                              | `/home` — atalhos + meus leads/deals                                                                    |
| P1         | Dashboard configurável            | `/dashboard` — grid de widgets editável                                                                 |
| P1         | Leads + LeadDetail                | `/leads`, `/leads/:id` (tabs Detalhes\|Tasks\|Notes; botão "Converter")                                 |
| P1         | Deals + DealDetail                | `/deals`, `/deals/:id` (tabs Detalhes\|Tasks\|Notes; ver kanban)                                        |
| P2         | Contacts, ContactDetail           | `/contacts`, `/contacts/:id`                                                                            |
| P2         | Organizations, OrganizationDetail | `/organizations`, `/organizations/:id`                                                                  |
| P2         | Tasks (lista global)              | `/tasks`                                                                                                |
| P2         | **Import CSV**                    | `/import` — wizard 4 passos (entity → upload → mapping → submit)                                        |
| P3         | Notifications                     | `/notifications`                                                                                        |
| P3         | Settings (admin)                  | `/settings` — sub: lookups, agentes, business hours, holidays, **SLA policies**, **currencies**, perfil |
| P3         | Help                              | `/help` (sidebar de tópicos como helpdesk)                                                              |

## 5. Componentes-chave

- `<EntityHeader>`, `<StatusBadge>`, `<ActivityTabs>`, `<EntityCombobox>`, `<KanbanBoard>` (Deals)
- `<MoneyDisplay value currency />` — formata respeitando símbolo/locale
- `<MoneyInput name currency />` — input com seletor de currency
- `<DashboardGrid>` + `<Widget>` (renderização polimórfica por type)
- `<WidgetEditor>` (modal: type, title, config)
- `<CsvImportWizard>` (steps: chooseEntity, upload, mapping, preview, submit)
- `<SlaIndicator>` (pill com tempo restante / breach)

## 6. Bibliotecas adicionais

- `papaparse` — parsing CSV client-side
- `recharts` — já no template (gráficos do dashboard)
- `react-grid-layout` — opcional para dashboard drag/drop; se ficar pesado, usar grid CSS simples

## 7. Critérios de aceite (gate)

1. `validate.sh` exit 0 (format/lint/build/migrations)
2. `check-conformance.sh` exit 0 com exceções RBAC declaradas (~12–15 fails esperados em `pb-rls`/`pb-field user`)
3. Login `teste@teste.com` / `Skip@Pass`
4. Fluxo: criar Lead com SLA → primeira note marca `first_responded_on` → converter em Deal → cron `sla_check` flagga breach
5. Multi-currency: criar Deal em USD → `revenue_in_base` calculado via exchange_rate
6. Import CSV: subir arquivo de 50 leads → todos criados com mapping correto
7. Dashboard: admin abre `/dashboard`, vê 4 widgets seedados, consegue adicionar/remover
8. Build < 1.5 MB

## 8. Estimativa de esforço

Escopo grande. Vou implementar em fases commitando ao final de cada:

1. **Fase A — Schema** (migrations 0001–0015 + seeds 0020–0025) → rodar `validate.sh`
2. **Fase B — Hooks** (incluindo SLA cron) → testar fluxo de breach
3. **Fase C — Services + páginas P1** (Home, Dashboard estático, Leads, Deals)
4. **Fase D — Páginas P2** (Contacts, Orgs, Tasks, Import CSV)
5. **Fase E — Páginas P3** (Notifications, Settings completo, Help)
6. **Fase F — Dashboard configurável** (edit mode, widget editor)
7. **Fase G — Gate final** (validate + check-conformance)
