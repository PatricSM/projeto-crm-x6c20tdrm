import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  autoMap,
  FIELD_SCHEMAS,
  importRows,
  parseCsvFile,
  type ImportEntity,
  type ImportResult,
  type ParsedCsv,
} from '@/services/csvImport'

type Step = 'choose' | 'upload' | 'mapping' | 'submitting' | 'done'

export default function ImportCsv() {
  const { toast } = useToast()
  const [step, setStep] = useState<Step>('choose')
  const [entity, setEntity] = useState<ImportEntity>('leads')
  const [parsed, setParsed] = useState<ParsedCsv>()
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ImportResult>()

  const schema = FIELD_SCHEMAS[entity]

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const p = await parseCsvFile(file)
      setParsed(p)
      setMapping(autoMap(p.headers, schema))
      setStep('mapping')
    } catch (err: any) {
      toast({ title: 'Erro ao ler CSV', description: err.message, variant: 'destructive' })
    }
  }

  const handleImport = async () => {
    if (!parsed) return
    setStep('submitting')
    setProgress(0)
    const r = await importRows(entity, parsed.rows, mapping, schema, (done, total) => {
      setProgress(Math.round((done / total) * 100))
    })
    setResult(r)
    setStep('done')
    toast({ title: `Import concluído: ${r.success} sucesso, ${r.failed.length} falhas` })
  }

  const reset = () => {
    setStep('choose')
    setParsed(undefined)
    setMapping({})
    setProgress(0)
    setResult(undefined)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Importar CSV</h1>
        <p className="text-muted-foreground">
          Carregue arquivos CSV para criar leads, contatos ou empresas em massa.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <StepBubble active={step === 'choose'} done={step !== 'choose'} label="1. Tipo" />
        <span>→</span>
        <StepBubble
          active={step === 'upload'}
          done={['mapping', 'submitting', 'done'].includes(step)}
          label="2. Upload"
        />
        <span>→</span>
        <StepBubble
          active={step === 'mapping'}
          done={['submitting', 'done'].includes(step)}
          label="3. Mapeamento"
        />
        <span>→</span>
        <StepBubble active={step === 'done'} done={step === 'done'} label="4. Resultado" />
      </div>

      {step === 'choose' && (
        <Card className="p-6 space-y-4">
          <div>
            <Label>O que você quer importar?</Label>
            <Select value={entity} onValueChange={(v: ImportEntity) => setEntity(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="contacts">Contatos</SelectItem>
                <SelectItem value="organizations">Empresas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Campos esperados:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {schema.map((f) => (
                <div key={f.key}>
                  <code className="bg-slate-100 px-1 rounded">{f.key}</code>{' '}
                  <span className="text-muted-foreground">— {f.label}</span>
                  {f.required && <span className="text-rose-600">*</span>}
                </div>
              ))}
            </div>
          </div>
          <Button onClick={() => setStep('upload')}>Continuar</Button>
        </Card>
      )}

      {step === 'upload' && (
        <Card className="p-6 space-y-4">
          <div>
            <Label>Selecionar arquivo CSV</Label>
            <Input type="file" accept=".csv,text/csv" onChange={handleFile} />
            <p className="text-xs text-muted-foreground mt-1">
              Primeira linha deve conter os cabeçalhos das colunas.
            </p>
          </div>
          <Button variant="outline" onClick={() => setStep('choose')}>
            Voltar
          </Button>
        </Card>
      )}

      {step === 'mapping' && parsed && (
        <Card className="p-6 space-y-4">
          <div>
            <p className="text-sm">
              Detectamos <strong>{parsed.rows.length}</strong> linhas e{' '}
              <strong>{parsed.headers.length}</strong> colunas.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Mapeamento</Label>
            <div className="space-y-2">
              {schema.map((f) => (
                <div key={f.key} className="grid grid-cols-2 gap-3 items-center">
                  <div className="text-sm">
                    {f.label}
                    {f.required && <span className="text-rose-600">*</span>}
                  </div>
                  <Select
                    value={mapping[f.key] || ''}
                    onValueChange={(v) =>
                      setMapping((m) => ({ ...m, [f.key]: v === '__none__' ? '' : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Não mapear" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Não mapear —</SelectItem>
                      {parsed.headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="block mb-2">Pré-visualização (5 primeiras)</Label>
            <div className="border rounded text-xs overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {parsed.headers.map((h) => (
                      <th key={h} className="px-2 py-1 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t">
                      {parsed.headers.map((h) => (
                        <td key={h} className="px-2 py-1">
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('upload')}>
              Voltar
            </Button>
            <Button onClick={handleImport}>
              <Upload className="h-4 w-4 mr-1" /> Importar {parsed.rows.length} linhas
            </Button>
          </div>
        </Card>
      )}

      {step === 'submitting' && (
        <Card className="p-10 text-center space-y-3">
          <p>Importando…</p>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-muted-foreground">{progress}%</p>
        </Card>
      )}

      {step === 'done' && result && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <div>
              <h3 className="font-semibold">Importação concluída</h3>
              <p className="text-sm text-muted-foreground">
                {result.success} criados · {result.failed.length} falhas
              </p>
            </div>
          </div>
          {result.failed.length > 0 && (
            <div className="border border-rose-200 bg-rose-50 rounded p-3 space-y-1 max-h-60 overflow-auto">
              <div className="text-sm font-medium text-rose-700 mb-1 inline-flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Linhas com erro
              </div>
              {result.failed.map((f, i) => (
                <div key={i} className="text-xs text-rose-700">
                  Linha {f.row}: {f.error}
                </div>
              ))}
            </div>
          )}
          <Button onClick={reset}>Nova importação</Button>
        </Card>
      )}
    </div>
  )
}

function StepBubble({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <span
      className={
        active ? 'text-primary font-medium' : done ? 'text-emerald-600' : 'text-muted-foreground'
      }
    >
      {label}
    </span>
  )
}
