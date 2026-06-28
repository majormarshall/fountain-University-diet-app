export type SCDRating = 'Excellent' | 'Recommended' | 'Moderate' | 'Limit' | 'Avoid' | null;

export interface NigerianFood {
  name: string;
  category: 'Swallows & Grains' | 'Soups & Stews' | 'Fruits' | 'Snacks & Others';
  ingredients: string;
  notes: string;
  scdRating?: SCDRating;
  scdNote?: string;
}

export const NIGERIAN_FOODS: NigerianFood[] = [
  // ── SWALLOWS & GRAINS ────────────────────────────────────────
  { category: 'Swallows & Grains', name: 'Garri / Eba',           ingredients: 'Cassava',                  notes: 'Most widely eaten swallow; served with almost all soups' },
  { category: 'Swallows & Grains', name: 'Pounded Yam / Iyan',    ingredients: 'Yam',                      notes: 'Rich in complex carbs; common at meals and celebrations',       scdRating: 'Recommended', scdNote: 'Sustained energy for the body' },
  { category: 'Swallows & Grains', name: 'Amala',                  ingredients: 'Yam flour (dried)',        notes: 'Dark swallow, very popular in Yoruba households' },
  { category: 'Swallows & Grains', name: 'Semo (Semolina)',        ingredients: 'Wheat semolina',           notes: 'Light-coloured swallow; widely available' },
  { category: 'Swallows & Grains', name: 'Jollof Rice',            ingredients: 'Rice, tomato, spices',    notes: "Nigeria's most popular everyday grain dish" },
  { category: 'Swallows & Grains', name: 'Fried Rice',             ingredients: 'Rice, vegetables, protein', notes: 'Common at parties and family meals' },
  { category: 'Swallows & Grains', name: 'Tuwo Shinkafa',          ingredients: 'Rice',                    notes: 'Northern staple; glutinous rice swallow' },
  { category: 'Swallows & Grains', name: 'Fufu / Akpu',            ingredients: 'Fermented cassava',       notes: 'Draw swallow served with soups' },
  { category: 'Swallows & Grains', name: 'Beans / Ewa',            ingredients: 'Black-eyed or brown beans', notes: 'High-protein staple; eaten as porridge or ewa aganyin',     scdRating: 'Excellent', scdNote: 'Helps with anaemia; affordable and accessible — rich in iron & protein' },
  { category: 'Swallows & Grains', name: 'Moi Moi',                ingredients: 'Steamed bean pudding',   notes: 'High protein; served at meals and celebrations',               scdRating: 'Recommended', scdNote: 'Steamed beans; high protein and iron' },
  { category: 'Swallows & Grains', name: 'Akara',                  ingredients: 'Bean cake (fried)',       notes: 'Common breakfast with pap or bread' },
  { category: 'Swallows & Grains', name: 'Dodo',                   ingredients: 'Ripe fried plantain',     notes: 'Sweet accompaniment; sold everywhere' },
  { category: 'Swallows & Grains', name: 'Boli',                   ingredients: 'Roasted unripe plantain', notes: 'Popular street food, especially in the south' },
  { category: 'Swallows & Grains', name: 'Indomie Noodles',        ingredients: 'Instant noodles',         notes: 'Very popular quick meal, especially among youth' },
  { category: 'Swallows & Grains', name: 'Pap / Akamu',            ingredients: 'Fermented corn porridge', notes: 'Common breakfast for all ages' },
  { category: 'Swallows & Grains', name: 'Yam Pottage / Asaro',   ingredients: 'Yam, palm oil, pepper',   notes: 'Home-made favourite, especially in the south' },
  { category: 'Swallows & Grains', name: 'Boiled Yam + Egg',       ingredients: 'Yam, egg',                notes: 'Classic, affordable Nigerian breakfast',                       scdRating: 'Recommended', scdNote: 'Complete protein and carbs; easy on digestion' },
  { category: 'Swallows & Grains', name: 'Fried Yam / Dundun',     ingredients: 'Yam (deep-fried)',        notes: 'Street food with pepper sauce' },
  { category: 'Swallows & Grains', name: 'Okpa',                   ingredients: 'Bambara nut flour (steamed)', notes: 'Common breakfast in southeast Nigeria' },
  { category: 'Swallows & Grains', name: 'Adalu',                  ingredients: 'Beans and sweet corn',   notes: 'Yoruba bean and corn pottage' },
  { category: 'Swallows & Grains', name: 'Abacha (African Salad)', ingredients: 'Sun-dried cassava',       notes: 'Popular Igbo snack with ugba and palm oil' },
  { category: 'Swallows & Grains', name: 'Suya',                   ingredients: 'Grilled spiced beef/chicken', notes: 'Most famous Nigerian street food' },
  { category: 'Swallows & Grains', name: 'Chin Chin',              ingredients: 'Flour, sugar, egg (fried)', notes: 'Crunchy snack at parties and markets',                      scdRating: 'Avoid', scdNote: 'High fat fried snack; occasional only' },
  { category: 'Swallows & Grains', name: 'Puff Puff',              ingredients: 'Flour, sugar, yeast (fried)', notes: 'Sweet dough balls; beloved street snack',                 scdRating: 'Avoid', scdNote: 'High fat; eat only occasionally' },

  // ── SOUPS & STEWS ────────────────────────────────────────────
  { category: 'Soups & Stews', name: 'Egusi Soup',       ingredients: 'Ground melon seeds, leafy veg, meat', notes: 'Most popular Nigerian soup; served with any swallow' },
  { category: 'Soups & Stews', name: 'Ogbono Soup',      ingredients: 'Ogbono seeds, palm oil, meat',        notes: 'Draw soup; great with fufu or eba' },
  { category: 'Soups & Stews', name: 'Efo Riro',         ingredients: 'Pumpkin leaves (ugu), assorted meat', notes: 'Yoruba vegetable soup; very nutritious',                    scdRating: 'Excellent', scdNote: 'Ugu is rich in folate and iron — excellent for red blood cell production' },
  { category: 'Soups & Stews', name: 'Okra Soup',        ingredients: 'Okra, fish, crayfish',               notes: 'Slimy, nutritious; pairs with eba or amala',               scdRating: 'Recommended', scdNote: 'Rich in folate, Vitamin C and minerals; easy to digest' },
  { category: 'Soups & Stews', name: 'Banga Soup',       ingredients: 'Palm fruit, fish, spices',           notes: 'Delta/South-South specialty' },
  { category: 'Soups & Stews', name: 'Afang Soup',       ingredients: 'Wild spinach, waterleaf, seafood',   notes: 'Efik/Ibibio delicacy; loaded with vegetables',             scdRating: 'Excellent', scdNote: 'High in folate and iron from leafy greens and seafood' },
  { category: 'Soups & Stews', name: 'Pepper Soup',      ingredients: 'Meat/fish, local herbs, spices',     notes: 'Light broth; eaten alone or as appetiser',                 scdRating: 'Recommended', scdNote: 'High water content helps hydration; anti-inflammatory spices' },
  { category: 'Soups & Stews', name: 'Vegetable Soup',   ingredients: 'Bitter leaf/spinach, palm oil',      notes: 'Nutritious everyday soup across Nigeria',                  scdRating: 'Recommended', scdNote: 'Anti-inflammatory phytochemicals in bitter leaf' },
  { category: 'Soups & Stews', name: 'Groundnut Soup',   ingredients: 'Peanuts, meat, tomatoes',            notes: 'Popular in the north and east' },
  { category: 'Soups & Stews', name: 'Oha Soup',         ingredients: 'Oha leaves, cocoyam thickener',      notes: 'Igbo delicacy; rich and earthy' },
  { category: 'Soups & Stews', name: 'Gbegiri',          ingredients: 'Bean soup',                         notes: 'Part of Yoruba abula trio (with ewedu & stew)' },
  { category: 'Soups & Stews', name: 'Ewedu Soup',       ingredients: 'Jute leaf (draw), potash',          notes: 'Classic Yoruba soup, served with amala' },
  { category: 'Soups & Stews', name: 'Edikaikong',       ingredients: 'Waterleaf, ugbu, seafood',          notes: 'Cross River/Akwa Ibom powerhouse soup',                    scdRating: 'Excellent', scdNote: 'Loaded with iron, folate and omega-3 from seafood' },
  { category: 'Soups & Stews', name: 'Corn Soup / Omi Ukpoka', ingredients: 'Dry ground corn, smoked fish', notes: 'Common in Afemai/Edo communities' },
  { category: 'Soups & Stews', name: 'Very Fatty Soups (heavy palm oil)', ingredients: 'Palm oil (excess)',  notes: 'Excess palm oil can worsen inflammation',                 scdRating: 'Limit', scdNote: 'Limit — excess palm oil can worsen inflammation in SCD' },

  // ── FRUITS ───────────────────────────────────────────────────
  { category: 'Fruits', name: 'Watermelon',          ingredients: 'Water (92%), Vitamin C',    notes: 'Most popular; excellent hydration',              scdRating: 'Excellent',     scdNote: 'Critical for hydration; 92% water — prevents crises' },
  { category: 'Fruits', name: 'Mango',                ingredients: 'Vitamins A, C',             notes: 'Seasonal favourite; several varieties' },
  { category: 'Fruits', name: 'Pawpaw (Papaya)',      ingredients: 'Vitamin C, enzymes',        notes: 'Rich in vitamin C and digestive enzymes',        scdRating: 'Recommended',   scdNote: 'Aids iron absorption from plant foods' },
  { category: 'Fruits', name: 'Banana',               ingredients: 'Potassium, carbs',          notes: 'Affordable everyday snack across Nigeria' },
  { category: 'Fruits', name: 'Pineapple',            ingredients: 'Vitamin C, Bromelain',      notes: 'Anti-inflammatory; eaten fresh or juiced',       scdRating: 'Recommended',   scdNote: 'Anti-inflammatory; boosts immune system' },
  { category: 'Fruits', name: 'Orange / Tangerine',   ingredients: 'Vitamin C',                 notes: 'High in vitamin C; widely sold' },
  { category: 'Fruits', name: 'Guava',                ingredients: 'Vitamin C (high)',          notes: 'One of the highest vitamin C fruits locally',    scdRating: 'Recommended',   scdNote: 'High antioxidant; widely available in markets' },
  { category: 'Fruits', name: 'Avocado (Pear)',       ingredients: 'Healthy fats, Vitamin E',   notes: 'Seasonal; high in healthy fats' },
  { category: 'Fruits', name: 'Agbalumo / Udara',     ingredients: 'Vitamin C, antioxidants',   notes: 'African star apple; beloved Nigerian seasonal fruit' },
  { category: 'Fruits', name: 'Ube (African Pear)',   ingredients: 'Healthy fats, Vitamins',    notes: 'Eaten with corn; popular in southeast Nigeria' },
  { category: 'Fruits', name: 'Soursop (Shawashawa)', ingredients: 'Antioxidants',              notes: 'Antioxidant-rich; made into drinks' },
  { category: 'Fruits', name: 'Coconut',              ingredients: 'Healthy fats, water',       notes: 'Eaten fresh; water is hydrating' },
  { category: 'Fruits', name: 'Iyeye (Hog Plum)',     ingredients: 'Vitamin C (wild)',          notes: 'Tart wild fruit; vitamin-rich' },
  { category: 'Fruits', name: 'Garden Egg',           ingredients: 'Phytochemicals',            notes: 'Small eggplant eaten raw or in stew' },

  // ── SPECIAL SCD-ONLY ITEMS ───────────────────────────────────
  { category: 'Snacks & Others', name: 'Ugu (Pumpkin Leaves)', ingredients: 'Folate, Iron, Antioxidants', notes: 'Used in efo riro; exceptional for blood health', scdRating: 'Excellent', scdNote: 'Essential for red blood cell production — folate-dense' },
  { category: 'Snacks & Others', name: 'Spinach / Efo',        ingredients: 'Folate, Iron',              notes: 'Used in efo riro and vegetable soups',          scdRating: 'Excellent', scdNote: 'Helps with anaemia; iron and folate-rich' },
  { category: 'Snacks & Others', name: 'Liver (Beef/Chicken)', ingredients: 'Iron, Vitamin A & B12',     notes: 'Very high iron; eat in moderate portions',      scdRating: 'Excellent', scdNote: 'Very high iron — eat moderately' },
  { category: 'Snacks & Others', name: 'Fish (Mackerel/Sardine/Catfish)', ingredients: 'Omega-3 fatty acids', notes: 'Helps reduce painful crises',              scdRating: 'Excellent', scdNote: 'Omega-3 helps reduce painful sickling crises' },
  { category: 'Snacks & Others', name: 'Moringa (Ewe Ile)',    ingredients: 'Iron, Vitamins A, C & E',   notes: 'Exceptionally nutrient-dense; add to soups/drinks', scdRating: 'Excellent', scdNote: 'One of the most nutrient-dense foods for SCD' },
  { category: 'Snacks & Others', name: 'Eggs',                 ingredients: 'Protein, Iron (yolk)',      notes: 'Complete protein source',                       scdRating: 'Recommended', scdNote: 'Complete protein source with iron in yolk' },
  { category: 'Snacks & Others', name: 'Zobo (unsweetened)',   ingredients: 'Antioxidants, Vitamin C',   notes: 'Hibiscus drink; anti-inflammatory',              scdRating: 'Recommended', scdNote: 'Anti-inflammatory antioxidants; hydrating' },
  { category: 'Snacks & Others', name: 'Heavily Salted Foods', ingredients: '—',                        notes: 'High salt worsens dehydration',                  scdRating: 'Limit', scdNote: 'Limit — worsens dehydration, a major crisis trigger' },
  { category: 'Snacks & Others', name: 'Sugary Drinks',        ingredients: '—',                        notes: 'Replace with water, zobo, or fresh juice',       scdRating: 'Avoid', scdNote: 'Avoid — replace with water, zobo or fresh fruit juice' },
];

export const CATEGORIES = ['All', 'Swallows & Grains', 'Soups & Stews', 'Fruits', 'Snacks & Others'] as const;

export const SCD_RATING_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Excellent:    { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  Recommended:  { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  Moderate:     { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  Limit:        { bg: '#fff7ed', text: '#9a3412', border: '#fed7aa' },
  Avoid:        { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
};
