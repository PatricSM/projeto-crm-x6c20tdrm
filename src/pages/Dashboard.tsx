import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Plus, Check, ArrowUp, ArrowDown } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  createWidget,
  deleteWidget,
  getMyWidgets,
  updateWidget,
  type DashboardWidget,
} from '@/services/dashboardWidgets'
import { Widget } from '@/components/Widget'
import { WidgetEditor } from '@/components/WidgetEditor'

export default function Dashboard() {
  const { toast } = useToast()
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DashboardWidget>()

  const load = () =>
    getMyWidgets()
      .then((list) => setWidgets(list))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const handleAdd = () => {
    setEditTarget(undefined)
    setEditorOpen(true)
  }

  const handleEdit = (w: DashboardWidget) => {
    setEditTarget(w)
    setEditorOpen(true)
  }

  const handleSave = async (data: Partial<DashboardWidget>) => {
    try {
      if (editTarget?.id) {
        await updateWidget(editTarget.id, data)
        toast({ title: 'Widget atualizado' })
      } else {
        const maxPos = widgets.length === 0 ? 0 : Math.max(...widgets.map((w) => w.position))
        await createWidget({ ...data, position: maxPos + 1 })
        toast({ title: 'Widget criado' })
      }
      load()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (w: DashboardWidget) => {
    if (!confirm(`Excluir widget "${w.title}"?`)) return
    await deleteWidget(w.id)
    toast({ title: 'Widget excluído' })
    load()
  }

  const move = async (w: DashboardWidget, direction: 'up' | 'down') => {
    const idx = widgets.findIndex((x) => x.id === w.id)
    const target = direction === 'up' ? widgets[idx - 1] : widgets[idx + 1]
    if (!target) return
    try {
      await Promise.all([
        updateWidget(w.id, { position: target.position }),
        updateWidget(target.id, { position: w.position }),
      ])
      load()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  if (loading) return <div className="text-muted-foreground">Carregando…</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Seus widgets configurados.</p>
        </div>
        <div className="flex gap-2">
          {editing && (
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar widget
            </Button>
          )}
          <Button variant={editing ? 'default' : 'outline'} onClick={() => setEditing((v) => !v)}>
            {editing ? (
              <>
                <Check className="h-4 w-4 mr-1" /> Concluir edição
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-1" /> Editar
              </>
            )}
          </Button>
        </div>
      </div>

      {widgets.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground mb-3">Nenhum widget. Clique em Editar → Adicionar.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets.map((w, i) => (
            <div
              key={w.id}
              className={
                w.size === 'lg'
                  ? 'sm:col-span-2 lg:col-span-3'
                  : w.size === 'md'
                    ? 'sm:col-span-2'
                    : ''
              }
            >
              <div className="relative">
                <Widget
                  widget={w}
                  editing={editing}
                  onEdit={() => handleEdit(w)}
                  onDelete={() => handleDelete(w)}
                />
                {editing && (
                  <div className="absolute top-2 left-2 flex gap-1">
                    {i > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => move(w, 'up')}>
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                    )}
                    {i < widgets.length - 1 && (
                      <Button variant="ghost" size="sm" onClick={() => move(w, 'down')}>
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <WidgetEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        initial={editTarget}
        onSave={handleSave}
      />
    </div>
  )
}
