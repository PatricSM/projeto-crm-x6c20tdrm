migrate(
  (app) => {
    const usersId = '_pb_users_auth_'
    const leads = app.findCollectionByNameOrId('leads')
    const deals = app.findCollectionByNameOrId('deals')

    const notifications = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: "@request.auth.id != '' && recipient = @request.auth.id",
      viewRule: "@request.auth.id != '' && recipient = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && recipient = @request.auth.id",
      deleteRule: "@request.auth.id != '' && recipient = @request.auth.id",
      fields: [
        {
          name: 'recipient',
          type: 'relation',
          collectionId: usersId,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        {
          name: 'kind',
          type: 'select',
          values: [
            'lead_assigned',
            'deal_assigned',
            'task_due',
            'sla_breach',
            'status_changed',
            'mention',
          ],
          maxSelect: 1,
          required: true,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'text' },
        { name: 'lead', type: 'relation', collectionId: leads.id, maxSelect: 1 },
        { name: 'deal', type: 'relation', collectionId: deals.id, maxSelect: 1 },
        { name: 'read', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notifications_recipient ON notifications (recipient, read)',
      ],
    })
    app.save(notifications)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('notifications'))
    } catch (_) {}
  },
)
