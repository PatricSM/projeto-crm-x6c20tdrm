migrate(
  (app) => {
    const slaCol = app.findCollectionByNameOrId('sla_policies')

    let bhIds = []
    try {
      const list = app.findRecordsByFilter('business_hours', 'name = "Comercial padrão"')
      bhIds = list.map((r) => r.id)
    } catch (_) {}

    let hl
    try {
      hl = app.findFirstRecordByData('holiday_lists', 'name', 'Feriados nacionais BR 2026')
    } catch (_) {
      hl = null
    }

    const policies = [
      { name: 'Urgente', priority: 'Urgent', response_time_min: 60, resolution_time_min: 240 },
      { name: 'Alta', priority: 'High', response_time_min: 240, resolution_time_min: 1440 },
      {
        name: 'Média',
        priority: 'Medium',
        response_time_min: 1440,
        resolution_time_min: 4320,
      },
      { name: 'Baixa', priority: 'Low', response_time_min: 4320, resolution_time_min: 10080 },
    ]
    for (const p of policies) {
      try {
        app.findFirstRecordByData('sla_policies', 'name', p.name)
      } catch (_) {
        const r = new Record(slaCol)
        r.set('name', p.name)
        r.set('priority', p.priority)
        r.set('response_time_min', p.response_time_min)
        r.set('resolution_time_min', p.resolution_time_min)
        if (bhIds.length > 0) r.set('business_hours', bhIds)
        if (hl) r.set('holiday_list', hl.id)
        r.set('is_active', true)
        app.save(r)
      }
    }
  },
  (_app) => {},
)
