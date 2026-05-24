const { createClient } = require('@supabase/supabase-js');

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ckzzaqzkmozozgmejbpz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Resilience: If database URL (postgresql://) was placed in NEXT_PUBLIC_SUPABASE_URL,
// parse the project reference to resolve the correct HTTPS REST API URL!
if (supabaseUrl && supabaseUrl.startsWith('postgresql://')) {
  const match = supabaseUrl.match(/@db\.(.+?)\.supabase\.co/);
  if (match && match[1]) {
    supabaseUrl = `https://${match[1]}.supabase.co`;
  }
}

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Key is missing. Check backend/.env.local');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
