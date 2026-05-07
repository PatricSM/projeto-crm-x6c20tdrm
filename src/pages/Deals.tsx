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
import { Plus, LayoutGrid, Table as TableIcon } from 'lucide-react'
import useRealtime from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { createDeal, getDeals, updateDeal, type DealRecord } from '@/services/deals'
import { getDealStatuses, type DealStatus } from '@/services/lookups'
import { getOrganizations, type OrganizationRecord } from '@/services/organizations'
import { StatusBadge } from '@/components/StatusBadge'
import { MoneyDisplay } from '@/components/MoneyDisplay'

type ViewMode = 'table' | 'kanban'

export default function Deals() {
  const { toast } = useToast()
  const [deals, setDeals] = useState<DealRecord[]>([])
  const [statuses, setStatuses] = useState<DealStatus[]>([])
  const [orgs, setOrgs] = useState<OrganizationRecord[]>([])
  const [view, setView] = useState<ViewMode>('table')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = async () => {
    try {
      const [d, s, o] = await Promise.all([getDeals(), getDealStatuses(), getOrganizations()])
      setDeals(d)
      setStatuses(s)
      setOrgs(o)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('deals', () => load())

  const filtered = useMemo(() => {
    return deals.filter((d) => {
      if (search) {
        const s = search.toLowerCase()
        return (
          d.name.toLowerCase().includes(s) ||
          (d.expand?.organization?.name || '').toLowerCase().includes(s)
        )
      }
      return true
    })
  }, [deals, search])

  const moveDeal = async (dealId: string, newStatus: string) => {
    try {
      await updateDeal(dealId, { status: newStatus })
      toast({ title: 'Deal movido' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">{filtered.length} negociações</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={view === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('table')}
              className="rounded-none"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('kanban')}
              className="rounded-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <CreateDealDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            statuses={statuses}
            orgs={orgs}
            onCreated={() => {
              setDialogOpen(false)
              toast({ title: 'Deal criado' })
              load()
            }}
          />
        </div>
      </div>

      <Card className="p-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou empresa…"
        />
      </Card>

      {view === 'table' ? (
        <DealsTable deals={filtered} />
      ) : (
        <KanbanBoard deals={filtered} statuses={statuses} onMove={moveDeal} />
      )}
    </div>
  )
}

function DealsTable({ deals }: { deals: DealRecord[] }) {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-muted-foreground border-b">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Empresa</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Valor</th>
              <th className="text-left px-4 py-3">Probabilidade</th>
              <th className="text-left px-4 py-3">Owner</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => (
              <tr key={d.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link to={`/deals/${d.id}`} className="font-medium text-primary hover:underline">
                    {d.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {d.expand?.organization?.name || '—'}
                </td>
                <td className="px-4 py-3">
                  {d.expand?.status && (
                    <StatusBadge label={d.expand.status.name} color={d.expand.status.color} />
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <MoneyDisplay value={d.revenue} currency={d.expand?.currency} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {d.probability != null ? `${d.probability}%` : '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{d.expand?.owner?.name || '—'}</td>
              </tr>
            ))}
            {deals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Nenhum deal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function KanbanBoard({
  deals,
  statuses,
  onMove,
}: {
  deals: DealRecord[]
  statuses: DealStatus[]
  onMove: (dealId: string, newStatus: string) => void
}) {
  const grouped: Record<string, DealRecord[]> = {}
  for (const s of statuses) grouped[s.id] = []
  for (const d of deals) {
    if (!grouped[d.status]) grouped[d.status] = []
    grouped[d.status].push(d)
  }
  return (
    <div className="grid grid-flow-col auto-cols-[280px] gap-4 overflow-x-auto pb-4">
      {statuses.map((st) => (
        <div key={st.id} className="bg-slate-100 rounded-lg p-3 min-h-[200px]">
          <div className="flex items-center justify-between mb-3">
            <StatusBadge label={st.name} color={st.color} />
            <span className="text-xs text-muted-foreground">{grouped[st.id]?.length || 0}</span>
          </div>
          <div className="space-y-2">
            {(grouped[st.id] || []).map((d) => (
              <Card key={d.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                <Link to={`/deals/${d.id}`} className="block">
                  <div className="font-medium text-sm">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.expand?.organization?.name || '—'}
                  </div>
                  <MoneyDisplay
                    value={d.revenue}
                    currency={d.expand?.currency}
                    className="text-sm font-semibold mt-2 block"
                  />
                </Link>
                <div className="mt-2">
                  <Select value={d.status} onValueChange={(v) => onMove(d.id, v)}>
                    <SelectTrigger className="h-7 text-xs">
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
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface CreateProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  statuses: DealStatus[]
  orgs: OrganizationRecord[]
  onCreated: () => void
}

function CreateDealDialog({ open, onOpenChange, statuses, orgs, onCreated }: CreateProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [organization, setOrg] = useState('')
  const [status, setStatus] = useState('')
  const [revenue, setRevenue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createDeal({
        name,
        organization,
        status,
        revenue: revenue ? Number(revenue) : undefined,
        owner: user?.id,
      })
      setName('')
      setOrg('')
      setStatus('')
      setRevenue('')
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
          <Plus className="h-4 w-4 mr-1" /> Novo deal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handle} className="space-y-3">
          <div>
            <Label>Nome*</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Empresa*</Label>
            <Select value={organization} onValueChange={setOrg}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha…" />
              </SelectTrigger>
              <SelectContent>
                {orgs.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status*</Label>
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
            <Label>Valor estimado</Label>
            <Input
              type="number"
              step="0.01"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting || !name || !organization || !status}>
              {submitting ? 'Criando…' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
