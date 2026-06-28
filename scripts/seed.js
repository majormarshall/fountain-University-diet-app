// scripts/seed.js
// Run with: node scripts/seed.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually (Next.js doesn't load it for plain Node scripts)
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) {
    process.env[key.trim()] = val.join('=').trim();
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log('🌱  Starting seed...\n');

  // --- 1. Seed sickle_foods ---
  const foodsPath = path.join(__dirname, '..', 'sickle_foods_seed.json');
  const foods = JSON.parse(fs.readFileSync(foodsPath, 'utf-8'));

  console.log(`📋  Seeding ${foods.length} sickle foods...`);

  for (const food of foods) {
    const { data, error } = await supabase
      .from('sickle_foods')
      .upsert(food, { onConflict: 'id' });

    if (error) {
      console.error(`  ❌  Failed to upsert "${food.food_name}":`, error.message);
    } else {
      console.log(`  ✅  Upserted: ${food.food_name}`);
    }
  }

  // --- 2. Verify ---
  console.log('\n🔍  Verifying sickle_foods table...');
  const { data: allFoods, error: verifyError } = await supabase
    .from('sickle_foods')
    .select('id, food_name, recommended_for_sickle_cell, caution');

  if (verifyError) {
    console.error('❌  Verification failed:', verifyError.message);
    console.error('\n👉  This usually means the table does not exist yet.');
    console.error('    Please run supabase_schema.sql in your Supabase SQL Editor first:');
    console.error('    https://supabase.com/dashboard/project/ckzzaqzkmozozgmejbpz/sql/new\n');
  } else {
    console.log(`\n🎉  Done! ${allFoods.length} record(s) in sickle_foods:\n`);
    allFoods.forEach(f => {
      const rec = f.recommended_for_sickle_cell ? '✅ Recommended' : '⚠️  Caution';
      console.log(`  ${rec}  —  ${f.food_name} (id: ${f.id})`);
    });
  }

  console.log('\n✨  Seed complete!');
}

seed().catch(err => {
  console.error('💥  Unexpected error:', err);
  process.exit(1);
});
