import Papa from 'papaparse'
import pb from '@/lib/pocketbase/client'

export type ImportEntity = 'leads' | 'contacts' | 'organizations'

export interface FieldDef {
  key: string
  label: string
  required?: boolean
  type?: 'text' | 'email' | 'number'
}

export const FIELD_SCHEMAS: Record<ImportEntity, FieldDef[]> = {
  leads: [
    { key: 'first_name', label: 'Primeiro nome', required: true },
    { key: 'last_name', label: 'Sobrenome' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'mobile', label: 'Celular' },
    { key: 'phone', label: 'Telefone' },
    { key: 'job_title', label: 'Cargo' },
    { key: 'organization_name', label: 'Empresa (texto)' },
    { key: 'revenue', label: 'Receita estimada', type: 'number' },
  ],
  contacts: [
    { key: 'full_name', label: 'Nome completo', required: true },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'mobile', label: 'Celular' },
    { key: 'phone', label: 'Telefone' },
    { key: 'job_title', label: 'Cargo' },
  ],
  organizations: [
    { key: 'name', label: 'Nome', required: true },
    { key: 'website', label: 'Website' },
    { key: 'address', label: 'Endereço' },
    { key: 'revenue', label: 'Receita anual', type: 'number' },
  ],
}

export interface ParsedCsv {
  headers: string[]
  rows: Record<string, string>[]
}

export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        resolve({
          headers: res.meta.fields || [],
          rows: res.data,
        })
      },
      error: (err) => reject(err),
    })
  })
}

/** Auto-detecta mapeamento por correspondência de nomes de header (case insensitive). */
export function autoMap(headers: string[], schema: FieldDef[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  for (const field of schema) {
    const match =
      headers.find((h) => h.toLowerCase().trim() === field.key.toLowerCase()) ||
      headers.find((h) => h.toLowerCase().includes(field.key.toLowerCase().replace('_', ''))) ||
      headers.find((h) => h.toLowerCase().includes(field.label.toLowerCase()))
    if (match) mapping[field.key] = match
  }
  return mapping
}

export interface ImportResult {
  success: number
  failed: { row: number; error: string }[]
}

export async function importRows(
  entity: ImportEntity,
  rows: Record<string, string>[],
  mapping: Record<string, string>,
  schema: FieldDef[],
  onProgress?: (done: number, total: number) => void,
): Promise<ImportResult> {
  const result: ImportResult = { success: 0, failed: [] }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const data: Record<string, any> = {}
    for (const field of schema) {
      const csvCol = mapping[field.key]
      if (!csvCol) continue
      const v = row[csvCol]
      if (v == null || v === '') continue
      if (field.type === 'number') {
        const n = Number(v)
        if (!isNaN(n)) data[field.key] = n
      } else {
        data[field.key] = v
      }
    }
    // Required check
    const missing = schema.filter((f) => f.required && !data[f.key])
    if (missing.length > 0) {
      result.failed.push({
        row: i + 2,
        error: `campos obrigatórios faltando: ${missing.map((f) => f.label).join(', ')}`,
      })
      onProgress?.(i + 1, rows.length)
      continue
    }
    try {
      await pb.collection(entity).create(data)
      result.success++
    } catch (err: any) {
      result.failed.push({ row: i + 2, error: err.message || String(err) })
    }
    onProgress?.(i + 1, rows.length)
  }
  return result
}
