const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabase');

router.get('/', async (req, res) => {
  try {
    const { data: foods, error } = await supabase
      .from('food_items')
      .select('*');
      
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

module.exports = router;
