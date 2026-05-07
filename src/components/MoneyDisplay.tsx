import type { Currency } from '@/services/currencies'

interface Props {
  value?: number | null
  currency?: Currency | { code: string; symbol: string }
  fallback?: string
  className?: string
}

export function MoneyDisplay({ value, currency, fallback = '—', className }: Props) {
  if (value == null || isNaN(value)) return <span className={className}>{fallback}</span>
  const symbol = currency?.symbol ?? 'R$'
  const formatted = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value)
  return (
    <span className={className}>
      {symbol} {formatted}
    </span>
  )
}
