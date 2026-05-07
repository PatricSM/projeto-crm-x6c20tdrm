import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DashboardWidget, WidgetType } from '@/services/dashboardWidgets'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: Partial<DashboardWidget>
  onSave: (data: Partial<DashboardWidget>) => Promise<void>
}

export function WidgetEditor({ open, onOpenChange, initial, onSave }: Props) {
  const [title, setTitle] = useState(initial?.title || '')
  const [type, setType] = useState<WidgetType>(initial?.type || 'kpi')
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>(initial?.size || 'sm')
  const [configJson, setConfigJson] = useState(
    JSON.stringify(initial?.config || { collection: 'leads' }, null, 2),
  )
  const [submitting, setSubmitting] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    let config = {}
    try {
      config = JSON.parse(configJson)
    } catch {
      alert('JSON inválido na config')
      return
    }
    setSubmitting(true)
    try {
      await onSave({ title, type, size, config: config as any })
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial?.id ? 'Editar widget' : 'Novo widget'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handle} className="space-y-3">
          <div>
            <Label>Título</Label>
            <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v: WidgetType) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kpi">KPI</SelectItem>
                  <SelectItem value="chart-line">Chart line</SelectItem>
                  <SelectItem value="chart-bar">Chart bar</SelectItem>
                  <SelectItem value="funnel">Funil</SelectItem>
                  <SelectItem value="table-top">Table top</SelectItem>
                  <SelectItem value="recent-activity">Atividade recente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tamanho</Label>
              <Select value={size} onValueChange={(v: 'sm' | 'md' | 'lg') => setSize(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Pequeno (1 col)</SelectItem>
                  <SelectItem value="md">Médio (2 cols)</SelectItem>
                  <SelectItem value="lg">Grande (3 cols)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Config (JSON)</Label>
            <Textarea
              rows={6}
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ex.: <code>{`{"collection":"leads","filter":"status.type ~ 'Open|Ongoing'"}`}</code>
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting || !title}>
              {submitting ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
