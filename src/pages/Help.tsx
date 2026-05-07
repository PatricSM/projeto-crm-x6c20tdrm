import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  UserPlus,
  CircleDollarSign,
  Timer,
  Upload,
  LayoutDashboard,
  Coins,
} from 'lucide-react'

interface Topic {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  group: string
  content: React.ReactNode
}

const TOPICS: Topic[] = [
  {
    key: 'intro',
    label: 'Introdução',
    icon: Sparkles,
    group: 'Começando',
    content: (
      <article className="prose prose-slate prose-sm max-w-none">
        <h2>Skip CRM</h2>
        <p>Sistema de gestão comercial migrado do Frappe CRM. Os papéis são:</p>
        <ul>
          <li>
            <strong>Admin</strong>: configura lookups, SLA, moedas e gerencia usuários.
          </li>
          <li>
            <strong>Agent</strong>: vendedor — cria/edita seus leads, deals, tarefas.
          </li>
          <li>
            <strong>Viewer</strong>: leitura.
          </li>
        </ul>
        <p>O fluxo principal é: capturar Lead → converter em Deal → fechar (Won/Lost).</p>
      </article>
    ),
  },
  {
    key: 'leads',
    label: 'Leads',
    icon: UserPlus,
    group: 'Funcionalidades',
    content: (
      <article className="prose prose-slate prose-sm max-w-none">
        <h2>Leads</h2>
        <p>Um lead é um potencial cliente que ainda não foi qualificado. Ao criar:</p>
        <ul>
          <li>Nome, email e empresa (texto) são suficientes para começar.</li>
          <li>
            O sistema aplica automaticamente uma SLA Medium e marca <code>response_due</code>.
          </li>
          <li>
            O owner recebe uma notificação <em>lead_assigned</em>.
          </li>
        </ul>
        <p>
          Quando você adiciona a primeira nota como agente/admin, o lead é marcado como{' '}
          <em>respondido</em> (SLA = Fulfilled). Para converter em deal, clique no botão{' '}
          <strong>Converter em Deal</strong> no detalhe do lead.
        </p>
      </article>
    ),
  },
  {
    key: 'deals',
    label: 'Deals',
    icon: CircleDollarSign,
    group: 'Funcionalidades',
    content: (
      <article className="prose prose-slate prose-sm max-w-none">
        <h2>Deals</h2>
        <p>
          Um deal é uma negociação com probabilidade de fechar. Move-se através do funil
          (Qualificação → Demo → Proposta → Negociação → Won/Lost).
        </p>
        <p>
          A visualização <strong>Kanban</strong> permite mudar status arrastando o card (na versão
          atual via dropdown). Quando o status atinge <em>Won</em> ou <em>Lost</em>, o campo{' '}
          <code>close_date</code> é marcado automaticamente.
        </p>
      </article>
    ),
  },
  {
    key: 'sla',
    label: 'SLA',
    icon: Timer,
    group: 'Operação',
    content: (
      <article className="prose prose-slate prose-sm max-w-none">
        <h2>SLA</h2>
        <p>
          Cada lead/deal recebe uma política SLA (Low/Medium/High/Urgent) com tempos de resposta e
          resolução em minutos. O cálculo respeita:
        </p>
        <ul>
          <li>
            <strong>Business hours</strong> — só conta minutos dentro do expediente.
          </li>
          <li>
            <strong>Holidays</strong> — feriados nacionais BR já vêm seedados.
          </li>
        </ul>
        <p>
          Um cron a cada 15 minutos verifica breach. Quando o tempo acaba sem first response (lead)
          ou sem resolved_on (deal), o status vira <em>Failed</em> e o owner é notificado.
        </p>
      </article>
    ),
  },
  {
    key: 'currencies',
    label: 'Multi-currency',
    icon: Coins,
    group: 'Operação',
    content: (
      <article className="prose prose-slate prose-sm max-w-none">
        <h2>Moedas</h2>
        <p>
          Cada Lead, Deal e Organization tem uma <code>currency</code> opcional (default BRL). O
          sistema mantém <code>revenue</code> (na moeda escolhida) e calcula{' '}
          <code>revenue_in_base</code> automaticamente via <code>exchange_rate</code>.
        </p>
        <p>
          Adicione/edite moedas em <strong>Configurações → Moedas</strong>. Para uso de relatórios
          em moeda única, agregue por <code>revenue_in_base</code>.
        </p>
      </article>
    ),
  },
  {
    key: 'import',
    label: 'Import CSV',
    icon: Upload,
    group: 'Operação',
    content: (
      <article className="prose prose-slate prose-sm max-w-none">
        <h2>Importação CSV</h2>
        <p>
          Em <strong>/import</strong> você pode importar Leads, Contatos e Empresas em massa.
        </p>
        <ol>
          <li>Escolha o tipo de entidade.</li>
          <li>Selecione o arquivo (primeira linha = cabeçalhos).</li>
          <li>Confira o auto-mapeamento (ajuste se necessário).</li>
          <li>Confirme — o sistema cria em batch e mostra falhas.</li>
        </ol>
        <p>
          Campos obrigatórios precisam estar mapeados. Linhas com erro são listadas no fim com a
          mensagem do PocketBase.
        </p>
      </article>
    ),
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    group: 'Operação',
    content: (
      <article className="prose prose-slate prose-sm max-w-none">
        <h2>Dashboard configurável</h2>
        <p>
          Cada usuário tem seus próprios widgets em <strong>/dashboard</strong>. Tipos suportados:
        </p>
        <ul>
          <li>
            <code>kpi</code> — número agregado (count/sum)
          </li>
          <li>
            <code>chart-line</code>, <code>chart-bar</code> — gráficos temporais
          </li>
          <li>
            <code>funnel</code> — funil de deals por status
          </li>
          <li>
            <code>table-top</code> — top X de uma coleção
          </li>
          <li>
            <code>recent-activity</code> — últimas mudanças
          </li>
        </ul>
        <p>
          A edição interativa (drag & drop, adicionar/remover) está em desenvolvimento — veja a
          próxima fase.
        </p>
      </article>
    ),
  },
]

export default function Help() {
  const [activeKey, setActiveKey] = useState(TOPICS[0].key)
  const grouped = TOPICS.reduce<Record<string, Topic[]>>((acc, t) => {
    acc[t.group] = acc[t.group] || []
    acc[t.group].push(t)
    return acc
  }, {})
  const Active = TOPICS.find((t) => t.key === activeKey)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Ajuda</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <aside>
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-4">
              <h3 className="px-2 mb-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                {group}
              </h3>
              <nav className="space-y-0.5">
                {items.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveKey(t.key)}
                    className={cn(
                      'flex h-8 w-full items-center gap-2 rounded-md px-2 text-left transition-colors',
                      activeKey === t.key
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    <t.icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm truncate">{t.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </aside>
        <Card className="p-6">{Active?.content}</Card>
      </div>
    </div>
  )
}
