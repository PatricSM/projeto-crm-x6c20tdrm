import pb from '@/lib/pocketbase/client'

export interface TaskRecord {
  id: string
  title: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Backlog' | 'Todo' | 'InProgress' | 'Done' | 'Canceled'
  start_date?: string
  due_date?: string
  assigned_to?: string
  description?: string
  reference_type?: 'lead' | 'deal' | 'contact' | 'organization'
  reference_id?: string
  created_by?: string
  created: string
  updated: string
  expand?: { assigned_to?: { name: string; email: string } }
}

export const getTasks = (filter?: string) =>
  pb.collection('tasks').getFullList<TaskRecord>({
    sort: 'due_date,-created',
    filter: filter || '',
    expand: 'assigned_to',
  })

export const getTasksFor = (refType: TaskRecord['reference_type'], refId: string) =>
  pb.collection('tasks').getFullList<TaskRecord>({
    sort: '-created',
    filter: `reference_type = "${refType}" && reference_id = "${refId}"`,
    expand: 'assigned_to',
  })

export const createTask = (data: Partial<TaskRecord>) =>
  pb.collection('tasks').create<TaskRecord>({
    ...data,
    created_by: pb.authStore.record?.id,
  })

export const updateTask = (id: string, data: Partial<TaskRecord>) =>
  pb.collection('tasks').update<TaskRecord>(id, data)

export const deleteTask = (id: string) => pb.collection('tasks').delete(id)
