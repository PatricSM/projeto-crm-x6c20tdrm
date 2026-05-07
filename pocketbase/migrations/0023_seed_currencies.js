migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('currencies')
    const list = [
      { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', exchange_rate: 1.0, is_default: true },
      { code: 'USD', name: 'Dólar Americano', symbol: '$', exchange_rate: 5.0 },
      { code: 'EUR', name: 'Euro', symbol: '€', exchange_rate: 5.4 },
      { code: 'GBP', name: 'Libra Esterlina', symbol: '£', exchange_rate: 6.3 },
      { code: 'ARS', name: 'Peso Argentino', symbol: '$', exchange_rate: 0.005 },
    ]
    for (const c of list) {
      try {
        app.findFirstRecordByData('currencies', 'code', c.code)
      } catch (_) {
        const r = new Record(col)
        for (const k of Object.keys(c)) r.set(k, c[k])
        app.save(r)
      }
    }
  },
  (_app) => {},
)
