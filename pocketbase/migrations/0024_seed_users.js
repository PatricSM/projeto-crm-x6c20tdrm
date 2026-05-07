migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'teste@teste.com')
      return
    } catch (_) {}

    const r = new Record(users)
    r.setEmail('teste@teste.com')
    r.setPassword('Skip@Pass')
    r.setVerified(true)
    r.set('name', 'Teste')
    r.set('role', 'admin')
    app.save(r)
  },
  (_app) => {},
)
