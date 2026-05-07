import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, CircleDollarSign, CheckSquare, ArrowUpRight } from 'lucide-react'
import { getLeads } from '@/services/leads'
import { getDeals } from '@/services/deals'
import { getTasks } from '@/services/tasks'
import { getDefaultCurrency, type Currency } from '@/services/currencies'
import { MoneyDisplay } from '@/components/MoneyDisplay'

export default function Home() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    myLeadsOpen: 0,
    myDealsOpen: 0,
    myTasksDue: 0,
    pipelineValue: 0,
  })
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [leads, deals, tasks, cur] = await Promise.all([
          getLeads(`owner = "${user?.id}"`),
          getDeals(`owner = "${user?.id}"`),
          getTasks(`assigned_to = "${user?.id}" && status != "Done" && status != "Canceled"`),
          getDefaultCurrency(),
        ])
        if (!mounted) return
        const openLeads = leads.filter(
          (l) => !l.expand?.status || ['Open', 'Ongoing'].includes(l.expand.status.type),
        ).length
        const openDeals = deals.filter(
          (d) => d.expand?.status?.type === 'Open' || d.expand?.status?.type === 'Ongoing',
        )
        const pipeline = openDeals.reduce((sum, d) => sum + (d.revenue_in_base ?? 0), 0)
        setStats({
          myLeadsOpen: openLeads,
          myDealsOpen: openDeals.length,
          myTasksDue: tasks.length,
          pipelineValue: pipeline,
        })
        setDefaultCurrency(cur)
      } catch (err) {
        console.error('failed to load home stats:', err)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [user?.id])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bem-vindo, {user?.name || 'usuário'}
        </h1>
        <p className="text-muted-foreground">Visão rápida do seu trabalho.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Leads abertos" value={stats.myLeadsOpen} icon={UserPlus} to="/leads" />
        <Stat label="Deals abertos" value={stats.myDealsOpen} icon={CircleDollarSign} to="/deals" />
        <Stat label="Tarefas pendentes" value={stats.myTasksDue} icon={CheckSquare} to="/tasks" />
        <Card className="p-4 flex flex-col gap-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Pipeline</span>
          <MoneyDisplay
            value={stats.pipelineValue}
            currency={defaultCurrency}
            className="text-2xl font-semibold"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Atalhos</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/leads">
              <Button variant="outline" className="w-full">
                Novo lead
              </Button>
            </Link>
            <Link to="/deals">
              <Button variant="outline" className="w-full">
                Novo deal
              </Button>
            </Link>
            <Link to="/contacts">
              <Button variant="outline" className="w-full">
                Novo contato
              </Button>
            </Link>
            <Link to="/tasks">
              <Button variant="outline" className="w-full">
                Nova tarefa
              </Button>
            </Link>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Onde ir</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/dashboard" className="text-primary hover:underline">
                Ver Dashboard configurável →
              </Link>
            </li>
            <li>
              <Link to="/import" className="text-primary hover:underline">
                Importar dados via CSV →
              </Link>
            </li>
            <li>
              <Link to="/help" className="text-primary hover:underline">
                Ler documentação →
              </Link>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  icon: Icon,
  to,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  to: string
}) {
  return (
    <Link to={to}>
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
          <div className="text-muted-foreground">
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground inline-flex items-center mt-2">
          Ver <ArrowUpRight className="h-3 w-3 ml-1" />
        </div>
      </Card>
    </Link>
  )
}
