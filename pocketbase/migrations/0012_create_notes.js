migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const notes = new Collection({
      name: 'notes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && author = @request.auth.id",
      deleteRule:
        "@request.auth.id != '' && (author = @request.auth.id || @request.auth.role = 'admin')",
      fields: [
        { name: 'title', type: 'text' },
        { name: 'content', type: 'text', required: true },
        {
          name: 'reference_type',
          type: 'select',
          values: ['lead', 'deal', 'contact', 'organization'],
          maxSelect: 1,
          required: true,
        },
        { name: 'reference_id', type: 'text', required: true },
        {
          name: 'author',
          type: 'relation',
          collectionId: usersId,
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_notes_ref ON notes (reference_type, reference_id)'],
    })
    app.save(notes)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('notes'))
    } catch (_) {}
  },
)
