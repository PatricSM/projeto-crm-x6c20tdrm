migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    let owner
    try {
      owner = app.findAuthRecordByEmail('_pb_users_auth_', 'patric.martins@adapta.org')
    } catch (_) {
      owner = new Record(usersCol)
      owner.setEmail('patric.martins@adapta.org')
      owner.setPassword('Skip@Pass')
      owner.setVerified(true)
      owner.set('name', 'Patric Martins')
      app.save(owner)
    }

    const companiesCol = app.findCollectionByNameOrId('companies')
    const contactsCol = app.findCollectionByNameOrId('contacts')
    const dealsCol = app.findCollectionByNameOrId('deals')
    const tasksCol = app.findCollectionByNameOrId('tasks')

    try {
      app.findFirstRecordByData('companies', 'name', 'Adapta S.A.')
      return // Already seeded
    } catch (_) {}

    // Companies
    const comp1 = new Record(companiesCol)
    comp1.set('name', 'Adapta S.A.')
    comp1.set('industry', 'Software')
    comp1.set('owner', owner.id)
    app.save(comp1)

    const comp2 = new Record(companiesCol)
    comp2.set('name', 'Tech Solutions')
    comp2.set('industry', 'Serviços')
    comp2.set('owner', owner.id)
    app.save(comp2)

    // Contacts
    const cont1 = new Record(contactsCol)
    cont1.set('name', 'Ana Silva')
    cont1.set('email', 'ana@adapta.org')
    cont1.set('status', 'Customer')
    cont1.set('company', comp1.id)
    cont1.set('owner', owner.id)
    app.save(cont1)

    const cont2 = new Record(contactsCol)
    cont2.set('name', 'Carlos Souza')
    cont2.set('email', 'carlos@techsolutions.com')
    cont2.set('status', 'Qualified')
    cont2.set('company', comp2.id)
    cont2.set('owner', owner.id)
    app.save(cont2)

    // Deals
    const deal1 = new Record(dealsCol)
    deal1.set('title', 'Implantação ERP Adapta')
    deal1.set('value', 45000)
    deal1.set('stage', 'Proposal')
    deal1.set('contact', cont1.id)
    deal1.set('company', comp1.id)
    deal1.set('owner', owner.id)
    app.save(deal1)

    const deal2 = new Record(dealsCol)
    deal2.set('title', 'Consultoria Nuvem TS')
    deal2.set('value', 12000)
    deal2.set('stage', 'Qualified')
    deal2.set('contact', cont2.id)
    deal2.set('company', comp2.id)
    deal2.set('owner', owner.id)
    app.save(deal2)

    const deal3 = new Record(dealsCol)
    deal3.set('title', 'Manutenção Mensal')
    deal3.set('value', 3000)
    deal3.set('stage', 'Closed_Won')
    deal3.set('contact', cont1.id)
    deal3.set('company', comp1.id)
    deal3.set('owner', owner.id)
    app.save(deal3)

    // Tasks
    const task1 = new Record(tasksCol)
    task1.set('title', 'Enviar proposta comercial atualizada')
    task1.set('status', 'Todo')
    task1.set('priority', 'High')
    task1.set('deal', deal1.id)
    task1.set('owner', owner.id)
    app.save(task1)

    const task2 = new Record(tasksCol)
    task2.set('title', 'Agendar reunião técnica')
    task2.set('status', 'Doing')
    task2.set('priority', 'Medium')
    task2.set('deal', deal2.id)
    task2.set('owner', owner.id)
    app.save(task2)
  },
  (app) => {
    // Revert not strictly necessary for simple seed as we can wipe the db, but implemented for safety
    try {
      const records = app.findRecordsByFilter(
        'companies',
        "name = 'Adapta S.A.' || name = 'Tech Solutions'",
        '',
        100,
        0,
      )
      for (const r of records) app.delete(r)
    } catch (_) {}
  },
)
