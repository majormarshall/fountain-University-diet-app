import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Use service role key for server-side writes to meal logs (recommended)
const supabaseService = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '')

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { user_id, food_id, serving_size, calories } = req.body
  const { data, error } = await supabaseService.from('sickle_meal_logs').insert([{ user_id, food_id, serving_size, calories }]).select().single()
  if (error) return res.status(500).json({ error: error.message })
  return res.status(201).json(data)
}
