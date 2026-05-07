migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const tasks = new Collection({
      name: 'tasks',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (assigned_to = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'agent')",
      deleteRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'agent')",
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'priority',
          type: 'select',
          values: ['Low', 'Medium', 'High'],
          maxSelect: 1,
          required: true,
        },
        {
          name: 'status',
          type: 'select',
          values: ['Backlog', 'Todo', 'InProgress', 'Done', 'Canceled'],
          maxSelect: 1,
          required: true,
        },
        { name: 'start_date', type: 'date' },
        { name: 'due_date', type: 'date' },
        { name: 'assigned_to', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'description', type: 'text' },
        {
          name: 'reference_type',
          type: 'select',
          values: ['lead', 'deal', 'contact', 'organization'],
          maxSelect: 1,
        },
        { name: 'reference_id', type: 'text' },
        { name: 'created_by', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_tasks_assigned_to ON tasks (assigned_to)',
        'CREATE INDEX idx_tasks_ref ON tasks (reference_type, reference_id)',
      ],
    })
    app.save(tasks)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('tasks'))
    } catch (_) {}
  },
)
