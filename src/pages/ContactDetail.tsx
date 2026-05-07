import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Mail, Phone, Building2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getContact, type ContactRecord } from '@/services/contacts'
import { ActivityTabs } from '@/components/ActivityTabs'

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [contact, setContact] = useState<ContactRecord>()

  useEffect(() => {
    if (!id) return
    getContact(id)
      .then(setContact)
      .catch(() => {
        toast({ title: 'Contato não encontrado', variant: 'destructive' })
        navigate('/contacts')
      })
  }, [id, navigate, toast])

  if (!contact) return <div className="text-muted-foreground">Carregando…</div>

  return (
    <div className="space-y-6 max-w-5xl">
      <Link to="/contacts" className="text-sm text-muted-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Voltar
      </Link>

      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {contact.full_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">{contact.full_name}</h1>
          <p className="text-muted-foreground text-sm">{contact.job_title || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 space-y-3 lg:col-span-1">
          <h3 className="font-semibold">Contato</h3>
          <Field label="Email" icon={Mail} value={contact.email} />
          <Field label="Celular" icon={Phone} value={contact.mobile} />
          <Field label="Telefone" icon={Phone} value={contact.phone} />
          <Field label="Empresa" icon={Building2} value={contact.expand?.organization?.name} />
        </Card>

        <div className="lg:col-span-2">
          <Card className="p-5">
            <ActivityTabs refType="contact" refId={contact.id} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value?: string | null
  icon?: React.ComponentType<{ className?: string }>
}) {
  if (!value) return null
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  )
}
