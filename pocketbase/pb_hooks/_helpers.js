/// <reference path="../pb_data/types.d.ts" />

/**
 * Helpers compartilhados pelos hooks do CRM. Importar via:
 *   const helpers = require(`${__hooks}/_helpers.js`)
 */

function createNotification($app, payload) {
  try {
    const col = $app.findCollectionByNameOrId('notifications')
    const r = new Record(col)
    r.set('recipient', payload.recipient)
    r.set('kind', payload.kind)
    r.set('title', payload.title)
    if (payload.body) r.set('body', payload.body)
    if (payload.lead) r.set('lead', payload.lead)
    if (payload.deal) r.set('deal', payload.deal)
    r.set('read', false)
    $app.save(r)
  } catch (err) {
    console.error('createNotification failed:', err)
  }
}

function logStatusChange($app, payload) {
  try {
    const col = $app.findCollectionByNameOrId('status_change_log')
    const r = new Record(col)
    r.set('record_type', payload.record_type)
    r.set('record_id', payload.record_id)
    r.set('from_status', payload.from_status || '')
    r.set('to_status', payload.to_status || '')
    r.set('changed_by', payload.changed_by || '')
    r.set('changed_at', payload.changed_at || new Date().toISOString())
    $app.save(r)
  } catch (err) {
    console.error('logStatusChange failed:', err)
  }
}

/**
 * Soma minutos a uma data ISO. Não considera business hours/holidays.
 * Versão "naive" usada como fallback ou quando a SLA não tem business_hours.
 */
function addMinutesIsoNaive(fromIso, minutes) {
  const base = fromIso ? new Date(fromIso) : new Date()
  return new Date(base.getTime() + minutes * 60_000).toISOString()
}

/**
 * Verifica se uma data cai dentro do business hours.
 * bhRecords = array de records de business_hours (mesmo "name", dias da semana).
 */
function isInBusinessHours(date, bhRecords) {
  if (!bhRecords || bhRecords.length === 0) return true
  const dow = String(date.getUTCDay())
  const hh = String(date.getUTCHours()).padStart(2, '0')
  const mm = String(date.getUTCMinutes()).padStart(2, '0')
  const t = `${hh}:${mm}`
  for (const bh of bhRecords) {
    if (String(bh.get('day_of_week')) !== dow) continue
    const start = String(bh.get('start_time') || '')
    const end = String(bh.get('end_time') || '')
    if (t >= start && t < end) return true
  }
  return false
}

function isHoliday($app, date, holidayListId) {
  if (!holidayListId) return false
  const isoDate = date.toISOString().slice(0, 10)
  try {
    $app.findFirstRecordByFilter(
      'holidays',
      `list = "${holidayListId}" && date = "${isoDate} 00:00:00.000Z"`,
    )
    return true
  } catch (_) {
    return false
  }
}

/**
 * Soma minutos pulando para o próximo período de business hours quando
 * estiver fora dele ou em feriado. Avança em "saltos de 30 min" para
 * encontrar o próximo slot. Mais barato que fazer aritmética exata.
 */
function addMinutesIso($app, fromIso, minutes, slaPolicy) {
  if (!slaPolicy) return addMinutesIsoNaive(fromIso, minutes)

  let bhRecords = []
  try {
    const bhIds = slaPolicy.get('business_hours') || []
    if (Array.isArray(bhIds) && bhIds.length > 0) {
      const list = $app.findRecordsByFilter(
        'business_hours',
        bhIds.map((id) => `id = "${id}"`).join(' || '),
      )
      bhRecords = list
    }
  } catch (err) {
    console.error('failed to load business_hours:', err)
  }

  const holidayListId = slaPolicy.get('holiday_list')

  // Sem business hours configuradas: usa cálculo naive
  if (bhRecords.length === 0) return addMinutesIsoNaive(fromIso, minutes)

  let cur = fromIso ? new Date(fromIso) : new Date()
  let remaining = minutes
  const stepMs = 30 * 60_000

  // Limite de iteração (~1 ano em saltos de 30min) para evitar loop infinito
  for (let i = 0; i < 17520 && remaining > 0; i++) {
    const inBh = isInBusinessHours(cur, bhRecords)
    const isHol = isHoliday($app, cur, holidayListId)
    if (inBh && !isHol) {
      remaining -= 30
    }
    cur = new Date(cur.getTime() + stepMs)
  }

  return cur.toISOString()
}

function findSlaPolicyForPriority($app, priority) {
  try {
    const list = $app.findRecordsByFilter(
      'sla_policies',
      `priority = "${priority}" && is_active = true`,
    )
    if (list.length > 0) return list[0]
  } catch (err) {
    console.error('findSlaPolicyForPriority failed:', err)
  }
  return null
}

function convertToBase($app, amount, currencyId) {
  if (!amount || !currencyId) return 0
  try {
    const c = $app.findRecordById('currencies', currencyId)
    const rate = Number(c.get('exchange_rate') || 1)
    return Number(amount) * rate
  } catch (_) {
    return Number(amount) || 0
  }
}

module.exports = {
  createNotification,
  logStatusChange,
  addMinutesIso,
  addMinutesIsoNaive,
  isInBusinessHours,
  isHoliday,
  findSlaPolicyForPriority,
  convertToBase,
}
