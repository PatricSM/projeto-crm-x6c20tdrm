import pb from '@/lib/pocketbase/client'

export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  exchange_rate: number
  is_default?: boolean
}

export const getCurrencies = () =>
  pb.collection('currencies').getFullList<Currency>({ sort: '-is_default,code' })
export const getDefaultCurrency = async () => {
  const all = await getCurrencies()
  return all.find((c) => c.is_default) ?? all[0]
}
export const createCurrency = (data: Partial<Currency>) =>
  pb.collection('currencies').create<Currency>(data)
export const updateCurrency = (id: string, data: Partial<Currency>) =>
  pb.collection('currencies').update<Currency>(id, data)
export const deleteCurrency = (id: string) => pb.collection('currencies').delete(id)
