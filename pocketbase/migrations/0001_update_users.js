migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(new TextField({ name: 'name' }))
    users.fields.add(
      new SelectField({
        name: 'role',
        values: ['admin', 'agent', 'viewer'],
        maxSelect: 1,
        required: true,
      }),
    )
    users.fields.add(
      new FileField({
        name: 'avatar',
        maxSelect: 1,
        mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
      }),
    )
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    for (const f of ['name', 'role', 'avatar']) {
      try {
        users.fields.removeByName(f)
      } catch (_) {}
    }
    app.save(users)
  },
)
