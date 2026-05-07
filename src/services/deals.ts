import pb from '@/lib/pocketbase/client'

export interface DealRecord {
  id: string
  name: string
  organization: string
  lead?: string
  status: string
  probability?: number
  next_step?: string
  territory?: string
  lost_reason?: string
  owner?: string
  email?: string
  mobile?: string
  revenue?: number
  revenue_in_base?: number
  currency?: string
  sla?: string
  sla_creation?: string
  response_due?: string
  resolution_due?: string
  first_responded_on?: string
  resolved_on?: string
  sla_status?: 'FirstResponseDue' | 'Failed' | 'Fulfilled' | 'Paused'
  close_date?: string
  created: string
  updated: string
  expand?: {
    status?: { name: string; color: string; type: string; probability?: number }
    organization?: { name: string }
    lead?: { first_name: string; last_name?: string }
    owner?: { name: string; email: string }
    currency?: { code: string; symbol: string }
  }
}

const expandStr = 'status,organization,lead,owner,currency,territory'

export const getDeals = (filter?: string) =>
  pb.collection('deals').getFullList<DealRecord>({
    sort: '-created',
    filter: filter || '',
    expand: expandStr,
  })

export const getDeal = (id: string) =>
  pb.collection('deals').getOne<DealRecord>(id, { expand: expandStr })

export const createDeal = (data: Partial<DealRecord>) =>
  pb.collection('deals').create<DealRecord>(data)

export const updateDeal = (id: string, data: Partial<DealRecord>) =>
  pb.collection('deals').update<DealRecord>(id, data)

export const deleteDeal = (id: string) => pb.collection('deals').delete(id)
