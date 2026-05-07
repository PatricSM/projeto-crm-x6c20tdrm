import { useEffect, useState } from 'react'
import { getTasks, createTask, updateTaskStatus, getDeals } from '@/services/crm'
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
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { RecordModel } from 'pocketbase'
import { Badge } from '@/components/ui/badge'
import { Calendar, Flag } from 'lucide-react'

const priorityColor: Record<string, string> = {
  High: 'text-rose-500',
  Medium: 'text-amber-500',
  Low: 'text-blue-500',
}

export default function Tasks() {
  const [tasks, setTasks] = useState<RecordModel[]>([])
  const [deals, setDeals] = useState<RecordModel[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', priority: 'Medium', deal: '' })

  const loadData = async () => {
    try {
      setTasks(await getTasks())
      setDeals(await getDeals())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('tasks', loadData)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTask({ ...formData, status: 'Todo' })
      toast.success('Tarefa adicionada!')
      setOpen(false)
      setFormData({ title: '', priority: 'Medium', deal: '' })
    } catch (err) {
      toast.error('Erro ao adicionar tarefa')
    }
  }

  const toggleTask = async (task: RecordModel) => {
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done'
    // Optimistic
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)))
    try {
      await updateTaskStatus(task.id, newStatus)
    } catch (err) {
      toast.error('Erro ao atualizar tarefa')
      loadData()
    }
  }

  const pending = tasks.filter((t) => t.status !== 'Done')
  const completed = tasks.filter((t) => t.status === 'Done')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">Gerencie o que precisa ser feito.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Nova Tarefa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Tarefa</DialogTitle>
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
                <Label>Prioridade</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Baixa</option>
                  <option value="Medium">Média</option>
                  <option value="High">Alta</option>
                </select>
              </div>
              <div>
                <Label>Negócio Relacionado</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.deal}
                  onChange={(e) => setFormData({ ...formData, deal: e.target.value })}
                >
                  <option value="">Nenhum</option>
                  {deals.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Pendentes ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 bg-white p-4 rounded-lg border shadow-sm"
              >
                <Checkbox
                  className="mt-1"
                  checked={false}
                  onCheckedChange={() => toggleTask(task)}
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{task.title}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span
                      className={`flex items-center gap-1 font-medium ${priorityColor[task.priority]}`}
                    >
                      <Flag className="w-3 h-3" />{' '}
                      {task.priority === 'High'
                        ? 'Alta'
                        : task.priority === 'Medium'
                          ? 'Média'
                          : 'Baixa'}
                    </span>
                    {task.expand?.deal && (
                      <Badge variant="outline" className="text-[10px] font-normal">
                        Negócio: {task.expand.deal.title}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <p className="text-muted-foreground text-sm">Tudo limpo por aqui!</p>
            )}
          </div>
        </div>

        {completed.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-slate-500">Concluídas</h2>
            <div className="space-y-2 opacity-60">
              {completed.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-dashed"
                >
                  <Checkbox
                    className="mt-1"
                    checked={true}
                    onCheckedChange={() => toggleTask(task)}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-500 line-through">{task.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
