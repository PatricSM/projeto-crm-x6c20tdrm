migrate(
  (app) => {
    const adminOnly = "@request.auth.role = 'admin'"
    const authRead = "@request.auth.id != ''"

    const leadStatuses = new Collection({
      name: 'lead_statuses',
      type: 'base',
      listRule: authRead,
      viewRule: authRead,
      createRule: adminOnly,
      updateRule: adminOnly,
      deleteRule: adminOnly,
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'color',
          type: 'select',
          values: [
            'gray',
            'blue',
            'green',
            'red',
            'yellow',
            'purple',
            'pink',
            'orange',
            'teal',
            'cyan',
          ],
          maxSelect: 1,
        },
        { name: 'position', type: 'number' },
        {
          name: 'type',
          type: 'select',
          values: ['Open', 'Ongoing', 'OnHold', 'Won', 'Lost'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(leadStatuses)

    const dealStatuses = new Collection({
      name: 'deal_statuses',
      type: 'base',
      listRule: authRead,
      viewRule: authRead,
      createRule: adminOnly,
      updateRule: adminOnly,
      deleteRule: adminOnly,
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'color',
          type: 'select',
          values: [
            'gray',
            'blue',
            'green',
            'red',
            'yellow',
            'purple',
            'pink',
            'orange',
            'teal',
            'cyan',
          ],
          maxSelect: 1,
        },
        { name: 'position', type: 'number' },
        { name: 'probability', type: 'number' },
        {
          name: 'type',
          type: 'select',
          values: ['Open', 'Ongoing', 'OnHold', 'Won', 'Lost'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(dealStatuses)

    const leadSources = new Collection({
      name: 'lead_sources',
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
    app.save(leadSources)

    const industries = new Collection({
      name: 'industries',
      type: 'base',
      listRule: authRead,
      viewRule: authRead,
      createRule: adminOnly,
      updateRule: adminOnly,
      deleteRule: adminOnly,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(industries)

    const territories = new Collection({
      name: 'territories',
      type: 'base',
      listRule: authRead,
      viewRule: authRead,
      createRule: adminOnly,
      updateRule: adminOnly,
      deleteRule: adminOnly,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'manager', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(territories)

    const lostReasons = new Collection({
      name: 'lost_reasons',
      type: 'base',
      listRule: authRead,
      viewRule: authRead,
      createRule: adminOnly,
      updateRule: adminOnly,
      deleteRule: adminOnly,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(lostReasons)
  },
  (app) => {
    for (const c of [
      'lost_reasons',
      'territories',
      'industries',
      'lead_sources',
      'deal_statuses',
      'lead_statuses',
    ]) {
      try {
        app.delete(app.findCollectionByNameOrId(c))
      } catch (_) {}
    }
  },
)
