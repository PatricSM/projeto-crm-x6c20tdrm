migrate(
  (app) => {
    const usersId = '_pb_users_auth_'
    const leadStatuses = app.findCollectionByNameOrId('lead_statuses')
    const leadSources = app.findCollectionByNameOrId('lead_sources')
    const industries = app.findCollectionByNameOrId('industries')
    const territories = app.findCollectionByNameOrId('territories')
    const lostReasons = app.findCollectionByNameOrId('lost_reasons')
    const slaPolicies = app.findCollectionByNameOrId('sla_policies')
    const currencies = app.findCollectionByNameOrId('currencies')
    const organizations = app.findCollectionByNameOrId('organizations')

    const leads = new Collection({
      name: 'leads',
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
        { name: 'first_name', type: 'text', required: true },
        { name: 'last_name', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'mobile', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'job_title', type: 'text' },
        { name: 'organization_name', type: 'text' },
        {
          name: 'organization',
          type: 'relation',
          collectionId: organizations.id,
          maxSelect: 1,
        },
        {
          name: 'image',
          type: 'file',
          maxSelect: 1,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'status', type: 'relation', collectionId: leadStatuses.id, maxSelect: 1 },
        { name: 'source', type: 'relation', collectionId: leadSources.id, maxSelect: 1 },
        { name: 'industry', type: 'relation', collectionId: industries.id, maxSelect: 1 },
        { name: 'territory', type: 'relation', collectionId: territories.id, maxSelect: 1 },
        { name: 'lost_reason', type: 'relation', collectionId: lostReasons.id, maxSelect: 1 },
        { name: 'owner', type: 'relation', collectionId: usersId, maxSelect: 1 },
        {
          name: 'no_of_employees',
          type: 'select',
          values: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
          maxSelect: 1,
        },
        { name: 'revenue', type: 'number' },
        { name: 'revenue_in_base', type: 'number' },
        { name: 'currency', type: 'relation', collectionId: currencies.id, maxSelect: 1 },
        { name: 'sla', type: 'relation', collectionId: slaPolicies.id, maxSelect: 1 },
        { name: 'sla_creation', type: 'date' },
        { name: 'response_due', type: 'date' },
        { name: 'first_responded_on', type: 'date' },
        {
          name: 'sla_status',
          type: 'select',
          values: ['FirstResponseDue', 'Failed', 'Fulfilled', 'Paused'],
          maxSelect: 1,
        },
        { name: 'converted', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_leads_owner ON leads (owner)',
        'CREATE INDEX idx_leads_status ON leads (status)',
        'CREATE INDEX idx_leads_email ON leads (email)',
      ],
    })
    app.save(leads)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('leads'))
    } catch (_) {}
  },
)
