import pb from '@/lib/pocketbase/client'

export interface ContactRecord {
  id: string
  full_name: string
  email?: string
  phone?: string
  mobile?: string
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say'
  organization?: string
  job_title?: string
  is_primary?: boolean
  created: string
  updated: string
  expand?: { organization?: { name: string } }
}

export const getContacts = () =>
  pb.collection('contacts').getFullList<ContactRecord>({
    sort: 'full_name',
    expand: 'organization',
  })

export const getContact = (id: string) =>
  pb.collection('contacts').getOne<ContactRecord>(id, { expand: 'organization' })

export const createContact = (data: Partial<ContactRecord>) =>
  pb.collection('contacts').create<ContactRecord>(data)

export const updateContact = (id: string, data: Partial<ContactRecord>) =>
  pb.collection('contacts').update<ContactRecord>(id, data)

export const deleteContact = (id: string) => pb.collection('contacts').delete(id)
