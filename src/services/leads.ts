import pb from '@/lib/pocketbase/client'

export interface LeadRecord {
  id: string
  first_name: string
  last_name?: string
  email?: string
  mobile?: string
  phone?: string
  job_title?: string
  organization_name?: string
  organization?: string
  image?: string
  status?: string
  source?: string
  industry?: string
  territory?: string
  lost_reason?: string
  owner?: string
  no_of_employees?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'
  revenue?: number
  revenue_in_base?: number
  currency?: string
  sla?: string
  sla_creation?: string
  response_due?: string
  first_responded_on?: string
  sla_status?: 'FirstResponseDue' | 'Failed' | 'Fulfilled' | 'Paused'
  converted?: boolean
  created: string
  updated: string
  expand?: {
    status?: { name: string; color: string; type: string }
    source?: { name: string }
    industry?: { name: string }
    owner?: { name: string; email: string }
    currency?: { code: string; symbol: string }
    organization?: { name: string }
  }
}

const expandStr = 'status,source,industry,owner,currency,organization'

export const getLeads = (filter?: string) =>
  pb.collection('leads').getFullList<LeadRecord>({
    sort: '-created',
    filter: filter || '',
    expand: expandStr,
  })

export const getLead = (id: string) =>
  pb.collection('leads').getOne<LeadRecord>(id, { expand: expandStr })

export const createLead = (data: Partial<LeadRecord> | FormData) =>
  pb.collection('leads').create<LeadRecord>(data)

export const updateLead = (id: string, data: Partial<LeadRecord> | FormData) =>
  pb.collection('leads').update<LeadRecord>(id, data)

export const convertLead = (id: string) =>
  pb.collection('leads').update<LeadRecord>(id, { converted: true })

export const deleteLead = (id: string) => pb.collection('leads').delete(id)
