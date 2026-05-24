import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing. Check .env.local');
}

// Resilience: If database URL (postgresql://) was placed in NEXT_PUBLIC_SUPABASE_URL,
// parse the project reference to resolve the correct HTTPS REST API URL!
if (supabaseUrl.startsWith('postgresql://')) {
  const match = supabaseUrl.match(/@db\.(.+?)\.supabase\.co/);
  if (match && match[1]) {
    supabaseUrl = `https://${match[1]}.supabase.co`;
  } else {
    throw new Error('Supabase URL is set to a postgres connection string but could not extract project reference.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
