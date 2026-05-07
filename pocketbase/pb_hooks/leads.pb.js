/// <reference path="../pb_data/types.d.ts" />

/**
 * Hooks da coleção leads:
 * - onRecordCreate: aplicar SLA + calcular revenue_in_base
 * - onRecordAfterCreateSuccess: notificar owner
 * - onRecordUpdate: detectar mudanças
 * - onRecordAfterUpdateSuccess: logar status, conversão Lead→Deal, notificar owner
 */

onRecordCreate((e) => {
  const helpers = require(`${__hooks}/_helpers.js`)
  const lead = e.record

  // SLA: por enquanto associamos a policy "Medium" por default ao lead se
  // o usuário não escolheu — futura UI permitirá escolher prioridade.
  if (!lead.get('sla')) {
    const policy = helpers.findSlaPolicyForPriority($app, 'Medium')
    if (policy) {
      lead.set('sla', policy.id)
      lead.set('sla_creation', new Date().toISOString())
      try {
        const due = helpers.addMinutesIso(
          $app,
          null,
          policy.get('response_time_min'),
          policy,
        )
        lead.set('response_due', due)
        lead.set('sla_status', 'FirstResponseDue')
      } catch (err) {
        console.error('[lead sla] failed:', err)
      }
    }
  }

  // Currency: revenue_in_base = revenue * exchange_rate
  const currencyId = lead.get('currency')
  const revenue = lead.get('revenue')
  if (revenue && currencyId) {
    lead.set('revenue_in_base', helpers.convertToBase($app, revenue, currencyId))
  }

  e.next()
}, 'leads')

onRecordAfterCreateSuccess((e) => {
  const helpers = require(`${__hooks}/_helpers.js`)
  const lead = e.record
  const owner = lead.get('owner')
  if (owner) {
    helpers.createNotification($app, {
      recipient: owner,
      kind: 'lead_assigned',
      title: `Novo lead atribuído: ${lead.get('first_name')} ${lead.get('last_name') || ''}`.trim(),
      body: lead.get('email') || '',
      lead: lead.id,
    })
  }
  e.next()
}, 'leads')

onRecordAfterUpdateSuccess((e) => {
  const helpers = require(`${__hooks}/_helpers.js`)
  const lead = e.record
  const original = lead.original()
  if (!original) {
    e.next()
    return
  }

  const oldStatus = original.get('status')
  const newStatus = lead.get('status')
  const oldOwner = original.get('owner')
  const newOwner = lead.get('owner')
  const oldRevenue = original.get('revenue')
  const newRevenue = lead.get('revenue')
  const oldCurrency = original.get('currency')
  const newCurrency = lead.get('currency')
  const oldConverted = original.get('converted')
  const newConverted = lead.get('converted')

  // Status change log
  if (newStatus !== oldStatus) {
    const auth = e.auth
    helpers.logStatusChange($app, {
      record_type: 'lead',
      record_id: lead.id,
      from_status: oldStatus || '',
      to_status: newStatus || '',
      changed_by: auth ? auth.id : '',
    })
    if (newOwner && (!auth || auth.id !== newOwner)) {
      helpers.createNotification($app, {
        recipient: newOwner,
        kind: 'status_changed',
        title: `Lead mudou de status: ${lead.get('first_name')}`,
        lead: lead.id,
      })
    }
  }

  // Owner change
  if (newOwner && newOwner !== oldOwner) {
    helpers.createNotification($app, {
      recipient: newOwner,
      kind: 'lead_assigned',
      title: `Lead atribuído a você: ${lead.get('first_name')}`,
      lead: lead.id,
    })
  }

  // Currency conversion update
  if (newRevenue !== oldRevenue || newCurrency !== oldCurrency) {
    if (newRevenue && newCurrency) {
      const newBase = helpers.convertToBase($app, newRevenue, newCurrency)
      try {
        lead.set('revenue_in_base', newBase)
        $app.save(lead)
      } catch (err) {
        console.error('failed to update revenue_in_base:', err)
      }
    }
  }

  // Conversão Lead → Deal (gera Deal + Contact + Organization)
  if (newConverted && !oldConverted) {
    try {
      // 1. Encontrar ou criar organization
      let orgId = lead.get('organization')
      const orgName = lead.get('organization_name')
      if (!orgId && orgName) {
        try {
          const existing = $app.findFirstRecordByData('organizations', 'name', orgName)
          orgId = existing.id
        } catch (_) {
          const orgsCol = $app.findCollectionByNameOrId('organizations')
          const r = new Record(orgsCol)
          r.set('name', orgName)
          if (lead.get('industry')) r.set('industry', lead.get('industry'))
          if (lead.get('territory')) r.set('territory', lead.get('territory'))
          if (lead.get('currency')) r.set('currency', lead.get('currency'))
          if (lead.get('no_of_employees')) r.set('no_of_employees', lead.get('no_of_employees'))
          if (lead.get('revenue')) r.set('revenue', lead.get('revenue'))
          if (newRevenue && newCurrency) {
            r.set('revenue_in_base', helpers.convertToBase($app, newRevenue, newCurrency))
          }
          $app.save(r)
          orgId = r.id
        }
      }

      // 2. Criar contact
      const contactsCol = $app.findCollectionByNameOrId('contacts')
      const contact = new Record(contactsCol)
      const fullName = `${lead.get('first_name')} ${lead.get('last_name') || ''}`.trim()
      contact.set('full_name', fullName)
      if (lead.get('email')) contact.set('email', lead.get('email'))
      if (lead.get('mobile')) contact.set('mobile', lead.get('mobile'))
      if (lead.get('phone')) contact.set('phone', lead.get('phone'))
      if (lead.get('job_title')) contact.set('job_title', lead.get('job_title'))
      if (orgId) contact.set('organization', orgId)
      contact.set('is_primary', true)
      $app.save(contact)

      // 3. Criar deal
      if (orgId) {
        let openStatus = null
        try {
          openStatus = $app.findFirstRecordByFilter('deal_statuses', 'type = "Open"')
        } catch (_) {}
        const dealsCol = $app.findCollectionByNameOrId('deals')
        const deal = new Record(dealsCol)
        deal.set('name', `Negócio - ${fullName}`)
        deal.set('organization', orgId)
        deal.set('lead', lead.id)
        if (openStatus) deal.set('status', openStatus.id)
        if (lead.get('owner')) deal.set('owner', lead.get('owner'))
        if (lead.get('email')) deal.set('email', lead.get('email'))
        if (lead.get('mobile')) deal.set('mobile', lead.get('mobile'))
        if (lead.get('revenue')) deal.set('revenue', lead.get('revenue'))
        if (lead.get('currency')) deal.set('currency', lead.get('currency'))
        if (lead.get('territory')) deal.set('territory', lead.get('territory'))
        $app.save(deal)
      }
    } catch (err) {
      console.error('lead conversion failed:', err)
    }
  }

  e.next()
}, 'leads')
