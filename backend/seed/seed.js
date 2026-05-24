const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { supabase } = require('../utils/supabase');

async function seed() {
  console.log('Starting Supabase database seeding via client SDK...');

  try {
    // 1. Clean up existing tables to ensure a clean slate
    console.log('Clearing existing data...');
    
    // Clear sickle cell logs and diet plans first due to foreign keys
    await supabase.from('sickle_meal_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('diet_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Clear primary tables
    await supabase.from('sickle_foods').delete().neq('id', '___non_existent_id___');
    await supabase.from('food_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Hash passwords
    console.log('Hashing passwords...');
    const saltRounds = 10;
    const studentPw = await bcrypt.hash('student123', saltRounds);
    const nutritionistPw = await bcrypt.hash('ogunbode12', saltRounds);
    const adminPw = await bcrypt.hash('Ayomide12', saltRounds);
    const doctorPw = await bcrypt.hash('FUOdoctor12', saltRounds);

    // 3. Seed users table
    console.log('Seeding users...');
    const users = [
      { username: 'FUO/20/0205', name: 'Sample Student', role: 'student', email: 'student@fuo.edu.ng', password_hash: studentPw },
      { username: 'profsmogunbode', name: 'Prof SM Ogunbode', role: 'nutritionist', email: 'ogunbode@fuo.edu.ng', password_hash: nutritionistPw },
      { username: 'bello', name: 'Bello Abdulwadud Ayomide', role: 'admin', email: 'bello@fuo.edu.ng', password_hash: adminPw },
      { username: 'fuodoctor', name: 'School Doctor', role: 'doctor', email: 'doctor@fuo.edu.ng', password_hash: doctorPw }
    ];
    
    const { data: seededUsers, error: userError } = await supabase
      .from('users')
      .insert(users)
      .select();
      
    if (userError) {
      throw new Error(`Failed to seed users: ${userError.message}`);
    }
    console.log(`Seeded ${seededUsers.length} users successfully.`);

    // 4. Seed standard food_items
    console.log('Seeding food items...');
    const foods = [
      { name: 'Eba (Garri)', category: 'Carb', calories: 360, protein_g: 1.5, carbs_g: 90, fat_g: 0.5, notes: 'Cassava-based staple' },
      { name: 'Pounded Yam', category: 'Carb', calories: 130, protein_g: 1.6, carbs_g: 31, fat_g: 0.2 },
      { name: 'Jollof Rice', category: 'Mixed', calories: 200, protein_g: 4, carbs_g: 40, fat_g: 3 },
      { name: 'Moi Moi', category: 'Protein', calories: 150, protein_g: 10, carbs_g: 10, fat_g: 6 },
      { name: 'Fried Plantain (Dodo)', category: 'Carb', calories: 220, protein_g: 1, carbs_g: 58, fat_g: 0.5 },
      { name: 'Bean Porridge', category: 'Protein', calories: 160, protein_g: 12, carbs_g: 20, fat_g: 4 },
      { name: 'Egusi Soup (with Vegetables)', category: 'Fat/Protein', calories: 250, protein_g: 15, carbs_g: 8, fat_g: 18 },
      { name: 'Boiled Yam', category: 'Carb', calories: 116, protein_g: 1.5, carbs_g: 27.9, fat_g: 0.2 }
    ];
    
    const { data: seededFoods, error: foodError } = await supabase
      .from('food_items')
      .insert(foods)
      .select();
      
    if (foodError) {
      throw new Error(`Failed to seed standard foods: ${foodError.message}`);
    }
    console.log(`Seeded ${seededFoods.length} standard food items successfully.`);

    // 5. Seed sickle_foods table (loaded from sickle_foods_seed.json)
    console.log('Loading sickle cell foods seed file...');
    const seedFilePath = path.join(__dirname, '../../sickle_foods_seed.json');
    if (fs.existsSync(seedFilePath)) {
      const rawData = fs.readFileSync(seedFilePath, 'utf8');
      const sickleFoodsJSON = JSON.parse(rawData);
      
      const sickleFoods = sickleFoodsJSON.map(item => ({
        id: item.id,
        food_name: item.food_name,
        category: item.category,
        short_desc: item.short_desc,
        recommended_for_sickle_cell: !!item.recommended_for_sickle_cell,
        caution: !!item.caution,
        nutrients: item.nutrients || {},
        molecular_benefits: item.molecular_benefits || []
      }));
      
      console.log('Seeding sickle cell foods into Supabase...');
      const { data: seededSickleFoods, error: sickleError } = await supabase
        .from('sickle_foods')
        .insert(sickleFoods)
        .select();
        
      if (sickleError) {
        throw new Error(`Failed to seed sickle foods: ${sickleError.message}`);
      }
      console.log(`Seeded ${seededSickleFoods.length} sickle cell foods successfully.`);
    } else {
      console.log('Warning: sickle_foods_seed.json not found in root. Skipping sickle cell foods seed.');
    }

    console.log('\n--- Seeding Complete! ---');
    process.exit(0);
  } catch (err) {
    console.error('\nSeeding failed with error:', err.message || err);
    process.exit(1);
  }
}

seed();
