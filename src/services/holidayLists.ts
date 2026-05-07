import pb from '@/lib/pocketbase/client'

export interface HolidayList {
  id: string
  name: string
  description?: string
}
export interface Holiday {
  id: string
  list: string
  date: string
  name: string
}

export const getHolidayLists = () =>
  pb.collection('holiday_lists').getFullList<HolidayList>({ sort: 'name' })
export const createHolidayList = (data: Partial<HolidayList>) =>
  pb.collection('holiday_lists').create<HolidayList>(data)
export const deleteHolidayList = (id: string) => pb.collection('holiday_lists').delete(id)

export const getHolidaysOfList = (listId: string) =>
  pb.collection('holidays').getFullList<Holiday>({ filter: `list = "${listId}"`, sort: 'date' })
export const createHoliday = (data: Partial<Holiday>) =>
  pb.collection('holidays').create<Holiday>(data)
export const deleteHoliday = (id: string) => pb.collection('holidays').delete(id)
