import pb from '@/lib/pocketbase/client'

export interface SlaPolicy {
  id: string
  name: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  response_time_min: number
  resolution_time_min: number
  business_hours?: string[]
  holiday_list?: string
  is_active?: boolean
}

export const getSlaPolicies = () =>
  pb.collection('sla_policies').getFullList<SlaPolicy>({ sort: 'priority' })
export const createSlaPolicy = (data: Partial<SlaPolicy>) =>
  pb.collection('sla_policies').create<SlaPolicy>(data)
export const updateSlaPolicy = (id: string, data: Partial<SlaPolicy>) =>
  pb.collection('sla_policies').update<SlaPolicy>(id, data)
export const deleteSlaPolicy = (id: string) => pb.collection('sla_policies').delete(id)
