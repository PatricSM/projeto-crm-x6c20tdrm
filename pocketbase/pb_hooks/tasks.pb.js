/// <reference path="../pb_data/types.d.ts" />

/**
 * Hook de tasks:
 * - onRecordAfterCreateSuccess / onRecordAfterUpdateSuccess: notificar assigned_to
 */

onRecordAfterCreateSuccess((e) => {
  const helpers = require(`${__hooks}/_helpers.js`)
  const task = e.record
  const assignee = task.get('assigned_to')
  const auth = e.auth
  if (assignee && (!auth || auth.id !== assignee)) {
    helpers.createNotification($app, {
      recipient: assignee,
      kind: 'task_due',
      title: `Nova tarefa: ${task.get('title')}`,
      body: task.get('description') || '',
    })
  }
  e.next()
}, 'tasks')

onRecordAfterUpdateSuccess((e) => {
  const helpers = require(`${__hooks}/_helpers.js`)
  const task = e.record
  const original = task.original()
  if (!original) {
    e.next()
    return
  }
  const oldAssignee = original.get('assigned_to')
  const newAssignee = task.get('assigned_to')
  const auth = e.auth
  if (newAssignee && newAssignee !== oldAssignee && (!auth || auth.id !== newAssignee)) {
    helpers.createNotification($app, {
      recipient: newAssignee,
      kind: 'task_due',
      title: `Tarefa atribuída a você: ${task.get('title')}`,
      body: task.get('description') || '',
    })
  }
  e.next()
}, 'tasks')
