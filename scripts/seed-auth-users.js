// scripts/seed-auth-users.js
// Registers demo users into Supabase AUTH (auth.users table)
// so they appear as real authenticated users in the Supabase Dashboard
// Run with: node scripts/seed-auth-users.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Must use service_role key to access auth.admin API
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ─────────────────────────────────────────────────────────────
// Real user accounts to register in Supabase Auth
// ─────────────────────────────────────────────────────────────
const REAL_USERS = [
  {
    email:    'student@fuo.edu.ng',
    password: 'fuo/20/0205',
    username: 'FUO/20/0205',
    name:     'Demo Student',
    role:     'student',
    meta:     { username: 'FUO/20/0205', role: 'student', level: '200 Level' }
  },
  {
    email:    'ogunbode@fuo.edu.ng',
    password: 'ogunbode12',
    username: 'profsmogunbode',
    name:     'Prof. S.M. Ogunbode',
    role:     'nutritionist',
    meta:     { username: 'profsmogunbode', role: 'nutritionist' }
  },
  {
    email:    'admin@fuo.edu.ng',
    password: 'airborne',
    username: 'kalibest10',
    name:     'Kali Admin',
    role:     'admin',
    meta:     { username: 'kalibest10', role: 'admin' }
  }
];

async function registerAuthUsers() {
  console.log('🔐  Registering demo users into Supabase Auth...\n');

  const results = { success: [], failed: [] };

  for (const u of REAL_USERS) {
    console.log(`  ⏳  Creating auth account for: ${u.email}`);

    const { data, error } = await supabase.auth.admin.createUser({
      email:              u.email,
      password:           u.password,
      email_confirm:      true,           // auto-confirm email so they can log in right away
      user_metadata: {
        name:     u.name,
        username: u.username,
        role:     u.role,
        ...u.meta
      }
    });

    if (error) {
      if (error.message.includes('already been registered') || error.message.includes('already exists')) {
        console.log(`  ⚠️   [${u.role.padEnd(13)}] ${u.email.padEnd(28)} → Already exists (skipped)`);
        results.success.push(u);
      } else {
        console.log(`  ❌  [${u.role.padEnd(13)}] ${u.email.padEnd(28)} → ERROR: ${error.message}`);
        results.failed.push({ ...u, error: error.message });
      }
    } else {
      console.log(`  ✅  [${u.role.padEnd(13)}] ${u.email.padEnd(28)} → Registered (auth id: ${data.user.id})`);
      results.success.push(u);

      // Also sync the auth user id into our custom users table as supabase_auth_id
      // (optional: helps link auth.users ↔ public.users if needed later)
      await supabase
        .from('users')
        .update({ meta: { ...u.meta, supabase_auth_id: data.user.id } })
        .eq('username', u.username);
    }
  }

  // ── Final Summary ──────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  SUPABASE AUTH REGISTRATION SUMMARY');
  console.log('══════════════════════════════════════════════════════');
  console.log('  Role           Email                        Password');
  console.log('──────────────────────────────────────────────────────');
  for (const u of REAL_USERS) {
    const status = results.failed.find(f => f.email === u.email) ? '❌' : '✅';
    console.log(`  ${status} ${u.role.padEnd(13)} ${u.email.padEnd(28)} ${u.password}`);
  }
  console.log('══════════════════════════════════════════════════════');

  if (results.failed.length === 0) {
    console.log('\n🎉  All users registered! Check Supabase Dashboard →');
    console.log('    Authentication → Users');
    console.log(`    ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/auth/users\n`);
  } else {
    console.log(`\n⚠️   ${results.failed.length} user(s) failed. See errors above.\n`);
  }
}

registerAuthUsers().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
