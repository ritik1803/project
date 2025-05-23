import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
export const getProducts = async (category?: string) => {
  let query = supabase.from('products').select('*');
  
  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getOrders = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createOrder = async (
  items: Array<{ product_id: string; quantity: number; price: number }>,
  total: number,
  paymentMethod: string,
  address: string,
  deliveryLocation: { lat: number; lng: number }
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      total,
      payment_method: paymentMethod,
      address,
      delivery_location: deliveryLocation,
      status: 'pending'
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(items.map(item => ({
      order_id: order.id,
      ...item
    })));

  if (itemsError) throw itemsError;

  return order;
};

export const getWishlist = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', user.id);

  if (error) throw error;
  return data;
};

export const toggleWishlist = async (productId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('wishlists')
    .select()
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', existing.id);
    
    if (error) throw error;
    return false;
  } else {
    const { error } = await supabase
      .from('wishlists')
      .insert({ user_id: user.id, product_id: productId });
    
    if (error) throw error;
    return true;
  }
};