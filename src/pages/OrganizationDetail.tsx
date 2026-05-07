import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Globe, Building2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getOrganization, type OrganizationRecord } from '@/services/organizations'
import { getContacts, type ContactRecord } from '@/services/contacts'
import { getDeals, type DealRecord } from '@/services/deals'
import { ActivityTabs } from '@/components/ActivityTabs'
import { MoneyDisplay } from '@/components/MoneyDisplay'

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [org, setOrg] = useState<OrganizationRecord>()
  const [contacts, setContacts] = useState<ContactRecord[]>([])
  const [deals, setDeals] = useState<DealRecord[]>([])

  useEffect(() => {
    if (!id) return
    getOrganization(id)
      .then(async (o) => {
        setOrg(o)
        const [allContacts, allDeals] = await Promise.all([getContacts(), getDeals()])
        setContacts(allContacts.filter((c) => c.organization === id))
        setDeals(allDeals.filter((d) => d.organization === id))
      })
      .catch(() => {
        toast({ title: 'Empresa não encontrada', variant: 'destructive' })
        navigate('/organizations')
      })
  }, [id, navigate, toast])

  if (!org) return <div className="text-muted-foreground">Carregando…</div>

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        to="/organizations"
        className="text-sm text-muted-foreground inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-3 w-3" /> Voltar
      </Link>

      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            <Building2 className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">{org.name}</h1>
          {org.website && (
            <a
              href={org.website}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              <Globe className="h-3 w-3" />
              {org.website}
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 space-y-3 lg:col-span-1">
          <h3 className="font-semibold">Detalhes</h3>
          <Field label="Indústria" value={org.expand?.industry?.name} />
          <Field label="Território" value={org.expand?.territory?.name} />
          <Field label="Funcionários" value={org.no_of_employees} />
          <Field label="Endereço" value={org.address} />
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Receita anual
            </div>
            <MoneyDisplay
              value={org.revenue}
              currency={org.expand?.currency}
              className="text-lg font-semibold"
            />
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="font-semibold mb-3">Contatos ({contacts.length})</h3>
            <div className="space-y-1">
              {contacts.map((c) => (
                <Link
                  key={c.id}
                  to={`/contacts/${c.id}`}
                  className="block py-2 border-b last:border-0 text-sm hover:bg-slate-50 px-2 -mx-2 rounded"
                >
                  <span className="font-medium">{c.full_name}</span>
                  <span className="ml-2 text-muted-foreground">{c.email}</span>
                </Link>
              ))}
              {contacts.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem contatos.</p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-3">Deals ({deals.length})</h3>
            <div className="space-y-1">
              {deals.map((d) => (
                <Link
                  key={d.id}
                  to={`/deals/${d.id}`}
                  className="block py-2 border-b last:border-0 text-sm hover:bg-slate-50 px-2 -mx-2 rounded flex justify-between"
                >
                  <span className="font-medium">{d.name}</span>
                  <MoneyDisplay value={d.revenue} currency={d.expand?.currency} />
                </Link>
              ))}
              {deals.length === 0 && <p className="text-sm text-muted-foreground">Sem deals.</p>}
            </div>
          </Card>

          <Card className="p-5">
            <ActivityTabs refType="organization" refId={org.id} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  )
}
