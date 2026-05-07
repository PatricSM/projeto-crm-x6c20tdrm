migrate(
  (app) => {
    const usersId = '_pb_users_auth_'
    const dealStatuses = app.findCollectionByNameOrId('deal_statuses')
    const territories = app.findCollectionByNameOrId('territories')
    const lostReasons = app.findCollectionByNameOrId('lost_reasons')
    const slaPolicies = app.findCollectionByNameOrId('sla_policies')
    const currencies = app.findCollectionByNameOrId('currencies')
    const organizations = app.findCollectionByNameOrId('organizations')
    const leads = app.findCollectionByNameOrId('leads')

    const deals = new Collection({
      name: 'deals',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (owner = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'agent' || @request.auth.role = 'viewer')",
      viewRule:
        "@request.auth.id != '' && (owner = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'agent' || @request.auth.role = 'viewer')",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (owner = @request.auth.id || @request.auth.role = 'admin')",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'organization',
          type: 'relation',
          collectionId: organizations.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'lead', type: 'relation', collectionId: leads.id, maxSelect: 1 },
        {
          name: 'status',
          type: 'relation',
          collectionId: dealStatuses.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'probability', type: 'number' },
        { name: 'next_step', type: 'text' },
        { name: 'territory', type: 'relation', collectionId: territories.id, maxSelect: 1 },
        { name: 'lost_reason', type: 'relation', collectionId: lostReasons.id, maxSelect: 1 },
        { name: 'owner', type: 'relation', collectionId: usersId, maxSelect: 1 },
        { name: 'email', type: 'email' },
        { name: 'mobile', type: 'text' },
        { name: 'revenue', type: 'number' },
        { name: 'revenue_in_base', type: 'number' },
        { name: 'currency', type: 'relation', collectionId: currencies.id, maxSelect: 1 },
        { name: 'sla', type: 'relation', collectionId: slaPolicies.id, maxSelect: 1 },
        { name: 'sla_creation', type: 'date' },
        { name: 'response_due', type: 'date' },
        { name: 'resolution_due', type: 'date' },
        { name: 'first_responded_on', type: 'date' },
        { name: 'resolved_on', type: 'date' },
        {
          name: 'sla_status',
          type: 'select',
          values: ['FirstResponseDue', 'Failed', 'Fulfilled', 'Paused'],
          maxSelect: 1,
        },
        { name: 'close_date', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_deals_owner ON deals (owner)',
        'CREATE INDEX idx_deals_status ON deals (status)',
      ],
    })
    app.save(deals)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('deals'))
    } catch (_) {}
  },
)
