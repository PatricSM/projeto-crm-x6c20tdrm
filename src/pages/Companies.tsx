import { useEffect, useState } from 'react'
import { getCompanies, createCompany } from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Building2, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { RecordModel } from 'pocketbase'

export default function Companies() {
  const [companies, setCompanies] = useState<RecordModel[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', website: '', industry: 'Outros' })

  const loadData = async () => {
    try {
      setCompanies(await getCompanies())
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('companies', loadData)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCompany(formData)
      toast.success('Empresa adicionada!')
      setOpen(false)
      setFormData({ name: '', website: '', industry: 'Outros' })
    } catch (err) {
      toast.error('Erro ao adicionar empresa')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">Organizações com as quais você faz negócios.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Nova Empresa</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Empresa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  type="url"
                  placeholder="https://"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
              <div>
                <Label>Indústria</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                >
                  {['Software', 'Varejo', 'Serviços', 'Indústria', 'Outros'].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {companies.map((company) => (
          <Card key={company.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base">{company.name}</CardTitle>
                <span className="text-xs text-muted-foreground">{company.industry}</span>
              </div>
            </CardHeader>
            <CardContent>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <Globe className="w-3 h-3" /> Website
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {companies.length === 0 && (
        <p className="text-muted-foreground text-center py-8">Nenhuma empresa encontrada.</p>
      )}
    </div>
  )
}
