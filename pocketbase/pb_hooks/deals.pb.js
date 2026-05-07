/// <reference path="../pb_data/types.d.ts" />

/**
 * Hooks da coleção deals:
 * - onRecordCreate: aplicar SLA + revenue_in_base
 * - onRecordAfterCreateSuccess: notificar owner
 * - onRecordAfterUpdateSuccess: status log, close_date, currency conversion
 */

onRecordCreate((e) => {
  const helpers = require(`${__hooks}/_helpers.js`)
  const deal = e.record

  if (!deal.get('sla')) {
    const policy = helpers.findSlaPolicyForPriority($app, 'Medium')
    if (policy) {
      deal.set('sla', policy.id)
      deal.set('sla_creation', new Date().toISOString())
      try {
        const respDue = helpers.addMinutesIso(
          $app,
          null,
          policy.get('response_time_min'),
          policy,
        )
        const resDue = helpers.addMinutesIso(
          $app,
          null,
          policy.get('resolution_time_min'),
          policy,
        )
        deal.set('response_due', respDue)
        deal.set('resolution_due', resDue)
        deal.set('sla_status', 'FirstResponseDue')
      } catch (err) {
        console.error('[deal sla] failed:', err)
      }
    }
  }

  const currencyId = deal.get('currency')
  const revenue = deal.get('revenue')
  if (revenue && currencyId) {
    deal.set('revenue_in_base', helpers.convertToBase($app, revenue, currencyId))
  }

  e.next()
}, 'deals')

onRecordAfterCreateSuccess((e) => {
  const helpers = require(`${__hooks}/_helpers.js`)
  const deal = e.record
  const owner = deal.get('owner')
  if (owner) {
    helpers.createNotification($app, {
      recipient: owner,
      kind: 'deal_assigned',
      title: `Novo deal atribuído: ${deal.get('name')}`,
      deal: deal.id,
    })
  }
  e.next()
}, 'deals')

onRecordAfterUpdateSuccess((e) => {
  const helpers = require(`${__hooks}/_helpers.js`)
  const deal = e.record
  const original = deal.original()
  if (!original) {
    e.next()
    return
  }

  const oldStatus = original.get('status')
  const newStatus = deal.get('status')
  const oldOwner = original.get('owner')
  const newOwner = deal.get('owner')
  const oldRevenue = original.get('revenue')
  const newRevenue = deal.get('revenue')
  const oldCurrency = original.get('currency')
  const newCurrency = deal.get('currency')

  if (newStatus !== oldStatus) {
    const auth = e.auth
    helpers.logStatusChange($app, {
      record_type: 'deal',
      record_id: deal.id,
      from_status: oldStatus || '',
      to_status: newStatus || '',
      changed_by: auth ? auth.id : '',
    })
    if (newOwner && (!auth || auth.id !== newOwner)) {
      helpers.createNotification($app, {
        recipient: newOwner,
        kind: 'status_changed',
        title: `Deal mudou de status: ${deal.get('name')}`,
        deal: deal.id,
      })
    }
    // Marcar close_date se status virou Won/Lost
    try {
      const stRec = $app.findRecordById('deal_statuses', newStatus)
      const stType = stRec.get('type')
      if (stType === 'Won' || stType === 'Lost') {
        const cur = String(deal.get('close_date') || '').trim()
        if (!cur) {
          deal.set('close_date', new Date().toISOString())
          $app.save(deal)
        }
      }
    } catch (_) {}
  }

  if (newOwner && newOwner !== oldOwner) {
    helpers.createNotification($app, {
      recipient: newOwner,
      kind: 'deal_assigned',
      title: `Deal atribuído a você: ${deal.get('name')}`,
      deal: deal.id,
    })
  }

  if (newRevenue !== oldRevenue || newCurrency !== oldCurrency) {
    if (newRevenue && newCurrency) {
      const newBase = helpers.convertToBase($app, newRevenue, newCurrency)
      try {
        deal.set('revenue_in_base', newBase)
        $app.save(deal)
      } catch (err) {
        console.error('failed to update deal revenue_in_base:', err)
      }
    }
  }

  e.next()
}, 'deals')
