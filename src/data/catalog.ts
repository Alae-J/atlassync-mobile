export interface Product {
  id: string;
  name: string;
  tag: string;
  price: number;
  unit: string;
  emoji: string;
}

export interface SavedList {
  id: string;
  name: string;
  count: number;
  lastUsed: string;
  items: string[];
  created?: string;
  estimate?: number;
}

export const products: Product[] = [
  { id: 'banana', name: 'Bananas', tag: 'Produce', price: 0.59, unit: 'lb', emoji: '🍌' },
  { id: 'milk', name: 'Whole milk', tag: 'Dairy', price: 4.29, unit: 'gal', emoji: '🥛' },
  { id: 'bread', name: 'Sourdough loaf', tag: 'Bakery', price: 5.5, unit: 'ea', emoji: '🍞' },
  { id: 'eggs', name: 'Eggs, dozen', tag: 'Dairy', price: 6.99, unit: 'dz', emoji: '🥚' },
  { id: 'avocado', name: 'Avocado', tag: 'Produce', price: 1.25, unit: 'ea', emoji: '🥑' },
  { id: 'chicken', name: 'Chicken breast', tag: 'Meat', price: 8.99, unit: 'lb', emoji: '🍗' },
  { id: 'pasta', name: 'Penne pasta', tag: 'Pantry', price: 2.49, unit: 'box', emoji: '🍝' },
  { id: 'tomato', name: 'Roma tomatoes', tag: 'Produce', price: 1.99, unit: 'lb', emoji: '🍅' },
  { id: 'cheese', name: 'Aged cheddar', tag: 'Dairy', price: 7.5, unit: 'block', emoji: '🧀' },
  { id: 'olive-oil', name: 'Olive oil', tag: 'Pantry', price: 12.99, unit: 'bottle', emoji: '🫒' },
  { id: 'onion', name: 'Yellow onions', tag: 'Produce', price: 1.49, unit: 'lb', emoji: '🧅' },
  { id: 'salmon', name: 'Atlantic salmon', tag: 'Seafood', price: 14.99, unit: 'lb', emoji: '🐟' },
  { id: 'yogurt', name: 'Greek yogurt', tag: 'Dairy', price: 5.99, unit: 'tub', emoji: '🥣' },
  { id: 'apple', name: 'Honeycrisp apples', tag: 'Produce', price: 2.49, unit: 'lb', emoji: '🍎' },
  { id: 'coffee', name: 'Whole-bean coffee', tag: 'Pantry', price: 13.5, unit: 'bag', emoji: '☕' },
];

export const savedLists: SavedList[] = [
  {
    id: 'weekly',
    name: 'Weekly groceries',
    count: 12,
    lastUsed: '3 days ago',
    items: ['banana', 'milk', 'bread', 'eggs', 'avocado', 'chicken', 'pasta', 'tomato', 'cheese', 'olive-oil', 'onion', 'yogurt'],
    created: 'May 12, 2024',
    estimate: 64.5,
  },
  {
    id: 'pasta-night',
    name: 'Pasta night',
    count: 6,
    lastUsed: '2 weeks ago',
    items: ['pasta', 'tomato', 'cheese', 'olive-oil', 'onion', 'bread'],
    created: 'Apr 28, 2024',
    estimate: 31.2,
  },
  {
    id: 'breakfast',
    name: 'Breakfast staples',
    count: 5,
    lastUsed: 'last month',
    items: ['milk', 'bread', 'eggs', 'yogurt', 'coffee'],
    created: 'Mar 04, 2024',
    estimate: 28.75,
  },
  {
    id: 'guests',
    name: 'Guests this Friday',
    count: 9,
    lastUsed: 'never used',
    items: ['chicken', 'olive-oil', 'tomato', 'onion', 'bread', 'cheese', 'salmon', 'apple', 'coffee'],
    created: 'Yesterday',
    estimate: 52.3,
  },
];

export const productTags = ['Produce', 'Dairy', 'Bakery', 'Meat', 'Seafood', 'Pantry'] as const;

export const productById = (id: string): Product | undefined => products.find((p) => p.id === id);
