import pb from '@/lib/pocketbase/client'

export type WidgetType =
  | 'kpi'
  | 'chart-line'
  | 'chart-bar'
  | 'table-top'
  | 'recent-activity'
  | 'funnel'

export interface WidgetConfig {
  metric?: 'count' | 'sum' | 'avg'
  collection?: string
  filter?: string
  field?: string
  groupBy?: string
  limit?: number
}

export interface DashboardWidget {
  id: string
  user: string
  type: WidgetType
  title: string
  config: WidgetConfig
  position: number
  size: 'sm' | 'md' | 'lg'
  created: string
  updated: string
}

export const getMyWidgets = () =>
  pb.collection('dashboard_widgets').getFullList<DashboardWidget>({
    sort: 'position',
    filter: `user = "${pb.authStore.record?.id || ''}"`,
  })

export const createWidget = (data: Partial<DashboardWidget>) =>
  pb.collection('dashboard_widgets').create<DashboardWidget>({
    ...data,
    user: pb.authStore.record?.id,
  })

export const updateWidget = (id: string, data: Partial<DashboardWidget>) =>
  pb.collection('dashboard_widgets').update<DashboardWidget>(id, data)

export const deleteWidget = (id: string) => pb.collection('dashboard_widgets').delete(id)
