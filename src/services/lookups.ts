import pb from '@/lib/pocketbase/client'

export interface LeadStatus {
  id: string
  name: string
  color?: string
  position?: number
  type: 'Open' | 'Ongoing' | 'OnHold' | 'Won' | 'Lost'
}
export interface DealStatus extends LeadStatus {
  probability?: number
}
export interface NamedLookup {
  id: string
  name: string
  description?: string
}

export const getLeadStatuses = () =>
  pb.collection('lead_statuses').getFullList<LeadStatus>({ sort: 'position' })
export const getDealStatuses = () =>
  pb.collection('deal_statuses').getFullList<DealStatus>({ sort: 'position' })
export const getLeadSources = () =>
  pb.collection('lead_sources').getFullList<NamedLookup>({ sort: 'name' })
export const getIndustries = () =>
  pb.collection('industries').getFullList<NamedLookup>({ sort: 'name' })
export const getTerritories = () =>
  pb.collection('territories').getFullList<NamedLookup>({ sort: 'name' })
export const getLostReasons = () =>
  pb.collection('lost_reasons').getFullList<NamedLookup>({ sort: 'name' })

export const createLeadStatus = (data: Partial<LeadStatus>) =>
  pb.collection('lead_statuses').create<LeadStatus>(data)
export const updateLeadStatus = (id: string, data: Partial<LeadStatus>) =>
  pb.collection('lead_statuses').update<LeadStatus>(id, data)
export const deleteLeadStatus = (id: string) => pb.collection('lead_statuses').delete(id)

export const createDealStatus = (data: Partial<DealStatus>) =>
  pb.collection('deal_statuses').create<DealStatus>(data)
export const updateDealStatus = (id: string, data: Partial<DealStatus>) =>
  pb.collection('deal_statuses').update<DealStatus>(id, data)
export const deleteDealStatus = (id: string) => pb.collection('deal_statuses').delete(id)

export const createLeadSource = (data: Partial<NamedLookup>) =>
  pb.collection('lead_sources').create<NamedLookup>(data)
export const deleteLeadSource = (id: string) => pb.collection('lead_sources').delete(id)

export const createIndustry = (data: Partial<NamedLookup>) =>
  pb.collection('industries').create<NamedLookup>(data)
export const deleteIndustry = (id: string) => pb.collection('industries').delete(id)

export const createTerritory = (data: Partial<NamedLookup>) =>
  pb.collection('territories').create<NamedLookup>(data)
export const deleteTerritory = (id: string) => pb.collection('territories').delete(id)

export const createLostReason = (data: Partial<NamedLookup>) =>
  pb.collection('lost_reasons').create<NamedLookup>(data)
export const deleteLostReason = (id: string) => pb.collection('lost_reasons').delete(id)
