// scripts/test-supabase.js
// Run with: node scripts/test-supabase.js
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRole  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

console.log('🔍  Supabase URL  :', supabaseUrl);
console.log('🔑  Anon key     :', supabaseAnon.slice(0, 30) + '...');
console.log('🔐  Service key  :', serviceRole ? serviceRole.slice(0, 30) + '...' : '(not set)');
console.log('');

const supabase = createClient(supabaseUrl, serviceRole || supabaseAnon);

const TABLES = ['users', 'food_items', 'diet_plans', 'sickle_foods', 'sickle_meal_logs'];

async function run() {
  console.log('=== TABLE CONNECTIVITY TEST ===\n');
  let allOk = true;

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*').limit(3);

    if (error) {
      console.log(`❌  ${table.padEnd(22)} → ERROR: ${error.message}`);
      allOk = false;
    } else {
      console.log(`✅  ${table.padEnd(22)} → OK  (${data.length} row(s) returned)`);
    }
  }

  console.log('');
  console.log('=== SICKLE FOODS SEED CHECK ===\n');
  const { data: foods, error: foodErr } = await supabase
    .from('sickle_foods')
    .select('id, food_name, category, recommended_for_sickle_cell, caution');

  if (foodErr) {
    console.log('❌  Could not fetch sickle_foods:', foodErr.message);
    allOk = false;
  } else if (foods.length === 0) {
    console.log('⚠️   sickle_foods table is EMPTY — seed data has NOT been applied yet.');
    console.log('    → Paste supabase_setup_and_seed.sql into the Supabase SQL Editor and run it.');
    allOk = false;
  } else {
    console.table(foods.map(f => ({
      id:           f.id,
      food_name:    f.food_name,
      category:     f.category,
      recommended:  f.recommended_for_sickle_cell,
      caution:      f.caution,
    })));
  }

  console.log('');
  if (allOk) {
    console.log('🎉  All checks passed! Supabase is connected and working perfectly.');
  } else {
    console.log('⚠️   One or more checks failed. Review the output above.');
  }
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
