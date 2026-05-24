import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method === 'PATCH') {
    const changes = req.body
    const { data, error } = await supabase.from('sickle_foods').update(changes).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }
  res.setHeader('Allow', ['PATCH'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
