migrate(
  (app) => {
    const industries = app.findCollectionByNameOrId('industries')
    const territories = app.findCollectionByNameOrId('territories')
    const currencies = app.findCollectionByNameOrId('currencies')

    const organizations = new Collection({
      name: 'organizations',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'agent')",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'website', type: 'url' },
        {
          name: 'logo',
          type: 'file',
          maxSelect: 1,
          mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
        },
        {
          name: 'no_of_employees',
          type: 'select',
          values: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
          maxSelect: 1,
        },
        { name: 'revenue', type: 'number' },
        { name: 'revenue_in_base', type: 'number' },
        { name: 'industry', type: 'relation', collectionId: industries.id, maxSelect: 1 },
        { name: 'territory', type: 'relation', collectionId: territories.id, maxSelect: 1 },
        { name: 'currency', type: 'relation', collectionId: currencies.id, maxSelect: 1 },
        { name: 'address', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_orgs_name ON organizations (name)'],
    })
    app.save(organizations)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('organizations'))
    } catch (_) {}
  },
)
