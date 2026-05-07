# Discovery — Frappe CRM → Skip CRM

Fonte: `D:\Projetos\POCtemplates\templatesExternos\crm` (Frappe CRM, Python + Vue 3).

## 1. Domínio (entidades-núcleo)

Selecionei 7 entidades-núcleo + 6 lookups. Outras 23 doctypes (telefonia, integrações ERPNext, dashboards, form scripts) ficam **fora do v1**.

### Entidades-núcleo

| #   | Entidade                     | Campos principais                                                                                                                                                                                    |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Lead** (potencial cliente) | first_name, last_name, email, mobile_no, organization, status→LeadStatus, source→LeadSource, industry→Industry, lead_owner→User, annual_revenue, no_of_employees, job_title, image, converted (bool) |
| 2   | **Deal** (oportunidade)      | organization→Organization, lead→Lead, status→DealStatus, probability, annual_revenue, deal_owner→User, email, mobile_no, next_step, territory→Territory                                              |
| 3   | **Contact**                  | full_name, email, mobile_no, phone, gender, organization→Organization, is_primary                                                                                                                    |
| 4   | **Organization** (empresa)   | organization_name, website, organization_logo, no_of_employees, annual_revenue, industry→Industry, territory→Territory, address                                                                      |
| 5   | **Task**                     | title, priority (Low/Medium/High), status (Backlog/Todo/InProgress/Done/Canceled), start_date, due_date, assigned_to→User, description, reference (lead/deal)                                        |
| 6   | **Note**                     | title, content, reference (lead/deal/contact), author→User                                                                                                                                           |
| 7   | **CallLog**                  | from, to, status (Initiated/Ringing/Completed/Failed/...), type (Incoming/Outgoing), start_time, end_time, duration, recording_url, caller→User, receiver→User, reference                            |

### Lookups (dropdowns)

| Lookup         | Valores / Campos                                           |
| -------------- | ---------------------------------------------------------- |
| **LeadStatus** | name, color, position, type (Open/Ongoing/OnHold/Won/Lost) |
| **DealStatus** | name, color, position, probability, type                   |
| **LeadSource** | source_name, details                                       |
| **Industry**   | industry                                                   |
| **Territory**  | territory_name, manager→User                               |
| **LostReason** | name                                                       |

## 2. Páginas observadas (frontend/src/pages/)

- `Welcome.vue` — landing pós-login
- `Dashboard.vue` — métricas
- `Leads.vue` (lista) + `Lead.vue` (detalhe)
- `Deals.vue` (lista) + `Deal.vue` (detalhe)
- `Contacts.vue` (lista) + `Contact.vue` (detalhe)
- `Organizations.vue` (lista) + `Organization.vue` (detalhe)
- `Tasks.vue`, `Notes.vue`, `CallLogs.vue`
- `Calendar.vue`, `DataImport.vue`
- Variantes mobile (Mobile\*.vue) — vamos usar layout responsivo único

## 3. Fluxos golden path

1. **Captura de Lead** → criar Lead (manual ou import) → atribuir owner → mover por status (Open → Contacted → Qualified → Won/Lost)
2. **Conversão Lead → Deal** → ao marcar `converted`, gerar Deal vinculado + Contact + Organization
3. **Pipeline de Deal** → mover por DealStatus → atualizar probability → fechar (Won/Lost) com lost_reason
4. **Atividade comercial** → registrar Tasks, Notes, CallLogs vinculados a Lead ou Deal
5. **Visão por owner** → cada vendedor vê seus Leads/Deals; admin vê tudo

## 4. Auth & roles

Frappe usa permissões granulares por DocType. No Skip vamos simplificar para RBAC:

- **admin** — vê e edita tudo, gerencia lookups
- **agent** (vendedor) — vê tudo, edita seus Leads/Deals/Contacts/Tasks
- **viewer** — leitura

## 5. Background jobs / hooks

- **Auto-conversão**: ao setar `lead.converted = true`, criar Deal + Contact + Organization (hook `onRecordAfterUpdateSuccess` em leads)
- **Status change log**: registrar mudanças de `lead.status` e `deal.status` numa coleção `status_change_log`
- **Notificações**: novo Lead atribuído, Deal status mudou, Task vencendo (cron diário)
- **First response**: marcar `first_responded_on` no Deal ao primeiro CallLog/Note do owner

## 6. Integrações externas (DEFER)

- **Twilio / Exotel** (telefonia) — fora do v1; CallLog fica como entidade manual
- **ERPNext** — fora do v1
- **WhatsApp / Email sync** — fora do v1
- **Calendar sync** — fora do v1

## 7. Recursos descartados no v1

- Form scripts / fields layout customizáveis pelo usuário
- Dashboards configuráveis
- Service Level Agreement (SLA) — só se o usuário pedir; complexo como no helpdesk
- Holiday lists / business hours
- Data import (CSV) — manual via PocketBase admin no v1
- Versionamento de DocType (renomear, group, etc.)
