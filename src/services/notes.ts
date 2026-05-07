import pb from '@/lib/pocketbase/client'

export interface NoteRecord {
  id: string
  title?: string
  content: string
  reference_type: 'lead' | 'deal' | 'contact' | 'organization'
  reference_id: string
  author: string
  created: string
  updated: string
  expand?: { author?: { name: string; email: string } }
}

export const getNotesFor = (refType: NoteRecord['reference_type'], refId: string) =>
  pb.collection('notes').getFullList<NoteRecord>({
    sort: '-created',
    filter: `reference_type = "${refType}" && reference_id = "${refId}"`,
    expand: 'author',
  })

export const createNote = (data: Partial<NoteRecord>) =>
  pb.collection('notes').create<NoteRecord>({
    ...data,
    author: pb.authStore.record?.id,
  })

export const updateNote = (id: string, data: Partial<NoteRecord>) =>
  pb.collection('notes').update<NoteRecord>(id, data)

export const deleteNote = (id: string) => pb.collection('notes').delete(id)
