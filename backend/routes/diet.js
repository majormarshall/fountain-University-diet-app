const express = require('express');
const router = require('express').Router();
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

// Helper to populate food items inside the meals JSONB structure
async function populateMeals(plans) {
  if (!plans || plans.length === 0) return plans;

  // 1. Gather all unique food IDs
  const foodIds = new Set();
  plans.forEach(plan => {
    if (Array.isArray(plan.meals)) {
      plan.meals.forEach(meal => {
        if (Array.isArray(meal.items)) {
          meal.items.forEach(item => {
            if (item.food) foodIds.add(item.food);
          });
        }
      });
    }
  });

  if (foodIds.size === 0) return plans;

  // 2. Fetch the food items from Supabase
  try {
    const { data: foods, error } = await supabase
      .from('food_items')
      .select('*')
      .in('id', Array.from(foodIds));
      
    if (error || !foods) {
      console.error('Failed to populate food items', error);
      return plans;
    }
    
    const foodMap = {};
    foods.forEach(f => {
      foodMap[f.id] = f;
    });

    // 3. Map populated food objects back into meals
    return plans.map(plan => {
      const newMeals = plan.meals.map(meal => {
        const newItems = meal.items.map(item => {
          return {
            ...item,
            food: foodMap[item.food] || item.food
          };
        });
        return { ...meal, items: newItems };
      });
      return { ...plan, meals: newMeals };
    });
  } catch (err) {
    console.error('Failed to populate food items', err);
    return plans;
  }
}

router.get('/:studentUsername', auth, async (req, res) => {
  const { studentUsername } = req.params;
  
  try {
    // 1. Find the student
    const { data: students, error: studentError } = await supabase
      .from('users')
      .select('*')
      .ilike('username', studentUsername);
      
    if (studentError) {
      console.error('Student database lookup error', studentError);
      return res.status(500).json({ message: 'Database error' });
    }
    
    const student = students && students[0];
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Authorization check
    if (req.user.role === 'student' && String(req.user.id) !== String(student.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    // 2. Fetch diet plans joining creator info
    const { data: plans, error: plansError } = await supabase
      .from('diet_plans')
      .select('*, created_by:users(id, name, username)')
      .eq('student_id', student.id);
      
    if (plansError) {
      console.error('Fetch diet plans error', plansError);
      return res.status(500).json({ message: 'Failed to retrieve diet plans' });
    }
    
    // 3. Populate food items inside the meals JSONB structure
    const populated = await populateMeals(plans);
    
    // 4. Format keys to camelCase for full backwards-compatibility with frontend
    const formatted = populated.map(plan => ({
      id: plan.id,
      _id: plan.id,
      studentId: plan.student_id,
      createdBy: plan.created_by,
      date: plan.date,
      meals: plan.meals,
      notes: plan.notes,
      forSickleCell: plan.for_sickle_cell
    }));
    
    res.json(formatted);
  } catch (err) {
    console.error('Fetch student plans error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:studentUsername', auth, async (req, res) => {
  if (req.user.role !== 'nutritionist' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  
  const { studentUsername } = req.params;
  
  try {
    const { data: students, error: studentError } = await supabase
      .from('users')
      .select('*')
      .ilike('username', studentUsername);
      
    if (studentError) {
      return res.status(500).json({ message: 'Database query error' });
    }
    
    const student = students && students[0];
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Insert new plan
    const { data: plan, error } = await supabase
      .from('diet_plans')
      .insert([{
        student_id: student.id,
        created_by: req.user.id,
        meals: req.body.meals,
        notes: req.body.notes,
        for_sickle_cell: !!req.body.forSickleCell
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Insert diet plan error', error);
      return res.status(500).json({ message: 'Failed to create diet plan' });
    }
    
    // Format return object
    const formattedPlan = {
      id: plan.id,
      _id: plan.id,
      studentId: plan.student_id,
      createdBy: plan.created_by,
      date: plan.date,
      meals: plan.meals,
      notes: plan.notes,
      forSickleCell: plan.for_sickle_cell
    };
    
    res.json(formattedPlan);
  } catch (err) {
    console.error('Create diet plan error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
