migrate(
  (app) => {
    const currencies = new Collection({
      name: 'currencies',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'code', type: 'text', required: true, max: 8 },
        { name: 'name', type: 'text', required: true },
        { name: 'symbol', type: 'text', required: true, max: 8 },
        { name: 'exchange_rate', type: 'number', required: true },
        { name: 'is_default', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_currencies_code ON currencies (code)'],
    })
    app.save(currencies)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('currencies'))
    } catch (_) {}
  },
)
