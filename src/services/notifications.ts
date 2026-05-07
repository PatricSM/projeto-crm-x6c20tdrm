import pb from '@/lib/pocketbase/client'

export interface NotificationRecord {
  id: string
  recipient: string
  kind: 'lead_assigned' | 'deal_assigned' | 'task_due' | 'sla_breach' | 'status_changed' | 'mention'
  title: string
  body?: string
  lead?: string
  deal?: string
  read: boolean
  created: string
  updated: string
}

export const getMyNotifications = () =>
  pb.collection('notifications').getFullList<NotificationRecord>({
    sort: '-created',
    filter: `recipient = "${pb.authStore.record?.id || ''}"`,
  })

export const markRead = (id: string) =>
  pb.collection('notifications').update<NotificationRecord>(id, { read: true })

export const markAllRead = async () => {
  const list = await pb.collection('notifications').getFullList<NotificationRecord>({
    filter: `recipient = "${pb.authStore.record?.id || ''}" && read = false`,
  })
  await Promise.all(list.map((n) => markRead(n.id)))
}

export const deleteNotification = (id: string) => pb.collection('notifications').delete(id)
