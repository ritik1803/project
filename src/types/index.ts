export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  subcategory: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'out_for_delivery' | 'delivered';
  paymentMethod: string;
  createdAt: Date;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}