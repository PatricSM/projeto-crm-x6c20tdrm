import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Building2, Mail, Phone } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getDeal, updateDeal, type DealRecord } from '@/services/deals'
import { getDealStatuses, type DealStatus } from '@/services/lookups'
import { ActivityTabs } from '@/components/ActivityTabs'
import { StatusBadge } from '@/components/StatusBadge'
import { SlaIndicator } from '@/components/SlaIndicator'
import { MoneyDisplay } from '@/components/MoneyDisplay'

export default function DealDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [deal, setDeal] = useState<DealRecord>()
  const [statuses, setStatuses] = useState<DealStatus[]>([])

  useEffect(() => {
    if (!id) return
    Promise.all([getDeal(id), getDealStatuses()])
      .then(([d, s]) => {
        setDeal(d)
        setStatuses(s)
      })
      .catch((e) => {
        console.error(e)
        toast({ title: 'Deal não encontrado', variant: 'destructive' })
        navigate('/deals')
      })
  }, [id, navigate, toast])

  const changeStatus = async (newId: string) => {
    if (!deal) return
    try {
      const updated = await updateDeal(deal.id, { status: newId })
      setDeal(updated)
      toast({ title: 'Status atualizado' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  if (!deal) return <div className="text-muted-foreground">Carregando…</div>

  return (
    <div className="space-y-6 max-w-5xl">
      <Link to="/deals" className="text-sm text-muted-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Voltar para deals
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {deal.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">{deal.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {deal.expand?.status && (
                <StatusBadge label={deal.expand.status.name} color={deal.expand.status.color} />
              )}
              <SlaIndicator
                status={deal.sla_status}
                responseDue={deal.response_due}
                firstRespondedOn={deal.first_responded_on}
              />
            </div>
          </div>
        </div>
        <Select value={deal.status} onValueChange={changeStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 space-y-3 lg:col-span-1">
          <h3 className="font-semibold">Detalhes</h3>
          <Field label="Empresa" icon={Building2} value={deal.expand?.organization?.name} />
          <Field label="Email" icon={Mail} value={deal.email} />
          <Field label="Telefone" icon={Phone} value={deal.mobile} />
          <Field label="Próximo passo" value={deal.next_step} />
          <Field
            label="Lead origem"
            value={
              deal.expand?.lead?.first_name &&
              `${deal.expand.lead.first_name} ${deal.expand.lead.last_name || ''}`
            }
          />
          <Field
            label="Probabilidade"
            value={deal.probability != null ? `${deal.probability}%` : undefined}
          />
          <Field label="Owner" value={deal.expand?.owner?.name} />
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Valor</div>
            <MoneyDisplay
              value={deal.revenue}
              currency={deal.expand?.currency}
              className="text-lg font-semibold"
            />
          </div>
          {deal.close_date && (
            <Field
              label="Fechado em"
              value={new Date(deal.close_date).toLocaleDateString('pt-BR')}
            />
          )}
        </Card>

        <div className="lg:col-span-2">
          <Card className="p-5">
            <ActivityTabs refType="deal" refId={deal.id} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value?: string | null
  icon?: React.ComponentType<{ className?: string }>
}) {
  if (!value) return null
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  )
}
