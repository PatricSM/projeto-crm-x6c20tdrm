migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const companies = new Collection({
      name: 'companies',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'website', type: 'url' },
        {
          name: 'industry',
          type: 'select',
          values: ['Software', 'Varejo', 'Serviços', 'Indústria', 'Outros'],
          maxSelect: 1,
        },
        {
          name: 'logo',
          type: 'file',
          maxSelect: 1,
          mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
        },
        { name: 'owner', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(companies)

    const contacts = new Collection({
      name: 'contacts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'text' },
        { name: 'company', type: 'relation', collectionId: companies.id, maxSelect: 1 },
        { name: 'status', type: 'select', values: ['Lead', 'Qualified', 'Customer'], maxSelect: 1 },
        { name: 'owner', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(contacts)

    const deals = new Collection({
      name: 'deals',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'value', type: 'number', min: 0 },
        {
          name: 'stage',
          type: 'select',
          values: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed_Won', 'Closed_Lost'],
          maxSelect: 1,
        },
        { name: 'contact', type: 'relation', collectionId: contacts.id, maxSelect: 1 },
        { name: 'company', type: 'relation', collectionId: companies.id, maxSelect: 1 },
        { name: 'expected_closing', type: 'date' },
        { name: 'owner', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'vector', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(deals)

    const tasks = new Collection({
      name: 'tasks',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'status', type: 'select', values: ['Todo', 'Doing', 'Done'], maxSelect: 1 },
        { name: 'priority', type: 'select', values: ['Low', 'Medium', 'High'], maxSelect: 1 },
        { name: 'deal', type: 'relation', collectionId: deals.id, maxSelect: 1 },
        { name: 'owner', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(tasks)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('tasks'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('deals'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('contacts'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('companies'))
    } catch (_) {}
  },
)
