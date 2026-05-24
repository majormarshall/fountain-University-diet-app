const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { supabase } = require('../utils/supabase');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Unauthorized' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

// 1. Get all standard foods
router.get('/', async (req, res) => {
  try {
    const { data: foods, error } = await supabase
      .from('food_items')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Fetch foods database error', error);
      return res.status(500).json({ message: 'Failed to retrieve food items' });
    }
    
    res.json(foods);
  } catch (err) {
    console.error('Fetch foods server error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 2. Create standard food (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  const { name, category, calories, protein_g, carbs_g, fat_g, notes } = req.body;
  
  try {
    const { data: food, error } = await supabase
      .from('food_items')
      .insert([{ 
        name, 
        category, 
        calories: Number(calories || 0), 
        protein_g: Number(protein_g || 0), 
        carbs_g: Number(carbs_g || 0), 
        fat_g: Number(fat_g || 0), 
        notes 
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Insert food database error', error);
      return res.status(400).json({ message: error.message || 'Failed to create food item.' });
    }
    
    res.json(food);
  } catch (err) {
    console.error('Insert food server error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 3. Update standard food (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  const { name, category, calories, protein_g, carbs_g, fat_g, notes } = req.body;
  
  try {
    const { data: food, error } = await supabase
      .from('food_items')
      .update({ 
        name, 
        category, 
        calories: Number(calories || 0), 
        protein_g: Number(protein_g || 0), 
        carbs_g: Number(carbs_g || 0), 
        fat_g: Number(fat_g || 0), 
        notes 
      })
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (error) {
      console.error('Update food database error', error);
      return res.status(400).json({ message: error.message || 'Failed to update food item.' });
    }
    
    res.json(food);
  } catch (err) {
    console.error('Update food server error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 4. Delete standard food (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase
      .from('food_items')
      .delete()
      .eq('id', req.params.id);
      
    if (error) {
      console.error('Delete food database error', error);
      return res.status(400).json({ message: error.message || 'Failed to delete food item.' });
    }
    
    res.json({ message: 'Food item successfully deleted.' });
  } catch (err) {
    console.error('Delete food server error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
