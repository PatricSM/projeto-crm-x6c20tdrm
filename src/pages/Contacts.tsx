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
import { createContact, getContacts, type ContactRecord } from '@/services/contacts'
import { getOrganizations, type OrganizationRecord } from '@/services/organizations'

export default function Contacts() {
  const { toast } = useToast()
  const [contacts, setContacts] = useState<ContactRecord[]>([])
  const [orgs, setOrgs] = useState<OrganizationRecord[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const load = async () => {
    try {
      setContacts(await getContacts())
      setOrgs(await getOrganizations())
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('contacts', () => load())

  const filtered = useMemo(() => {
    if (!search) return contacts
    const s = search.toLowerCase()
    return contacts.filter(
      (c) => c.full_name.toLowerCase().includes(s) || (c.email || '').toLowerCase().includes(s),
    )
  }, [contacts, search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contatos</h1>
          <p className="text-muted-foreground">{filtered.length} contatos</p>
        </div>
        <CreateContactDialog
          open={open}
          onOpenChange={setOpen}
          orgs={orgs}
          onCreated={() => {
            setOpen(false)
            toast({ title: 'Contato criado' })
            load()
          }}
        />
      </div>

      <Card className="p-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email…"
        />
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-muted-foreground border-b">
              <tr>
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Telefone</th>
                <th className="text-left px-4 py-3">Empresa</th>
                <th className="text-left px-4 py-3">Cargo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/contacts/${c.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {c.full_name}
                    </Link>
                    {c.is_primary && (
                      <span className="ml-2 text-xs text-emerald-700">primário</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.mobile || c.phone || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.expand?.organization?.name || '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.job_title || '—'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Nenhum contato.
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

function CreateContactDialog({
  open,
  onOpenChange,
  orgs,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  orgs: OrganizationRecord[]
  onCreated: () => void
}) {
  const { toast } = useToast()
  const [full_name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [organization, setOrg] = useState('')
  const [job_title, setJobTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createContact({
        full_name,
        email: email || undefined,
        mobile: mobile || undefined,
        organization: organization || undefined,
        job_title: job_title || undefined,
      })
      setName('')
      setEmail('')
      setMobile('')
      setOrg('')
      setJobTitle('')
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
          <Plus className="h-4 w-4 mr-1" /> Novo contato
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo contato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handle} className="space-y-3">
          <div>
            <Label>Nome completo*</Label>
            <Input required value={full_name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Celular</Label>
              <Input value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Empresa</Label>
            <Select value={organization} onValueChange={setOrg}>
              <SelectTrigger>
                <SelectValue placeholder="Sem empresa…" />
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
            <Label>Cargo</Label>
            <Input value={job_title} onChange={(e) => setJobTitle(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting || !full_name}>
              {submitting ? 'Criando…' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
