import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Check, AlertTriangle, UserPlus, CircleDollarSign, CheckSquare } from 'lucide-react'
import useRealtime from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import {
  getMyNotifications,
  markRead,
  markAllRead,
  type NotificationRecord,
} from '@/services/notifications'

const KIND_ICON: Record<NotificationRecord['kind'], React.ComponentType<{ className?: string }>> = {
  lead_assigned: UserPlus,
  deal_assigned: CircleDollarSign,
  task_due: CheckSquare,
  sla_breach: AlertTriangle,
  status_changed: Bell,
  mention: Bell,
}

const KIND_COLOR: Record<NotificationRecord['kind'], string> = {
  lead_assigned: 'text-blue-500',
  deal_assigned: 'text-emerald-500',
  task_due: 'text-amber-500',
  sla_breach: 'text-rose-500',
  status_changed: 'text-purple-500',
  mention: 'text-slate-500',
}

export default function Notifications() {
  const { toast } = useToast()
  const [items, setItems] = useState<NotificationRecord[]>([])

  const load = () =>
    getMyNotifications()
      .then(setItems)
      .catch((e) => console.error(e))

  useEffect(() => {
    load()
  }, [])
  useRealtime('notifications', () => load())

  const unread = items.filter((n) => !n.read).length

  const handleAllRead = async () => {
    await markAllRead()
    toast({ title: 'Todas marcadas como lidas' })
    load()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notificações</h1>
          <p className="text-muted-foreground">
            {unread > 0 ? `${unread} não lidas` : 'Tudo em dia'}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" onClick={handleAllRead}>
            <Check className="h-4 w-4 mr-1" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      <Card>
        <div className="divide-y">
          {items.map((n) => {
            const Icon = KIND_ICON[n.kind] || Bell
            const linkTo = n.lead ? `/leads/${n.lead}` : n.deal ? `/deals/${n.deal}` : '#'
            return (
              <div
                key={n.id}
                className={`px-4 py-3 flex gap-3 hover:bg-slate-50 ${n.read ? 'opacity-60' : ''}`}
              >
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${KIND_COLOR[n.kind]}`} />
                <div className="flex-1 min-w-0">
                  <Link
                    to={linkTo}
                    onClick={() => !n.read && markRead(n.id).then(load)}
                    className="block"
                  >
                    <div className="font-medium text-sm">{n.title}</div>
                    {n.body && <div className="text-xs text-muted-foreground">{n.body}</div>}
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created).toLocaleString('pt-BR')}
                    </div>
                  </Link>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-2" />}
              </div>
            )
          })}
          {items.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Nenhuma notificação.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
