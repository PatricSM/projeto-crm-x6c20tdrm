migrate(
  (app) => {
    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'teste@teste.com')
    } catch (_) {
      return
    }

    const col = app.findCollectionByNameOrId('dashboard_widgets')
    let existing = []
    try {
      existing = app.findRecordsByFilter('dashboard_widgets', `user = "${admin.id}"`)
    } catch (_) {}
    if (existing.length > 0) return

    const widgets = [
      {
        type: 'kpi',
        title: 'Leads abertos',
        config: { metric: 'count', collection: 'leads', filter: "status.type ~ 'Open|Ongoing'" },
        position: 1,
        size: 'sm',
      },
      {
        type: 'kpi',
        title: 'Deals abertos',
        config: { metric: 'count', collection: 'deals', filter: "status.type ~ 'Open|Ongoing'" },
        position: 2,
        size: 'sm',
      },
      {
        type: 'funnel',
        title: 'Funil de vendas',
        config: { collection: 'deals', groupBy: 'status' },
        position: 3,
        size: 'lg',
      },
      {
        type: 'recent-activity',
        title: 'Atividade recente',
        config: { limit: 10 },
        position: 4,
        size: 'md',
      },
    ]
    for (const w of widgets) {
      const r = new Record(col)
      r.set('user', admin.id)
      r.set('type', w.type)
      r.set('title', w.title)
      r.set('config', w.config)
      r.set('position', w.position)
      r.set('size', w.size)
      app.save(r)
    }
  },
  (_app) => {},
)
