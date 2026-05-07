/// <reference path="../pb_data/types.d.ts" />

/**
 * Hook de notes:
 * - onRecordAfterCreateSuccess: marcar first_responded_on no parent
 *   (lead/deal) se for a primeira nota de staff (admin/agent).
 */

onRecordAfterCreateSuccess((e) => {
  const note = e.record
  const refType = note.get('reference_type')
  const refId = note.get('reference_id')
  const authorId = note.get('author')

  if (!refType || !refId || !authorId) {
    e.next()
    return
  }
  if (refType !== 'lead' && refType !== 'deal') {
    e.next()
    return
  }

  // Verifica se autor é staff
  let authorRole = 'viewer'
  try {
    const author = $app.findRecordById('_pb_users_auth_', authorId)
    authorRole = author.get('role') || 'viewer'
  } catch (_) {
    e.next()
    return
  }
  const isStaff = authorRole === 'admin' || authorRole === 'agent'
  if (!isStaff) {
    e.next()
    return
  }

  const collectionName = refType === 'lead' ? 'leads' : 'deals'
  let parent
  try {
    parent = $app.findRecordById(collectionName, refId)
  } catch (_) {
    e.next()
    return
  }

  // PB date: objeto truthy mesmo vazio — checar via String().trim()
  const cur = String(parent.get('first_responded_on') || '').trim()
  if (!cur) {
    try {
      parent.set('first_responded_on', new Date().toISOString())
      parent.set('sla_status', 'Fulfilled')
      $app.save(parent)
    } catch (err) {
      console.error('failed to mark first_responded_on:', err)
    }
  }

  e.next()
}, 'notes')
