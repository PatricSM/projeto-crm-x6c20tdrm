import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

export const getCompanies = () => pb.collection('companies').getFullList({ sort: '-created' })
export const createCompany = (data: any) =>
  pb.collection('companies').create({ ...data, owner: pb.authStore.record?.id })

export const getContacts = () =>
  pb.collection('contacts').getFullList({ sort: '-created', expand: 'company' })
export const createContact = (data: any) =>
  pb.collection('contacts').create({ ...data, owner: pb.authStore.record?.id })

export const getDeals = () =>
  pb.collection('deals').getFullList({ sort: '-created', expand: 'company,contact' })
export const updateDealStage = (id: string, stage: string) =>
  pb.collection('deals').update(id, { stage })
export const createDeal = (data: any) =>
  pb.collection('deals').create({ ...data, owner: pb.authStore.record?.id })

export const getTasks = () =>
  pb.collection('tasks').getFullList({ sort: 'due_date', expand: 'deal' })
export const updateTaskStatus = (id: string, status: string) =>
  pb.collection('tasks').update(id, { status })
export const createTask = (data: any) =>
  pb.collection('tasks').create({ ...data, owner: pb.authStore.record?.id })
