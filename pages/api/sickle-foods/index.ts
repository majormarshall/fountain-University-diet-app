import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const q = (req.query.q as string) || ''
    try {
      let query = supabase.from('sickle_foods').select('*')
      if (q) query = query.ilike('food_name', `%${q}%`)
      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    } catch (e:any) {
      return res.status(500).json({ error: e.message })
    }
  } else if (req.method === 'POST') {
    // Only allow server-side service role for direct inserts in production.
    // For demo, allow insert through anon key (not recommended).
    const body = req.body
    const { data, error } = await supabase.from('sickle_foods').insert([body]).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  } else {
    res.setHeader('Allow', ['GET','POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
