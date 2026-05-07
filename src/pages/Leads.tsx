import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Filter, Search } from 'lucide-react'
import useRealtime from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { createLead, getLeads, type LeadRecord } from '@/services/leads'
import { getLeadStatuses, getLeadSources } from '@/services/lookups'
import type { LeadStatus, NamedLookup } from '@/services/lookups'
import { StatusBadge } from '@/components/StatusBadge'
import { SlaIndicator } from '@/components/SlaIndicator'

export default function Leads() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [statuses, setStatuses] = useState<LeadStatus[]>([])
  const [sources, setSources] = useState<NamedLookup[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = async () => {
    try {
      const [list, st, src] = await Promise.all([getLeads(), getLeadStatuses(), getLeadSources()])
      setLeads(list)
      setStatuses(st)
      setSources(src)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useRealtime('leads', () => load())

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false
      if (ownerFilter === 'mine' && l.owner !== user?.id) return false
      if (search) {
        const s = search.toLowerCase()
        const fullName = `${l.first_name} ${l.last_name || ''}`.toLowerCase()
        if (!fullName.includes(s) && !(l.email || '').toLowerCase().includes(s)) return false
      }
      return true
    })
  }, [leads, statusFilter, ownerFilter, search, user?.id])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            {filtered.length} de {leads.length}
          </p>
        </div>
        <CreateLeadDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          statuses={statuses}
          sources={sources}
          onCreated={() => {
            setDialogOpen(false)
            toast({ title: 'Lead criado' })
            load()
          }}
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome ou email…"
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-[160px]">
            <Label className="text-xs">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[140px]">
            <Label className="text-xs">Owner</Label>
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="mine">Meus</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(search || statusFilter !== 'all' || ownerFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setOwnerFilter('all')
              }}
            >
              <Filter className="h-3 w-3 mr-1" /> Limpar
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-muted-foreground border-b">
              <tr>
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Origem</th>
                <th className="text-left px-4 py-3">SLA</th>
                <th className="text-left px-4 py-3">Owner</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/leads/${l.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {l.first_name} {l.last_name}
                    </Link>
                    {l.organization_name && (
                      <div className="text-xs text-muted-foreground">{l.organization_name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.email}</td>
                  <td className="px-4 py-3">
                    {l.expand?.status && (
                      <StatusBadge label={l.expand.status.name} color={l.expand.status.color} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.expand?.source?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <SlaIndicator
                      status={l.sla_status}
                      responseDue={l.response_due}
                      firstRespondedOn={l.first_responded_on}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.expand?.owner?.name || '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

interface CreateProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  statuses: LeadStatus[]
  sources: NamedLookup[]
  onCreated: () => void
}

function CreateLeadDialog({ open, onOpenChange, statuses, sources, onCreated }: CreateProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [first_name, setFirst] = useState('')
  const [last_name, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [organization_name, setOrg] = useState('')
  const [status, setStatus] = useState<string>('')
  const [source, setSource] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const reset = () => {
    setFirst('')
    setLast('')
    setEmail('')
    setOrg('')
    setStatus('')
    setSource('')
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createLead({
        first_name,
        last_name: last_name || undefined,
        email: email || undefined,
        organization_name: organization_name || undefined,
        status: status || undefined,
        source: source || undefined,
        owner: user?.id,
      })
      reset()
      onCreated()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" /> Novo lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handle} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nome*</Label>
              <Input required value={first_name} onChange={(e) => setFirst(e.target.value)} />
            </div>
            <div>
              <Label>Sobrenome</Label>
              <Input value={last_name} onChange={(e) => setLast(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Empresa</Label>
            <Input value={organization_name} onChange={(e) => setOrg(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha…" />
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
            <div>
              <Label>Origem</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha…" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Criando…' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
