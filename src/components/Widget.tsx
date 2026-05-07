import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import pb from '@/lib/pocketbase/client'
import type { DashboardWidget, WidgetConfig } from '@/services/dashboardWidgets'
import { Link } from 'react-router-dom'
import { StatusBadge } from '@/components/StatusBadge'
import { MoneyDisplay } from '@/components/MoneyDisplay'

interface Props {
  widget: DashboardWidget
  editing: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function Widget({ widget, editing, onEdit, onDelete }: Props) {
  return (
    <Card
      className={
        widget.size === 'lg'
          ? 'sm:col-span-2 lg:col-span-3 p-5'
          : widget.size === 'md'
            ? 'sm:col-span-2 p-5'
            : 'p-5'
      }
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-sm">{widget.title}</h3>
        {editing && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      <WidgetBody widget={widget} />
    </Card>
  )
}

function WidgetBody({ widget }: { widget: DashboardWidget }) {
  switch (widget.type) {
    case 'kpi':
      return <KpiBody config={widget.config} />
    case 'funnel':
      return <FunnelBody config={widget.config} />
    case 'recent-activity':
      return <RecentActivityBody config={widget.config} />
    case 'chart-line':
    case 'chart-bar':
      return <ChartBody widget={widget} />
    case 'table-top':
      return <TableTopBody config={widget.config} />
    default:
      return <p className="text-xs text-muted-foreground">Tipo desconhecido: {widget.type}</p>
  }
}

function KpiBody({ config }: { config: WidgetConfig }) {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    if (!config.collection) return
    pb.collection(config.collection)
      .getList(1, 1, { filter: config.filter || '' })
      .then((res) => setCount(res.totalItems))
      .catch((err) => {
        console.error('kpi load:', err)
        setCount(null)
      })
  }, [config])
  return (
    <div className="text-3xl font-semibold">
      {count == null ? '…' : count}
      <p className="text-xs text-muted-foreground font-normal mt-1">{config.collection}</p>
    </div>
  )
}

function FunnelBody({ config }: { config: WidgetConfig }) {
  const collection = config.collection || 'deals'
  const groupBy = config.groupBy || 'status'
  const [data, setData] = useState<{ name: string; count: number; color?: string }[]>([])

  useEffect(() => {
    Promise.all([
      pb.collection(collection).getFullList({ expand: groupBy }),
      pb.collection(`${collection.replace(/s$/, '')}_statuses`).getFullList({ sort: 'position' }),
    ])
      .then(([records, statuses]: any) => {
        const counts: Record<string, number> = {}
        for (const r of records) counts[r[groupBy]] = (counts[r[groupBy]] || 0) + 1
        setData(
          statuses.map((s: any) => ({ name: s.name, count: counts[s.id] || 0, color: s.color })),
        )
      })
      .catch((err) => console.error('funnel:', err))
  }, [collection, groupBy])

  if (data.length === 0) return <p className="text-xs text-muted-foreground">Sem dados</p>

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <Tooltip />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function ChartBody({ widget }: { widget: DashboardWidget }) {
  const collection = widget.config.collection || 'leads'
  const [points, setPoints] = useState<{ date: string; count: number }[]>([])

  useEffect(() => {
    pb.collection(collection)
      .getFullList({ sort: '-created' })
      .then((records: any[]) => {
        // Agrupa por dia, últimos 14 dias
        const map: Record<string, number> = {}
        const now = new Date()
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60_000).toISOString().slice(0, 10)
          map[d] = 0
        }
        for (const r of records) {
          const d = (r.created || '').slice(0, 10)
          if (map[d] != null) map[d]++
        }
        setPoints(Object.entries(map).map(([date, count]) => ({ date: date.slice(5), count })))
      })
      .catch((err) => console.error('chart:', err))
  }, [collection])

  if (widget.type === 'chart-line') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={points}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" />
        </LineChart>
      </ResponsiveContainer>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={points}>
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <Tooltip />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function RecentActivityBody({ config }: { config: WidgetConfig }) {
  const limit = config.limit || 10
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    pb.collection('status_change_log')
      .getList(1, limit, {
        sort: '-created',
        expand: 'changed_by',
      })
      .then((res) => setItems(res.items))
      .catch((err) => console.error('activity:', err))
  }, [limit])

  return (
    <div className="space-y-1.5 text-sm">
      {items.length === 0 && <p className="text-xs text-muted-foreground">Sem atividade.</p>}
      {items.map((it) => (
        <Link
          key={it.id}
          to={`/${it.record_type}s/${it.record_id}`}
          className="flex justify-between border-b pb-1.5 hover:bg-slate-50 px-1 -mx-1 rounded"
        >
          <span>
            {it.record_type} mudou para <strong>{it.to_status}</strong>
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(it.created).toLocaleString('pt-BR', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </span>
        </Link>
      ))}
    </div>
  )
}

function TableTopBody({ config }: { config: WidgetConfig }) {
  const limit = config.limit || 5
  const collection = config.collection || 'deals'
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    pb.collection(collection)
      .getList(1, limit, {
        sort: config.field ? `-${config.field}` : '-revenue',
        expand: 'status,currency,organization',
      })
      .then((res) => setItems(res.items))
      .catch((err) => console.error('table:', err))
  }, [collection, limit, config.field])

  return (
    <div className="space-y-1.5 text-sm">
      {items.map((d) => (
        <Link
          key={d.id}
          to={`/${collection}/${d.id}`}
          className="flex justify-between border-b pb-1.5 hover:bg-slate-50 px-1 -mx-1 rounded"
        >
          <span className="truncate">{d.name || d.first_name}</span>
          <span className="flex items-center gap-2 text-xs">
            {d.expand?.status && (
              <StatusBadge label={d.expand.status.name} color={d.expand.status.color} />
            )}
            <MoneyDisplay value={d.revenue} currency={d.expand?.currency} />
          </span>
        </Link>
      ))}
      {items.length === 0 && <p className="text-xs text-muted-foreground">Sem dados.</p>}
    </div>
  )
}
