import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { AuthState, User } from '../types';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      signup: async (email, password, name) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
          });
          if (error) {
            console.error('Signup error:', error);
            return false;
          }
          if (data.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({ id: data.user.id, name, email });
            if (profileError) {
              console.error('Profile upsert error:', profileError);
              return false;
            }
            set({
              user: { id: data.user.id, email, name },
              isAuthenticated: true,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Signup error:', error);
          return false;
        }
      },

      login: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) {
            console.error('Login error:', error);
            return false;
          }
          if (data.user) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('name, address, phone, delivery_location')
              .eq('id', data.user.id)
              .single();
            if (profileError) {
              console.error('Profile fetch error:', profileError);
            }
            const userData: User = {
              id: data.user.id,
              email: data.user.email || email,
              name: profile?.name || data.user.user_metadata?.name || '',
              address: profile?.address || '',
              phone: profile?.phone || '',
              deliveryLocation: profile?.delivery_location || null,
            };
            set({ user: userData, isAuthenticated: true });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Logout error:', error);
            throw error;
          }
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
          throw error;
        }
      },

      updateProfile: async (data) => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error || !user) {
            console.error('Update profile: No authenticated user');
            return;
          }
          const updates = {
            name: data.name,
            address: data.address,
            phone: data.phone,
            delivery_location: data.deliveryLocation,
          };
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ id: user.id, ...updates });
          if (profileError) {
            console.error('Profile update error:', profileError);
            throw profileError;
          }
          set((state) => ({
            user: state.user ? { ...state.user, ...data } : null,
          }));
        } catch (error) {
          console.error('Update profile error:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('useAuthStore - Auth state:', event, 'Session:', session);
  if (session?.user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('name, address, phone, delivery_location')
      .eq('id', session.user.id)
      .single();
    if (error) {
      console.error('Profile fetch error:', error);
    }
    const userData: User = {
      id: session.user.id,
      email: session.user.email || '',
      name: profile?.name || session.user.user_metadata?.name || '',
      address: profile?.address || '',
      phone: profile?.phone || '',
      deliveryLocation: profile?.delivery_location || null,
    };
    useAuthStore.getState().set({ user: userData, isAuthenticated: true });
  } else {
    useAuthStore.getState().set({ user: null, isAuthenticated: false });
  }
});

const initializeAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log('useAuthStore - Initial session:', session, 'Error:', error);
  if (session?.user) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, address, phone, delivery_location')
      .eq('id', session.user.id)
      .single();
    if (profileError) {
      console.error('Initial profile fetch error:', profileError);
    }
    const userData: User = {
      id: session.user.id,
      email: session.user.email || '',
      name: profile?.name || session.user.user_metadata?.name || '',
      address: profile?.address || '',
      phone: profile?.phone || '',
      deliveryLocation: profile?.delivery_location || null,
    };
    useAuthStore.getState().set({ user: userData, isAuthenticated: true });
  } else {
    useAuthStore.getState().set({ user: null, isAuthenticated: false });
  }
};
initializeAuth();