import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  status?: string
  responseDue?: string
  firstRespondedOn?: string
  className?: string
}

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime() - Date.now()
  const abs = Math.abs(d)
  const min = Math.floor(abs / 60_000)
  const h = Math.floor(min / 60)
  const hh = h % 24
  const days = Math.floor(h / 24)
  const sign = d < 0 ? '-' : ''
  if (days > 0) return `${sign}${days}d ${hh}h`
  if (h > 0) return `${sign}${h}h`
  return `${sign}${min}m`
}

export function SlaIndicator({ status, responseDue, firstRespondedOn, className }: Props) {
  if (!status) return null
  if (status === 'Fulfilled' || firstRespondedOn) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded',
          className,
        )}
      >
        <CheckCircle2 className="h-3 w-3" />
        SLA cumprido
      </span>
    )
  }
  if (status === 'Failed') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded',
          className,
        )}
      >
        <AlertTriangle className="h-3 w-3" />
        SLA estourado
      </span>
    )
  }
  // FirstResponseDue / Paused
  const remaining = responseDue ? relativeTime(responseDue) : ''
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded',
        className,
      )}
    >
      <Clock className="h-3 w-3" />
      {remaining ? `Resposta em ${remaining}` : 'SLA pendente'}
    </span>
  )
}
