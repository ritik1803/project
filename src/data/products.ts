import { Product } from '../types';

export const products: Product[] = [
  // Grocery - Snacks
  {
    id: '1',
    name: 'Lays Classic',
    price: 20,
    description: 'Classic salted potato chips',
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b',
    category: 'grocery',
    subcategory: 'snacks',
  },
  {
    id: '2',
    name: 'Mixed Nuts',
    price: 299,
    description: 'Premium mixed nuts (500g)',
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32',
    category: 'grocery',
    subcategory: 'snacks',
  },
  {
    id: '3',
    name: 'Dark Chocolate',
    price: 150,
    description: '72% cocoa dark chocolate',
    image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9',
    category: 'grocery',
    subcategory: 'snacks',
  },

  // Grocery - Fruits & Vegetables
  {
    id: '4',
    name: 'Fresh Apples',
    price: 80,
    description: 'Fresh red apples (1kg)',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
    category: 'grocery',
    subcategory: 'fruits_vegetables',
  },
  {
    id: '5',
    name: 'Organic Bananas',
    price: 60,
    description: 'Organic bananas (1kg)',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
    category: 'grocery',
    subcategory: 'fruits_vegetables',
  },
  {
    id: '6',
    name: 'Fresh Tomatoes',
    price: 40,
    description: 'Farm fresh tomatoes (500g)',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337',
    category: 'grocery',
    subcategory: 'fruits_vegetables',
  },

  // Grocery - Dairy
  {
    id: '7',
    name: 'Fresh Milk',
    price: 60,
    description: 'Fresh dairy milk (1L)',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150',
    category: 'grocery',
    subcategory: 'dairy',
  },
  {
    id: '8',
    name: 'Butter',
    price: 50,
    description: 'Fresh dairy butter (100g)',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d',
    category: 'grocery',
    subcategory: 'dairy',
  },
  {
    id: '9',
    name: 'Cheese Slices',
    price: 120,
    description: 'Processed cheese slices (200g)',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d',
    category: 'grocery',
    subcategory: 'dairy',
  },

  // Food - Quick Bites
  {
    id: '10',
    name: 'Samosa',
    price: 15,
    description: 'Hot and crispy vegetable samosa',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
    category: 'food',
    subcategory: 'quick_bites',
  },
  {
    id: '11',
    name: 'Veg Spring Rolls',
    price: 120,
    description: 'Crispy vegetable spring rolls (6pcs)',
    image: 'https://images.unsplash.com/photo-1606575631652-0ee0c1c94b92',
    category: 'food',
    subcategory: 'quick_bites',
  },
  {
    id: '12',
    name: 'French Fries',
    price: 99,
    description: 'Crispy golden french fries',
    image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d',
    category: 'food',
    subcategory: 'quick_bites',
  },

  // Food - Main Course
  {
    id: '13',
    name: 'Butter Chicken',
    price: 280,
    description: 'Creamy butter chicken curry',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398',
    category: 'food',
    subcategory: 'main_course',
  },
  {
    id: '14',
    name: 'Paneer Tikka',
    price: 220,
    description: 'Grilled cottage cheese with spices',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8',
    category: 'food',
    subcategory: 'main_course',
  },
  {
    id: '15',
    name: 'Biryani',
    price: 250,
    description: 'Aromatic rice with spices and vegetables',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
    category: 'food',
    subcategory: 'main_course',
  },

  // Food - Desserts
  {
    id: '16',
    name: 'Gulab Jamun',
    price: 150,
    description: 'Sweet milk dumplings in sugar syrup',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
    category: 'food',
    subcategory: 'desserts',
  },
  {
    id: '17',
    name: 'Ice Cream',
    price: 80,
    description: 'Vanilla ice cream with chocolate sauce',
    image: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780',
    category: 'food',
    subcategory: 'desserts',
  },
  {
    id: '18',
    name: 'Chocolate Brownie',
    price: 120,
    description: 'Rich chocolate brownie with nuts',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
    category: 'food',
    subcategory: 'desserts',
  },
];

export const getProductsBySubcategory = (category: string, subcategory: string) => {
  return products.filter(
    (product) => product.category === category && product.subcategory === subcategory
  );
};

export const getFeaturedProducts = () => {
  return products.slice(0, 6);
};

export const getPopularProducts = () => {
  return products.slice(6, 12);
};