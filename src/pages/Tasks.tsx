import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, Circle } from 'lucide-react'
import useRealtime from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { getTasks, updateTask, type TaskRecord } from '@/services/tasks'
import { StatusBadge } from '@/components/StatusBadge'

const STATUS_LABEL: Record<TaskRecord['status'], string> = {
  Backlog: 'Backlog',
  Todo: 'A fazer',
  InProgress: 'Em progresso',
  Done: 'Concluída',
  Canceled: 'Cancelada',
}
const STATUS_COLOR: Record<TaskRecord['status'], string> = {
  Backlog: 'gray',
  Todo: 'blue',
  InProgress: 'yellow',
  Done: 'green',
  Canceled: 'red',
}

export default function Tasks() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ownerFilter, setOwnerFilter] = useState('all')

  const load = () =>
    getTasks()
      .then(setTasks)
      .catch((e) => console.error(e))

  useEffect(() => {
    load()
  }, [])
  useRealtime('tasks', () => load())

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (ownerFilter === 'mine' && t.assigned_to !== user?.id) return false
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [tasks, statusFilter, ownerFilter, search, user?.id])

  const toggle = async (t: TaskRecord) => {
    try {
      await updateTask(t.id, { status: t.status === 'Done' ? 'Todo' : 'Done' })
      toast({ title: 'Atualizada' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
        <p className="text-muted-foreground">{filtered.length} tarefas</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar título…"
            />
          </div>
          <div className="w-[160px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                {Object.entries(STATUS_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[140px]">
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="mine">Minhas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="divide-y">
          {filtered.map((t) => (
            <div key={t.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50">
              <button
                type="button"
                onClick={() => toggle(t)}
                className="text-muted-foreground hover:text-emerald-600"
              >
                {t.status === 'Done' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className={t.status === 'Done' ? 'line-through text-muted-foreground' : ''}>
                  {t.title}
                </div>
                {t.description && (
                  <div className="text-xs text-muted-foreground truncate">{t.description}</div>
                )}
              </div>
              <StatusBadge label={STATUS_LABEL[t.status]} color={STATUS_COLOR[t.status]} />
              <span className="text-xs text-muted-foreground w-20 text-right">[{t.priority}]</span>
              <span className="text-xs text-muted-foreground w-32 truncate">
                {t.expand?.assigned_to?.name || '—'}
              </span>
              <span className="text-xs text-muted-foreground w-24 text-right">
                {t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR') : '—'}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Nenhuma tarefa.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
