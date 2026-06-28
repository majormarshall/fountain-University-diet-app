// scripts/seed-demo-users.js
// Seeds the 3 demo accounts needed to log into the app
// Run with: node scripts/seed-demo-users.js

require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// ──────────────────────────────────────────────────────
// Demo accounts to seed
// ──────────────────────────────────────────────────────
const DEMO_USERS = [
  {
    username:  'FUO/20/0205',
    name:      'Demo Student',
    role:      'student',
    email:     'student@fuo.edu.ng',
    password:  'fuo/20/0205',
    meta:      { level: '200 Level' }
  },
  {
    username:  'profsmogunbode',
    name:      'Prof. S.M. Ogunbode',
    role:      'nutritionist',
    email:     'ogunbode@fuo.edu.ng',
    password:  'ogunbode12',
    meta:      {}
  },
  {
    username:  'kalibest10',
    name:      'Kali Admin',
    role:      'admin',
    email:     'admin@fuo.edu.ng',
    password:  'airborne',
    meta:      {}
  }
];

async function seed() {
  console.log('🌱  Seeding demo users into Supabase...\n');

  for (const u of DEMO_USERS) {
    // Hash the password with bcrypt (10 rounds — same as backend)
    const password_hash = await bcrypt.hash(u.password, 10);

    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          username:      u.username,
          name:          u.name,
          role:          u.role,
          email:         u.email,
          password_hash,
          meta:          u.meta
        },
        { onConflict: 'username' }   // update if username already exists
      )
      .select('id, username, role');

    if (error) {
      console.log(`❌  [${u.role.padEnd(13)}]  ${u.username.padEnd(20)}  → ERROR: ${error.message}`);
    } else {
      console.log(`✅  [${u.role.padEnd(13)}]  ${u.username.padEnd(20)}  → OK  (id: ${data[0]?.id})`);
    }
  }

  console.log('\n══════════════════════════════════════════════');
  console.log('  LOGIN CREDENTIALS SUMMARY');
  console.log('══════════════════════════════════════════════');
  console.log('  Role          Username             Password');
  console.log('──────────────────────────────────────────────');
  for (const u of DEMO_USERS) {
    console.log(`  ${u.role.padEnd(14)}${u.username.padEnd(21)}${u.password}`);
  }
  console.log('══════════════════════════════════════════════');
  console.log('\n🎉  Done! Open http://localhost:3000 and log in.\n');
}

seed().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
