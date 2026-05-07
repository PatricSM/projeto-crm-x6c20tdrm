migrate(
  (app) => {
    const bhCol = app.findCollectionByNameOrId('business_hours')
    const days = ['1', '2', '3', '4', '5']
    for (const d of days) {
      try {
        const existing = app.findFirstRecordByFilter(
          'business_hours',
          `day_of_week = "${d}" && name = "Comercial padrão"`,
        )
        if (existing) continue
      } catch (_) {}
      const r = new Record(bhCol)
      r.set('name', 'Comercial padrão')
      r.set('day_of_week', d)
      r.set('start_time', '09:00')
      r.set('end_time', '18:00')
      app.save(r)
    }

    const hlCol = app.findCollectionByNameOrId('holiday_lists')
    let hl
    try {
      hl = app.findFirstRecordByData('holiday_lists', 'name', 'Feriados nacionais BR 2026')
    } catch (_) {
      hl = new Record(hlCol)
      hl.set('name', 'Feriados nacionais BR 2026')
      hl.set('description', 'Feriados nacionais brasileiros para 2026')
      app.save(hl)
    }

    const hCol = app.findCollectionByNameOrId('holidays')
    const holidays = [
      { date: '2026-01-01', name: 'Confraternização Universal' },
      { date: '2026-02-16', name: 'Carnaval (segunda)' },
      { date: '2026-02-17', name: 'Carnaval (terça)' },
      { date: '2026-04-03', name: 'Sexta-feira Santa' },
      { date: '2026-04-21', name: 'Tiradentes' },
      { date: '2026-05-01', name: 'Dia do Trabalho' },
      { date: '2026-06-04', name: 'Corpus Christi' },
      { date: '2026-09-07', name: 'Independência' },
      { date: '2026-10-12', name: 'Nossa Senhora Aparecida' },
      { date: '2026-11-02', name: 'Finados' },
      { date: '2026-11-15', name: 'Proclamação da República' },
      { date: '2026-12-25', name: 'Natal' },
    ]
    for (const h of holidays) {
      try {
        app.findFirstRecordByFilter(
          'holidays',
          `list = "${hl.id}" && date = "${h.date} 00:00:00.000Z"`,
        )
      } catch (_) {
        const r = new Record(hCol)
        r.set('list', hl.id)
        r.set('date', h.date)
        r.set('name', h.name)
        app.save(r)
      }
    }
  },
  (_app) => {},
)
