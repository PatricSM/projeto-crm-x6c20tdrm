import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMyWidgets, type DashboardWidget } from '@/services/dashboardWidgets'

/**
 * Versão estática do dashboard (Fase C) — só carrega e renderiza widgets
 * existentes. A versão configurável (drag/drop, edit) virá na Fase F.
 */
export default function Dashboard() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getMyWidgets()
      .then((list) => {
        if (mounted) setWidgets(list)
      })
      .catch((err) => console.error('load widgets:', err))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div className="text-muted-foreground">Carregando…</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Seus widgets configurados.</p>
        </div>
        <Button variant="outline" disabled>
          <Pencil className="h-4 w-4 mr-1" /> Editar (em breve)
        </Button>
      </div>

      {widgets.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground mb-3">Nenhum widget configurado.</p>
          <Link to="/settings">
            <Button variant="outline">Configurar dashboard</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets.map((w) => (
            <Card
              key={w.id}
              className={
                w.size === 'lg'
                  ? 'sm:col-span-2 lg:col-span-3 p-6'
                  : w.size === 'md'
                    ? 'sm:col-span-2 p-6'
                    : 'p-6'
              }
            >
              <h3 className="font-semibold mb-2">{w.title}</h3>
              <div className="text-sm text-muted-foreground">
                Tipo: <code className="bg-slate-100 px-1 rounded">{w.type}</code>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Renderização interativa será adicionada na próxima fase.
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
