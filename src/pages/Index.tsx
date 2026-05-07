import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CircleDollarSign, Target, Briefcase, CheckCircle2 } from 'lucide-react'
import { getDeals, getTasks } from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { RecordModel } from 'pocketbase'

export default function Index() {
  const [deals, setDeals] = useState<RecordModel[]>([])
  const [tasks, setTasks] = useState<RecordModel[]>([])

  const loadData = async () => {
    try {
      const [dealsData, tasksData] = await Promise.all([getDeals(), getTasks()])
      setDeals(dealsData)
      setTasks(tasksData)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('deals', loadData)
  useRealtime('tasks', loadData)

  const stats = useMemo(() => {
    const totalDeals = deals.length
    const pipelineValue = deals
      .filter((d) => d.stage !== 'Closed_Lost' && d.stage !== 'Closed_Won')
      .reduce((acc, d) => acc + (d.value || 0), 0)
    const wonDeals = deals.filter((d) => d.stage === 'Closed_Won').length
    const conversionRate = totalDeals ? Math.round((wonDeals / totalDeals) * 100) : 0
    const pendingTasks = tasks.filter((t) => t.status !== 'Done').length

    return { totalDeals, pipelineValue, conversionRate, pendingTasks }
  }, [deals, tasks])

  const chartData = useMemo(() => {
    const stages = [
      { name: 'Lead', key: 'Lead' },
      { name: 'Qualificado', key: 'Qualified' },
      { name: 'Proposta', key: 'Proposal' },
      { name: 'Negociação', key: 'Negotiation' },
      { name: 'Ganho', key: 'Closed_Won' },
    ]
    return stages.map((s) => ({
      name: s.name,
      total: deals.filter((d) => d.stage === s.key).reduce((acc, d) => acc + (d.value || 0), 0),
    }))
  }, [deals])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do seu pipeline e atividades.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Negócios</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeals}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Pipeline</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats.pipelineValue)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingTasks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 lg:col-span-5 shadow-sm">
          <CardHeader>
            <CardTitle>Valor por Etapa</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 h-[300px]">
            <ChartContainer
              config={{ total: { label: 'Valor (R$)', color: 'hsl(var(--primary))' } }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `R$ ${val / 1000}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4">
              {deals.slice(0, 4).map((deal) => (
                <div key={deal.id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{deal.title}</p>
                    <p className="text-xs text-muted-foreground">Atualizado recentemente</p>
                  </div>
                </div>
              ))}
              {deals.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
