import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Order, Product } from '../types';
import { useAuthStore } from './useAuthStore';

interface Store {
  cart: CartItem[];
  orders: Order[];
  wishlist: Product[];
  searchQuery: string;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (paymentMethod: string) => void;
  toggleWishlist: (product: Product) => void;
  setSearchQuery: (query: string) => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      orders: [],
      wishlist: [],
      searchQuery: '',

      addToCart: (product) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart:
            quantity === 0
              ? state.cart.filter((item) => item.id !== productId)
              : state.cart.map((item) =>
                  item.id === productId ? { ...item, quantity } : item
                ),
        })),

      clearCart: () => set({ cart: [] }),

      placeOrder: (paymentMethod) =>
        set((state) => {
          const user = useAuthStore.getState().user;
          if (!user) return state;

          const newOrder: Order = {
            id: Math.random().toString(36).substr(2, 9),
            items: [...state.cart],
            total: state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
            status: 'pending',
            paymentMethod,
            createdAt: new Date(),
            userId: user.id,
          };

          return {
            orders: [...state.orders, newOrder],
            cart: [],
          };
        }),

      toggleWishlist: (product) =>
        set((state) => {
          const exists = state.wishlist.some((item) => item.id === product.id);
          return {
            wishlist: exists
              ? state.wishlist.filter((item) => item.id !== product.id)
              : [...state.wishlist, product],
          };
        }),

      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'ecommerce-store',
    }
  )
);
