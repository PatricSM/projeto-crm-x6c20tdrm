import pb from '@/lib/pocketbase/client'

export interface OrganizationRecord {
  id: string
  name: string
  website?: string
  logo?: string
  no_of_employees?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+'
  revenue?: number
  revenue_in_base?: number
  industry?: string
  territory?: string
  currency?: string
  address?: string
  created: string
  updated: string
  expand?: {
    industry?: { name: string }
    territory?: { name: string }
    currency?: { code: string; symbol: string }
  }
}

export const getOrganizations = () =>
  pb.collection('organizations').getFullList<OrganizationRecord>({
    sort: 'name',
    expand: 'industry,territory,currency',
  })

export const getOrganization = (id: string) =>
  pb.collection('organizations').getOne<OrganizationRecord>(id, {
    expand: 'industry,territory,currency',
  })

export const createOrganization = (data: Partial<OrganizationRecord> | FormData) =>
  pb.collection('organizations').create<OrganizationRecord>(data)

export const updateOrganization = (id: string, data: Partial<OrganizationRecord> | FormData) =>
  pb.collection('organizations').update<OrganizationRecord>(id, data)

export const deleteOrganization = (id: string) => pb.collection('organizations').delete(id)
