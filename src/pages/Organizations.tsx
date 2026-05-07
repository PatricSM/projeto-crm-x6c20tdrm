import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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
import { Plus } from 'lucide-react'
import useRealtime from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import {
  createOrganization,
  getOrganizations,
  type OrganizationRecord,
} from '@/services/organizations'
import { getIndustries, getTerritories, type NamedLookup } from '@/services/lookups'
import { getCurrencies, type Currency } from '@/services/currencies'
import { MoneyDisplay } from '@/components/MoneyDisplay'

export default function Organizations() {
  const { toast } = useToast()
  const [orgs, setOrgs] = useState<OrganizationRecord[]>([])
  const [industries, setIndustries] = useState<NamedLookup[]>([])
  const [territories, setTerritories] = useState<NamedLookup[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const load = async () => {
    try {
      const [o, i, t, c] = await Promise.all([
        getOrganizations(),
        getIndustries(),
        getTerritories(),
        getCurrencies(),
      ])
      setOrgs(o)
      setIndustries(i)
      setTerritories(t)
      setCurrencies(c)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('organizations', () => load())

  const filtered = useMemo(() => {
    if (!search) return orgs
    const s = search.toLowerCase()
    return orgs.filter((o) => o.name.toLowerCase().includes(s))
  }, [orgs, search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">{filtered.length} organizações</p>
        </div>
        <CreateOrgDialog
          open={open}
          onOpenChange={setOpen}
          industries={industries}
          territories={territories}
          currencies={currencies}
          onCreated={() => {
            setOpen(false)
            toast({ title: 'Empresa criada' })
            load()
          }}
        />
      </div>

      <Card className="p-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome…"
        />
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-muted-foreground border-b">
              <tr>
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3">Indústria</th>
                <th className="text-left px-4 py-3">Território</th>
                <th className="text-left px-4 py-3">Funcionários</th>
                <th className="text-right px-4 py-3">Receita</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/organizations/${o.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {o.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {o.expand?.industry?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {o.expand?.territory?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{o.no_of_employees || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <MoneyDisplay value={o.revenue} currency={o.expand?.currency} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhuma empresa.
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

function CreateOrgDialog({
  open,
  onOpenChange,
  industries,
  territories,
  currencies,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  industries: NamedLookup[]
  territories: NamedLookup[]
  currencies: Currency[]
  onCreated: () => void
}) {
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [territory, setTerritory] = useState('')
  const [currency, setCurrency] = useState('')
  const [revenue, setRevenue] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createOrganization({
        name,
        website: website || undefined,
        industry: industry || undefined,
        territory: territory || undefined,
        currency: currency || undefined,
        revenue: revenue ? Number(revenue) : undefined,
      })
      setName('')
      setWebsite('')
      setIndustry('')
      setTerritory('')
      setCurrency('')
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
          <Plus className="h-4 w-4 mr-1" /> Nova empresa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova empresa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handle} className="space-y-3">
          <div>
            <Label>Nome*</Label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Indústria</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Sem indústria…" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Território</Label>
              <Select value={territory} onValueChange={setTerritory}>
                <SelectTrigger>
                  <SelectValue placeholder="Sem território…" />
                </SelectTrigger>
                <SelectContent>
                  {territories.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Moeda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Padrão…" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} {c.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Receita anual</Label>
              <Input
                type="number"
                step="0.01"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting || !name}>
              {submitting ? 'Criando…' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
