migrate(
  (app) => {
    const adminOnly = "@request.auth.role = 'admin'"
    const authRead = "@request.auth.id != ''"

    const holidayLists = new Collection({
      name: 'holiday_lists',
      type: 'base',
      listRule: authRead,
      viewRule: authRead,
      createRule: adminOnly,
      updateRule: adminOnly,
      deleteRule: adminOnly,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(holidayLists)

    const holidays = new Collection({
      name: 'holidays',
      type: 'base',
      listRule: authRead,
      viewRule: authRead,
      createRule: adminOnly,
      updateRule: adminOnly,
      deleteRule: adminOnly,
      fields: [
        {
          name: 'list',
          type: 'relation',
          collectionId: holidayLists.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'date', type: 'date', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(holidays)
  },
  (app) => {
    for (const c of ['holidays', 'holiday_lists']) {
      try {
        app.delete(app.findCollectionByNameOrId(c))
      } catch (_) {}
    }
  },
)
