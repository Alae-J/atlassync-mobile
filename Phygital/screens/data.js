// Shared mock data for Phygital screens

window.PHY_DATA = {
  // Common product catalog — used by list editor, in-store view, search, product detail.
  // Optional fields (brand, aisle, nutriscore, inStock, dietary, allergens, nutrition,
  // ingredients, about) are surfaced by Search + Product Detail.
  products: [
    {
      id: 'banana', name: 'Bananas', tag: 'Produce', price: 0.59, unit: 'lb', emoji: '🍌',
      brand: 'Fairtrade Co-op', aisle: 1, nutriscore: 'A', inStock: true,
      dietary: ['Halal', 'Vegan', 'Gluten-free'], allergens: [],
      nutrition: { kcal: 89, sugars: 12.2, fats: 0.3, salt: 0.0 },
      ingredients: 'Fresh bananas.',
    },
    {
      id: 'milk', name: 'Whole milk', tag: 'Dairy', price: 4.29, unit: 'gal', emoji: '🥛',
      brand: 'Juhayna', aisle: 5, nutriscore: 'B', inStock: true,
      dietary: ['Halal', 'Vegetarian'], allergens: ['Milk'],
      nutrition: { kcal: 61, sugars: 4.8, fats: 3.3, salt: 0.1 },
      ingredients: 'Pasteurised whole cow’s milk. Vitamin D added.',
    },
    {
      id: 'bread', name: 'Sourdough loaf', tag: 'Bakery', price: 5.50, unit: 'ea', emoji: '🍞',
      brand: 'Anbar Bakery', aisle: 8, nutriscore: 'B', inStock: true,
      dietary: ['Halal', 'Vegan'], allergens: ['Gluten', 'Wheat'],
      nutrition: { kcal: 247, sugars: 1.4, fats: 1.0, salt: 1.2 },
      ingredients: 'Wheat flour, water, sea salt, sourdough starter (wheat flour, water).',
      about: 'Baked on-site each morning. Picked up warm — best within 48h.',
    },
    {
      id: 'eggs', name: 'Eggs, dozen', tag: 'Dairy', price: 6.99, unit: 'dz', emoji: '🥚',
      brand: 'Daltex Free-Range', aisle: 5, nutriscore: 'A', inStock: true,
      dietary: ['Halal', 'Vegetarian'], allergens: ['Eggs'],
      nutrition: { kcal: 155, sugars: 1.1, fats: 11.0, salt: 0.4 },
      ingredients: 'Free-range chicken eggs.',
    },
    {
      id: 'avocado', name: 'Avocado', tag: 'Produce', price: 1.25, unit: 'ea', emoji: '🥑',
      brand: 'Marina Farms', aisle: 1, nutriscore: 'A', inStock: true,
      dietary: ['Halal', 'Vegan', 'Gluten-free'], allergens: [],
      nutrition: { kcal: 160, sugars: 0.7, fats: 14.7, salt: 0.0 },
      ingredients: 'Fresh hass avocado.',
    },
    {
      id: 'chicken', name: 'Chicken breast', tag: 'Meat', price: 8.99, unit: 'lb', emoji: '🍗',
      brand: 'Halayeb Halal', aisle: 12, nutriscore: 'B', inStock: true,
      dietary: ['Halal', 'Gluten-free', 'Low sugar'], allergens: [],
      nutrition: { kcal: 165, sugars: 0.0, fats: 3.6, salt: 0.2 },
      ingredients: 'Halal-certified chicken breast, boneless and skinless. May contain up to 4% added water.',
      about: 'Cold-chain item — RFID tagged. Pick up at the meat counter on your way out.',
    },
    {
      id: 'pasta', name: 'Penne pasta', tag: 'Pantry', price: 2.49, unit: 'box', emoji: '🍝',
      brand: 'Regina', aisle: 9, nutriscore: 'C', inStock: true,
      dietary: ['Halal', 'Vegetarian', 'Vegan'], allergens: ['Gluten', 'Wheat'],
      nutrition: { kcal: 371, sugars: 3.2, fats: 1.5, salt: 0.0 },
      ingredients: 'Durum wheat semolina, water.',
    },
    {
      id: 'tomato', name: 'Roma tomatoes', tag: 'Produce', price: 1.99, unit: 'lb', emoji: '🍅', brand: 'Local · Wadi El Natrun', aisle: 1, nutriscore: 'A', inStock: true,
      dietary: ['Halal', 'Vegan', 'Gluten-free'], allergens: [],
      nutrition: { kcal: 18, sugars: 2.6, fats: 0.2, salt: 0.0 },
      ingredients: 'Fresh roma tomatoes.',
    },
    {
      id: 'cheese', name: 'Aged cheddar', tag: 'Dairy', price: 7.50, unit: 'block', emoji: '🧀',
      brand: 'Domty Reserve', aisle: 5, nutriscore: 'D', inStock: false,
      dietary: ['Halal', 'Vegetarian'], allergens: ['Milk'],
      nutrition: { kcal: 402, sugars: 0.1, fats: 33.1, salt: 1.8 },
      ingredients: 'Pasteurised cow’s milk, salt, microbial rennet, cheese cultures. Aged 24 months.',
    },
    {
      id: 'olive-oil', name: 'Olive oil', tag: 'Pantry', price: 12.99, unit: 'bottle', emoji: '🫒',
      brand: 'Crete Gold', aisle: 9, nutriscore: 'C', inStock: true,
      dietary: ['Halal', 'Vegan', 'Gluten-free'], allergens: [],
      nutrition: { kcal: 884, sugars: 0.0, fats: 100, salt: 0.0 },
      ingredients: 'Extra virgin olive oil, cold-pressed. First harvest, single estate.',
    },
    {
      id: 'onion', name: 'Yellow onions', tag: 'Produce', price: 1.49, unit: 'lb', emoji: '🧅',
      brand: 'Local · Beheira', aisle: 1, nutriscore: 'A', inStock: true,
      dietary: ['Halal', 'Vegan', 'Gluten-free'], allergens: [],
      nutrition: { kcal: 40, sugars: 4.2, fats: 0.1, salt: 0.0 },
      ingredients: 'Fresh yellow onions.',
    },
    {
      id: 'salmon', name: 'Atlantic salmon', tag: 'Seafood', price: 14.99, unit: 'lb', emoji: '🐟',
      brand: 'Norvik Fjord', aisle: 11, nutriscore: 'B', inStock: true,
      dietary: ['Halal', 'Gluten-free', 'Low sugar'], allergens: ['Fish'],
      nutrition: { kcal: 208, sugars: 0.0, fats: 13.4, salt: 0.1 },
      ingredients: 'Fresh Atlantic salmon fillet, skin-on.',
      about: 'Cold-chain item — RFID tagged. Pick up at the seafood counter on your way out.',
    },
    {
      id: 'yogurt', name: 'Greek yogurt', tag: 'Dairy', price: 5.99, unit: 'tub', emoji: '🥣',
      brand: 'Juhayna Mix', aisle: 5, nutriscore: 'A', inStock: true,
      dietary: ['Halal', 'Vegetarian'], allergens: ['Milk'],
      nutrition: { kcal: 97, sugars: 3.6, fats: 5.0, salt: 0.1 },
      ingredients: 'Strained pasteurised milk, live yogurt cultures (S. thermophilus, L. bulgaricus).',
    },
    {
      id: 'apple', name: 'Honeycrisp apples', tag: 'Produce', price: 2.49, unit: 'lb', emoji: '🍎',
      brand: 'Wenatchee Orchards', aisle: 1, nutriscore: 'A', inStock: true,
      dietary: ['Halal', 'Vegan', 'Gluten-free'], allergens: [],
      nutrition: { kcal: 52, sugars: 10.4, fats: 0.2, salt: 0.0 },
      ingredients: 'Fresh honeycrisp apples.',
    },
    {
      id: 'coffee', name: 'Whole-bean coffee', tag: 'Pantry', price: 13.50, unit: 'bag', emoji: '☕',
      brand: 'Beanbelt Roastery', aisle: 9, nutriscore: 'B', inStock: true,
      dietary: ['Halal', 'Vegan', 'Gluten-free'], allergens: [],
      nutrition: { kcal: 2, sugars: 0.0, fats: 0.0, salt: 0.0 },
      ingredients: 'Single-origin Ethiopia Yirgacheffe, medium roast.',
    },
  ],

  savedLists: [
    { id: 'weekly', name: 'Weekly groceries', count: 12, lastUsed: '3 days ago', items: ['banana','milk','bread','eggs','avocado','chicken','pasta','tomato','cheese','olive-oil','onion','yogurt'] },
    { id: 'pasta-night', name: 'Pasta night', count: 6, lastUsed: '2 weeks ago', items: ['pasta','tomato','cheese','olive-oil','onion','bread'] },
    { id: 'breakfast', name: 'Breakfast staples', count: 5, lastUsed: 'last month', items: ['milk','bread','eggs','yogurt','coffee'] },
  ],

  tags: ['Produce', 'Dairy', 'Bakery', 'Meat', 'Seafood', 'Pantry'],

  // The user's profile preferences — surfaced via Account, used here to highlight
  // matching dietary tags and warn on allergens in the Search / Product Detail screens.
  userPrefs: {
    dietary: ['Halal', 'No pork', 'Low sugar', 'No alcohol'],
    allergens: ['Shellfish', 'Milk'],
  },

  recentSearches: ['greek yogurt', 'olive oil', 'chicken', 'sourdough'],
};
