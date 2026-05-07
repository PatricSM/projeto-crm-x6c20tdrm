import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, ArrowRight, Mail, Phone, Building2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { convertLead, getLead, updateLead, type LeadRecord } from '@/services/leads'
import { getLeadStatuses, type LeadStatus } from '@/services/lookups'
import { ActivityTabs } from '@/components/ActivityTabs'
import { StatusBadge } from '@/components/StatusBadge'
import { SlaIndicator } from '@/components/SlaIndicator'
import { MoneyDisplay } from '@/components/MoneyDisplay'

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [lead, setLead] = useState<LeadRecord>()
  const [statuses, setStatuses] = useState<LeadStatus[]>([])
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([getLead(id), getLeadStatuses()])
      .then(([l, s]) => {
        setLead(l)
        setStatuses(s)
      })
      .catch((e) => {
        console.error(e)
        toast({ title: 'Lead não encontrado', variant: 'destructive' })
        navigate('/leads')
      })
  }, [id, navigate, toast])

  const changeStatus = async (newId: string) => {
    if (!lead) return
    try {
      const updated = await updateLead(lead.id, { status: newId })
      setLead(updated)
      toast({ title: 'Status atualizado' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleConvert = async () => {
    if (!lead) return
    setConverting(true)
    try {
      await convertLead(lead.id)
      toast({ title: 'Lead convertido em deal' })
      const fresh = await getLead(lead.id)
      setLead(fresh)
    } catch (err: any) {
      toast({ title: 'Erro ao converter', description: err.message, variant: 'destructive' })
    } finally {
      setConverting(false)
    }
  }

  if (!lead) return <div className="text-muted-foreground">Carregando…</div>

  const fullName = `${lead.first_name} ${lead.last_name || ''}`.trim()

  return (
    <div className="space-y-6 max-w-5xl">
      <Link to="/leads" className="text-sm text-muted-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Voltar para leads
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {lead.first_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">{fullName}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {lead.expand?.status && (
                <StatusBadge label={lead.expand.status.name} color={lead.expand.status.color} />
              )}
              <SlaIndicator
                status={lead.sla_status}
                responseDue={lead.response_due}
                firstRespondedOn={lead.first_responded_on}
              />
              {lead.converted && (
                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Convertido
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={lead.status || ''} onValueChange={changeStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Mudar status…" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!lead.converted && (
            <Button onClick={handleConvert} disabled={converting}>
              <ArrowRight className="h-4 w-4 mr-1" />
              {converting ? 'Convertendo…' : 'Converter em Deal'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 space-y-3 lg:col-span-1">
          <h3 className="font-semibold">Detalhes</h3>
          <Field label="Email" icon={Mail} value={lead.email} />
          <Field label="Telefone" icon={Phone} value={lead.mobile || lead.phone} />
          <Field
            label="Empresa"
            icon={Building2}
            value={lead.organization_name || lead.expand?.organization?.name}
          />
          <Field label="Cargo" value={lead.job_title} />
          <Field label="Origem" value={lead.expand?.source?.name} />
          <Field label="Indústria" value={lead.expand?.industry?.name} />
          <Field label="Funcionários" value={lead.no_of_employees} />
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Receita estimada
            </div>
            <MoneyDisplay
              value={lead.revenue}
              currency={lead.expand?.currency}
              className="text-lg font-semibold"
            />
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Card className="p-5">
            <ActivityTabs refType="lead" refId={lead.id} />
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
