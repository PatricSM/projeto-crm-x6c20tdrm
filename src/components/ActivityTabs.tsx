import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { createNote, getNotesFor, type NoteRecord } from '@/services/notes'
import { createTask, getTasksFor, updateTask, type TaskRecord } from '@/services/tasks'
import { Plus, CheckCircle2, Circle } from 'lucide-react'

interface Props {
  refType: 'lead' | 'deal' | 'contact' | 'organization'
  refId: string
}

export function ActivityTabs({ refType, refId }: Props) {
  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList>
        <TabsTrigger value="notes">Notas</TabsTrigger>
        <TabsTrigger value="tasks">Tarefas</TabsTrigger>
      </TabsList>
      <TabsContent value="notes" className="mt-4">
        <NotesPane refType={refType} refId={refId} />
      </TabsContent>
      <TabsContent value="tasks" className="mt-4">
        <TasksPane refType={refType} refId={refId} />
      </TabsContent>
    </Tabs>
  )
}

function NotesPane({ refType, refId }: Props) {
  const { toast } = useToast()
  const [notes, setNotes] = useState<NoteRecord[]>([])
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () =>
    getNotesFor(refType, refId)
      .then(setNotes)
      .catch((e) => console.error(e))

  useEffect(() => {
    load()
  }, [refType, refId])

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    try {
      await createNote({ content, reference_type: refType, reference_id: refId })
      setContent('')
      toast({ title: 'Nota adicionada' })
      load()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handle} className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Adicionar nota…"
          rows={3}
        />
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Salvando…' : 'Adicionar nota'}
        </Button>
      </form>
      <div className="space-y-2">
        {notes.map((n) => (
          <Card key={n.id} className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{n.expand?.author?.name || 'Alguém'}</span>
              <span>{new Date(n.created).toLocaleString('pt-BR')}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{n.content}</p>
          </Card>
        ))}
        {notes.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-6">Nenhuma nota.</p>
        )}
      </div>
    </div>
  )
}

function TasksPane({ refType, refId }: Props) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [submitting, setSubmitting] = useState(false)

  const load = () =>
    getTasksFor(refType, refId)
      .then(setTasks)
      .catch((e) => console.error(e))

  useEffect(() => {
    load()
  }, [refType, refId])

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await createTask({
        title,
        priority,
        status: 'Todo',
        reference_type: refType,
        reference_id: refId,
        assigned_to: user?.id,
      })
      setTitle('')
      toast({ title: 'Tarefa criada' })
      load()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const toggle = async (t: TaskRecord) => {
    const newStatus = t.status === 'Done' ? 'Todo' : 'Done'
    try {
      await updateTask(t.id, { status: newStatus })
      load()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handle} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nova tarefa…"
          className="flex-1"
        />
        <Select value={priority} onValueChange={(v: 'Low' | 'Medium' | 'High') => setPriority(v)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Baixa</SelectItem>
            <SelectItem value="Medium">Média</SelectItem>
            <SelectItem value="High">Alta</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={submitting}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>
      <div className="space-y-1">
        {tasks.map((t) => (
          <Card key={t.id} className="p-3 flex items-center gap-2">
            <button type="button" onClick={() => toggle(t)} className="text-muted-foreground">
              {t.status === 'Done' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
            <div className="flex-1">
              <span className={t.status === 'Done' ? 'line-through text-muted-foreground' : ''}>
                {t.title}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">[{t.priority}]</span>
            </div>
          </Card>
        ))}
        {tasks.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-6">Nenhuma tarefa.</p>
        )}
      </div>
    </div>
  )
}
