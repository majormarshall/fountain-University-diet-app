const https = require('https');

const SUPABASE_HOST = 'yhjbwbmmrmnizswpakoa.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloamJ3Ym1tcm1uaXpzd3Bha29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQyMjQ2MywiZXhwIjoyMDk1OTk4NDYzfQ.0K2si4c4k9UFPiKOl-IH5tcuC1_AQoz2F6zieo5XWT4';

const sql = `
CREATE TABLE IF NOT EXISTS sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  username TEXT NOT NULL,
  name TEXT,
  alert_type TEXT NOT NULL,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  acknowledged_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sos_status ON sos_alerts(status);
CREATE INDEX IF NOT EXISTS idx_sos_created ON sos_alerts(created_at DESC);
`;

const body = JSON.stringify({ query: sql });

const options = {
  hostname: SUPABASE_HOST,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY,
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    if (res.statusCode === 200 || res.statusCode === 204) {
      console.log('✅ sos_alerts table created successfully!');
    } else {
      console.log('Response:', data);
      console.log('\n⚠️  Could not auto-create table. Please run this SQL manually in your Supabase SQL Editor at:');
      console.log('https://supabase.com/dashboard/project/yhjbwbmmrmnizswpakoa/sql\n');
      console.log('--- PASTE THIS SQL ---');
      console.log(sql);
      console.log('----------------------');
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
  process.exit(1);
});

req.write(body);
req.end();
