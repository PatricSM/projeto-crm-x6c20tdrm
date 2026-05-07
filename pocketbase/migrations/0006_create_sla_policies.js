migrate(
  (app) => {
    const businessHours = app.findCollectionByNameOrId('business_hours')
    const holidayLists = app.findCollectionByNameOrId('holiday_lists')

    const slaPolicies = new Collection({
      name: 'sla_policies',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.role = 'admin'",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'priority',
          type: 'select',
          values: ['Low', 'Medium', 'High', 'Urgent'],
          maxSelect: 1,
          required: true,
        },
        { name: 'response_time_min', type: 'number', required: true },
        { name: 'resolution_time_min', type: 'number', required: true },
        {
          name: 'business_hours',
          type: 'relation',
          collectionId: businessHours.id,
          maxSelect: null,
        },
        {
          name: 'holiday_list',
          type: 'relation',
          collectionId: holidayLists.id,
          maxSelect: 1,
        },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(slaPolicies)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('sla_policies'))
    } catch (_) {}
  },
)
