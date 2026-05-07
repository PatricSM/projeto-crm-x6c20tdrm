migrate(
  (app) => {
    const seedSimple = (collectionName, fieldName, items) => {
      const col = app.findCollectionByNameOrId(collectionName)
      for (const item of items) {
        try {
          app.findFirstRecordByData(collectionName, fieldName, item[fieldName])
        } catch (_) {
          const r = new Record(col)
          for (const k of Object.keys(item)) r.set(k, item[k])
          app.save(r)
        }
      }
    }

    seedSimple('lead_statuses', 'name', [
      { name: 'Novo', color: 'gray', position: 0, type: 'Open' },
      { name: 'Contatado', color: 'blue', position: 1, type: 'Ongoing' },
      { name: 'Qualificado', color: 'cyan', position: 2, type: 'Ongoing' },
      { name: 'Proposta enviada', color: 'orange', position: 3, type: 'Ongoing' },
      { name: 'Convertido', color: 'green', position: 4, type: 'Won' },
      { name: 'Perdido', color: 'red', position: 5, type: 'Lost' },
    ])

    seedSimple('deal_statuses', 'name', [
      { name: 'Qualificação', color: 'gray', position: 0, type: 'Open', probability: 10 },
      { name: 'Contato feito', color: 'blue', position: 1, type: 'Ongoing', probability: 25 },
      { name: 'Demo', color: 'cyan', position: 2, type: 'Ongoing', probability: 40 },
      { name: 'Proposta', color: 'orange', position: 3, type: 'Ongoing', probability: 60 },
      { name: 'Negociação', color: 'yellow', position: 4, type: 'Ongoing', probability: 80 },
      { name: 'Fechado (Ganho)', color: 'green', position: 5, type: 'Won', probability: 100 },
      { name: 'Fechado (Perdido)', color: 'red', position: 6, type: 'Lost', probability: 0 },
    ])

    seedSimple('lead_sources', 'name', [
      { name: 'Site', description: 'Formulário de contato' },
      { name: 'Indicação', description: 'Cliente existente indicou' },
      { name: 'Cold Call', description: 'Prospecção ativa' },
      { name: 'Evento', description: 'Feira ou conferência' },
      { name: 'Parceiro', description: 'Canal de parceiros' },
      { name: 'Outro', description: '' },
    ])

    seedSimple('industries', 'name', [
      { name: 'Tecnologia' },
      { name: 'Financeiro' },
      { name: 'Saúde' },
      { name: 'Varejo' },
      { name: 'Indústria' },
      { name: 'Educação' },
      { name: 'Serviços' },
      { name: 'Outros' },
    ])

    seedSimple('territories', 'name', [
      { name: 'Norte' },
      { name: 'Sul' },
      { name: 'Leste' },
      { name: 'Oeste' },
    ])

    seedSimple('lost_reasons', 'name', [
      { name: 'Preço alto' },
      { name: 'Concorrente escolhido' },
      { name: 'Sem orçamento' },
      { name: 'Não decidido' },
      { name: 'Outro' },
    ])
  },
  (_app) => {},
)
