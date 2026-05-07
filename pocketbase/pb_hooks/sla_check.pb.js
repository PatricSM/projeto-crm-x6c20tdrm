/// <reference path="../pb_data/types.d.ts" />

/**
 * Cron a cada 15 min: verifica breach de SLA em leads e deals.
 *
 * Regras:
 * - Se lead/deal tem `response_due` no passado, sem `first_responded_on`,
 *   e `sla_status != Failed`, marca como Failed e notifica owner.
 * - Para deals, se `resolution_due` no passado, sem `resolved_on`,
 *   e `sla_status != Failed`, também marca como Failed.
 */

cronAdd('sla_breach_check', '*/15 * * * *', () => {
  const helpers = require(`${__hooks}/_helpers.js`)
  const nowIso = new Date().toISOString()

  // Leads — first response breach
  let leadsBreached = []
  try {
    leadsBreached = $app.findRecordsByFilter(
      'leads',
      `response_due != "" && response_due <= "${nowIso}" && first_responded_on = "" && sla_status != "Failed"`,
    )
  } catch (err) {
    console.error('cron sla leads failed:', err)
  }
  for (const lead of leadsBreached) {
    try {
      lead.set('sla_status', 'Failed')
      $app.save(lead)
      const owner = lead.get('owner')
      if (owner) {
        helpers.createNotification($app, {
          recipient: owner,
          kind: 'sla_breach',
          title: `SLA estourado em lead: ${lead.get('first_name')}`,
          body: 'Tempo de primeira resposta excedido.',
          lead: lead.id,
        })
      }
    } catch (err) {
      console.error('failed to mark lead sla_status Failed:', err)
    }
  }

  // Deals — first response breach
  let dealsRespBreached = []
  try {
    dealsRespBreached = $app.findRecordsByFilter(
      'deals',
      `response_due != "" && response_due <= "${nowIso}" && first_responded_on = "" && sla_status != "Failed"`,
    )
  } catch (err) {
    console.error('cron sla deals (response) failed:', err)
  }
  for (const deal of dealsRespBreached) {
    try {
      deal.set('sla_status', 'Failed')
      $app.save(deal)
      const owner = deal.get('owner')
      if (owner) {
        helpers.createNotification($app, {
          recipient: owner,
          kind: 'sla_breach',
          title: `SLA estourado em deal: ${deal.get('name')}`,
          body: 'Tempo de primeira resposta excedido.',
          deal: deal.id,
        })
      }
    } catch (err) {
      console.error('failed to mark deal sla_status Failed:', err)
    }
  }

  // Deals — resolution breach
  let dealsResBreached = []
  try {
    dealsResBreached = $app.findRecordsByFilter(
      'deals',
      `resolution_due != "" && resolution_due <= "${nowIso}" && resolved_on = "" && sla_status != "Failed"`,
    )
  } catch (err) {
    console.error('cron sla deals (resolution) failed:', err)
  }
  for (const deal of dealsResBreached) {
    try {
      deal.set('sla_status', 'Failed')
      $app.save(deal)
      const owner = deal.get('owner')
      if (owner) {
        helpers.createNotification($app, {
          recipient: owner,
          kind: 'sla_breach',
          title: `Resolução de deal vencida: ${deal.get('name')}`,
          body: 'Tempo de resolução excedido.',
          deal: deal.id,
        })
      }
    } catch (err) {
      console.error('failed to mark deal resolution sla_status Failed:', err)
    }
  }
})
