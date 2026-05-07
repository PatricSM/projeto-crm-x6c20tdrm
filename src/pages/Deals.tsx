import { useEffect, useState } from 'react'
import { getDeals, updateDealStage, createDeal, getContacts, getCompanies } from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'
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
import { toast } from 'sonner'
import { RecordModel } from 'pocketbase'
import { Clock } from 'lucide-react'

const STAGES = [
  { id: 'Lead', label: 'Lead', color: 'border-slate-200' },
  { id: 'Qualified', label: 'Qualificado', color: 'border-blue-200' },
  { id: 'Proposal', label: 'Proposta', color: 'border-amber-200' },
  { id: 'Negotiation', label: 'Negociação', color: 'border-purple-200' },
  { id: 'Closed_Won', label: 'Ganho', color: 'border-emerald-200' },
  { id: 'Closed_Lost', label: 'Perdido', color: 'border-rose-200' },
]

export default function Deals() {
  const [deals, setDeals] = useState<RecordModel[]>([])
  const [contacts, setContacts] = useState<RecordModel[]>([])
  const [companies, setCompanies] = useState<RecordModel[]>([])
  const [open, setOpen] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    value: '',
    stage: 'Lead',
    contact: '',
    company: '',
  })

  const loadData = async () => {
    try {
      const [dls, cts, cps] = await Promise.all([getDeals(), getContacts(), getCompanies()])
      setDeals(dls)
      setContacts(cts)
      setCompanies(cps)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('deals', loadData)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createDeal({ ...formData, value: Number(formData.value) || 0 })
      toast.success('Negócio criado!')
      setOpen(false)
      setFormData({ title: '', value: '', stage: 'Lead', contact: '', company: '' })
    } catch (err) {
      toast.error('Erro ao criar negócio')
    }
  }

  const handleDragStart = (id: string) => {
    setDraggedId(id)
  }
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  const handleDrop = async (stage: string) => {
    if (!draggedId) return
    const deal = deals.find((d) => d.id === draggedId)
    if (deal && deal.stage !== stage) {
      // Optimistic update
      setDeals((prev) => prev.map((d) => (d.id === draggedId ? { ...d, stage } : d)))
      try {
        await updateDealStage(draggedId, stage)
      } catch (err) {
        toast.error('Erro ao mover negócio')
        loadData() // Revert
      }
    }
    setDraggedId(null)
  }

  const formatMoney = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Negócios</h1>
          <p className="text-muted-foreground">Acompanhe e mova oportunidades no pipeline.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Novo Negócio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Negócio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contato</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  >
                    <option value="">Nenhum</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Empresa</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  >
                    <option value="">Nenhuma</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {STAGES.map((stage) => {
            const columnDeals = deals.filter((d) => d.stage === stage.id)
            const sum = columnDeals.reduce((acc, d) => acc + (d.value || 0), 0)

            return (
              <div
                key={stage.id}
                className="w-80 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                <div
                  className={`p-3 border-t-4 rounded-t-xl ${stage.color} bg-white flex justify-between items-center shadow-sm`}
                >
                  <h3 className="font-semibold text-slate-700">{stage.label}</h3>
                  <div className="text-xs font-medium text-slate-500">{formatMoney(sum)}</div>
                </div>
                <div className="p-2 flex-1 overflow-y-auto space-y-2">
                  {columnDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal.id)}
                      className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <div className="font-medium text-sm text-slate-900 mb-1">{deal.title}</div>
                      <div className="text-primary font-semibold text-sm mb-2">
                        {formatMoney(deal.value)}
                      </div>
                      {deal.expand?.company && (
                        <div className="text-xs text-slate-500 mb-1">
                          {deal.expand.company.name}
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-3 border-t pt-2">
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          ID: {deal.id.slice(0, 5)}
                        </span>
                        {/* Mocking overdue indicator for UI */}
                        {Math.random() > 0.7 && <Clock className="w-3 h-3 text-rose-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
