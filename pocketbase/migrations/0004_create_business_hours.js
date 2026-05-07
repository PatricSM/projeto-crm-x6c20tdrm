migrate(
  (app) => {
    const businessHours = new Collection({
      name: 'business_hours',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'day_of_week',
          type: 'select',
          values: ['0', '1', '2', '3', '4', '5', '6'],
          maxSelect: 1,
          required: true,
        },
        { name: 'start_time', type: 'text', required: true, max: 5 },
        { name: 'end_time', type: 'text', required: true, max: 5 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(businessHours)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('business_hours'))
    } catch (_) {}
  },
)
