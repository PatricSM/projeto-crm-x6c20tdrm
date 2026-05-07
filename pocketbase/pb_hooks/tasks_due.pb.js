/// <reference path="../pb_data/types.d.ts" />

/**
 * Cron diário 9h: notifica responsáveis sobre tarefas vencendo nas
 * próximas 24h (status != Done/Canceled).
 */

cronAdd('tasks_due_check', '0 9 * * *', () => {
  const helpers = require(`${__hooks}/_helpers.js`)
  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60_000).toISOString()
  const nowIso = now.toISOString()

  let due = []
  try {
    due = $app.findRecordsByFilter(
      'tasks',
      `due_date >= "${nowIso}" && due_date <= "${in24h}" && status != "Done" && status != "Canceled"`,
    )
  } catch (err) {
    console.error('cron tasks_due failed:', err)
    return
  }

  for (const task of due) {
    const assignee = task.get('assigned_to')
    if (!assignee) continue
    helpers.createNotification($app, {
      recipient: assignee,
      kind: 'task_due',
      title: `Tarefa vencendo: ${task.get('title')}`,
      body: `Vence em ${task.get('due_date')}`,
    })
  }
})
