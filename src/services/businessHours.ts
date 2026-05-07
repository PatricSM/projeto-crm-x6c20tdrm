import pb from '@/lib/pocketbase/client'

export interface BusinessHour {
  id: string
  name: string
  day_of_week: '0' | '1' | '2' | '3' | '4' | '5' | '6'
  start_time: string
  end_time: string
}

export const getBusinessHours = () =>
  pb.collection('business_hours').getFullList<BusinessHour>({ sort: 'name,day_of_week' })
export const createBusinessHour = (data: Partial<BusinessHour>) =>
  pb.collection('business_hours').create<BusinessHour>(data)
export const updateBusinessHour = (id: string, data: Partial<BusinessHour>) =>
  pb.collection('business_hours').update<BusinessHour>(id, data)
export const deleteBusinessHour = (id: string) => pb.collection('business_hours').delete(id)
