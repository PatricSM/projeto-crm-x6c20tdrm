migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const statusChangeLog = new Collection({
      name: 'status_change_log',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.role = 'admin'",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'record_type',
          type: 'select',
          values: ['lead', 'deal'],
          maxSelect: 1,
          required: true,
        },
        { name: 'record_id', type: 'text', required: true },
        { name: 'from_status', type: 'text' },
        { name: 'to_status', type: 'text' },
        { name: 'changed_by', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'changed_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_scl_ref ON status_change_log (record_type, record_id)'],
    })
    app.save(statusChangeLog)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('status_change_log'))
    } catch (_) {}
  },
)
