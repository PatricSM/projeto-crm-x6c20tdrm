import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trash2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import {
  createIndustry,
  createLeadSource,
  createLeadStatus,
  createLostReason,
  createTerritory,
  deleteIndustry,
  deleteLeadSource,
  deleteLeadStatus,
  deleteLostReason,
  deleteTerritory,
  getIndustries,
  getLeadSources,
  getLeadStatuses,
  getLostReasons,
  getTerritories,
  type LeadStatus,
  type NamedLookup,
} from '@/services/lookups'
import { createCurrency, deleteCurrency, getCurrencies, type Currency } from '@/services/currencies'
import {
  createSlaPolicy,
  deleteSlaPolicy,
  getSlaPolicies,
  type SlaPolicy,
} from '@/services/slaPolicies'
import { getBusinessHours, type BusinessHour } from '@/services/businessHours'

export default function Settings() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <Card className="p-6 text-muted-foreground">Apenas administradores.</Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie lookups, SLA, moedas e horários.</p>
      </div>

      <Tabs defaultValue="statuses">
        <TabsList>
          <TabsTrigger value="statuses">Status</TabsTrigger>
          <TabsTrigger value="lookups">Lookups</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
          <TabsTrigger value="currencies">Moedas</TabsTrigger>
          <TabsTrigger value="bhours">Business Hours</TabsTrigger>
        </TabsList>
        <TabsContent value="statuses" className="mt-4">
          <LeadStatusesPane />
        </TabsContent>
        <TabsContent value="lookups" className="mt-4 space-y-4">
          <LookupsPane />
        </TabsContent>
        <TabsContent value="sla" className="mt-4">
          <SlaPane />
        </TabsContent>
        <TabsContent value="currencies" className="mt-4">
          <CurrenciesPane />
        </TabsContent>
        <TabsContent value="bhours" className="mt-4">
          <BusinessHoursPane />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function LeadStatusesPane() {
  const { toast } = useToast()
  const [items, setItems] = useState<LeadStatus[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState<LeadStatus['type']>('Open')
  const [color, setColor] = useState('gray')

  const load = () => getLeadStatuses().then(setItems)
  useEffect(() => {
    load()
  }, [])

  const add = async () => {
    if (!name) return
    try {
      await createLeadStatus({ name, type, color })
      setName('')
      load()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir?')) return
    await deleteLeadStatus(id)
    load()
  }

  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-4">Status de Leads</h3>
      <div className="space-y-2 mb-4">
        {items.map((s) => (
          <div key={s.id} className="flex items-center justify-between border-b pb-2">
            <span className="text-sm">
              {s.name} <span className="text-muted-foreground">({s.type})</span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => remove(s.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 items-end">
        <div>
          <Label className="text-xs">Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Tipo</Label>
          <Select value={type} onValueChange={(v: LeadStatus['type']) => setType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Ongoing">Ongoing</SelectItem>
              <SelectItem value="OnHold">OnHold</SelectItem>
              <SelectItem value="Won">Won</SelectItem>
              <SelectItem value="Lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Cor</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['gray', 'blue', 'green', 'red', 'yellow', 'purple', 'orange', 'cyan'].map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={add} disabled={!name}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
    </Card>
  )
}

function LookupsPane() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SimpleLookupPane
        title="Origens de Lead"
        getter={getLeadSources}
        creator={(name) => createLeadSource({ name })}
        deleter={deleteLeadSource}
      />
      <SimpleLookupPane
        title="Indústrias"
        getter={getIndustries}
        creator={(name) => createIndustry({ name })}
        deleter={deleteIndustry}
      />
      <SimpleLookupPane
        title="Territórios"
        getter={getTerritories}
        creator={(name) => createTerritory({ name })}
        deleter={deleteTerritory}
      />
      <SimpleLookupPane
        title="Razões de perda"
        getter={getLostReasons}
        creator={(name) => createLostReason({ name })}
        deleter={deleteLostReason}
      />
    </div>
  )
}

function SimpleLookupPane({
  title,
  getter,
  creator,
  deleter,
}: {
  title: string
  getter: () => Promise<NamedLookup[]>
  creator: (name: string) => Promise<unknown>
  deleter: (id: string) => Promise<unknown>
}) {
  const { toast } = useToast()
  const [items, setItems] = useState<NamedLookup[]>([])
  const [name, setName] = useState('')

  const load = () => getter().then(setItems)
  useEffect(() => {
    load()
  }, [])

  const add = async () => {
    if (!name) return
    try {
      await creator(name)
      setName('')
      load()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir?')) return
    await deleter(id)
    load()
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
        {items.map((s) => (
          <div key={s.id} className="flex items-center justify-between text-sm border-b py-1">
            <span>{s.name}</span>
            <Button variant="ghost" size="sm" onClick={() => remove(s.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Novo…" />
        <Button onClick={add} disabled={!name}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}

function SlaPane() {
  const { toast } = useToast()
  const [items, setItems] = useState<SlaPolicy[]>([])
  const [bh, setBh] = useState<BusinessHour[]>([])
  const [name, setName] = useState('')
  const [priority, setPriority] = useState<SlaPolicy['priority']>('Medium')
  const [responseMin, setResponseMin] = useState('60')
  const [resolutionMin, setResolutionMin] = useState('1440')

  const load = () =>
    Promise.all([getSlaPolicies(), getBusinessHours()]).then(([p, b]) => {
      setItems(p)
      setBh(b)
    })
  useEffect(() => {
    load()
  }, [])

  const add = async () => {
    if (!name) return
    try {
      await createSlaPolicy({
        name,
        priority,
        response_time_min: Number(responseMin),
        resolution_time_min: Number(resolutionMin),
        business_hours: bh.map((b) => b.id),
        is_active: true,
      })
      setName('')
      load()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir?')) return
    await deleteSlaPolicy(id)
    load()
  }

  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-4">Políticas de SLA</h3>
      <div className="space-y-2 mb-4">
        {items.map((p) => (
          <div key={p.id} className="flex items-center justify-between border-b pb-2 text-sm">
            <span>
              <strong>{p.name}</strong> · {p.priority} · resposta {p.response_time_min}min /
              resolução {p.resolution_time_min}min
            </span>
            <Button variant="ghost" size="sm" onClick={() => remove(p.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 items-end">
        <div>
          <Label className="text-xs">Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Prioridade</Label>
          <Select value={priority} onValueChange={(v: SlaPolicy['priority']) => setPriority(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Resposta (min)</Label>
          <Input
            type="number"
            value={responseMin}
            onChange={(e) => setResponseMin(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-xs">Resolução (min)</Label>
          <Input
            type="number"
            value={resolutionMin}
            onChange={(e) => setResolutionMin(e.target.value)}
          />
        </div>
        <Button onClick={add} disabled={!name}>
          Add
        </Button>
      </div>
    </Card>
  )
}

function CurrenciesPane() {
  const { toast } = useToast()
  const [items, setItems] = useState<Currency[]>([])
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [rate, setRate] = useState('1')

  const load = () => getCurrencies().then(setItems)
  useEffect(() => {
    load()
  }, [])

  const add = async () => {
    if (!code || !name || !symbol) return
    try {
      await createCurrency({
        code,
        name,
        symbol,
        exchange_rate: Number(rate),
      })
      setCode('')
      setName('')
      setSymbol('')
      setRate('1')
      load()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir?')) return
    await deleteCurrency(id)
    load()
  }

  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-4">Moedas</h3>
      <div className="space-y-2 mb-4">
        {items.map((c) => (
          <div key={c.id} className="flex items-center justify-between border-b pb-2 text-sm">
            <span>
              <strong>{c.code}</strong> {c.symbol} · {c.name} · taxa {c.exchange_rate}
              {c.is_default && <span className="ml-2 text-emerald-600">[default]</span>}
            </span>
            {!c.is_default && (
              <Button variant="ghost" size="sm" onClick={() => remove(c.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 items-end">
        <div>
          <Label className="text-xs">Código</Label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
          />
        </div>
        <div>
          <Label className="text-xs">Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs">Símbolo</Label>
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} maxLength={4} />
        </div>
        <div>
          <Label className="text-xs">Taxa</Label>
          <Input
            type="number"
            step="0.0001"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
        <Button onClick={add} disabled={!code || !name || !symbol}>
          Add
        </Button>
      </div>
    </Card>
  )
}

function BusinessHoursPane() {
  const [items, setItems] = useState<BusinessHour[]>([])
  useEffect(() => {
    getBusinessHours().then(setItems)
  }, [])
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-4">Horário comercial</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Edição completa será adicionada em uma próxima iteração. Os horários atuais foram seedados
        como Seg-Sex 9h-18h.
      </p>
      <div className="space-y-1 text-sm">
        {items.map((b) => (
          <div key={b.id} className="border-b py-1">
            {days[Number(b.day_of_week)]} · {b.start_time} – {b.end_time} ({b.name})
          </div>
        ))}
      </div>
    </Card>
  )
}
