migrate(
  (app) => {
    const organizations = app.findCollectionByNameOrId('organizations')

    const contacts = new Collection({
      name: 'contacts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'agent')",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'full_name', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'mobile', type: 'text' },
        {
          name: 'gender',
          type: 'select',
          values: ['Male', 'Female', 'Other', 'Prefer not to say'],
          maxSelect: 1,
        },
        {
          name: 'organization',
          type: 'relation',
          collectionId: organizations.id,
          maxSelect: 1,
        },
        { name: 'job_title', type: 'text' },
        { name: 'is_primary', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_contacts_email ON contacts (email)'],
    })
    app.save(contacts)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('contacts'))
    } catch (_) {}
  },
)
