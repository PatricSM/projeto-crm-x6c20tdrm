migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const dashboardWidgets = new Collection({
      name: 'dashboard_widgets',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          collectionId: usersId,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        {
          name: 'type',
          type: 'select',
          values: ['kpi', 'chart-line', 'chart-bar', 'table-top', 'recent-activity', 'funnel'],
          maxSelect: 1,
          required: true,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'config', type: 'json' },
        { name: 'position', type: 'number', required: true },
        {
          name: 'size',
          type: 'select',
          values: ['sm', 'md', 'lg'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_widgets_user_pos ON dashboard_widgets (user, position)'],
    })
    app.save(dashboardWidgets)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('dashboard_widgets'))
    } catch (_) {}
  },
)
