import { orderSchema } from '../utils/validation';
import { verifyToken } from './auth';

interface OrderItem {
  id: string;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'out_for_delivery' | 'delivered';
  paymentMethod: string;
  address: string;
  createdAt: Date;
}

let orders: Order[] = [];

export const createOrder = async (
  token: string,
  items: OrderItem[],
  paymentMethod: string,
  address: string
) => {
  try {
    const userId = verifyToken(token);
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const validatedData = orderSchema.parse({
      items,
      paymentMethod,
      address,
    });

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      items: validatedData.items,
      total: 0, // Calculate based on product prices
      status: 'pending',
      paymentMethod: validatedData.paymentMethod,
      address: validatedData.address,
      createdAt: new Date(),
    };

    orders.push(newOrder);
    return newOrder;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Invalid order data');
  }
};

export const getUserOrders = (token: string) => {
  const userId = verifyToken(token);
  if (!userId) {
    throw new Error('Unauthorized');
  }

  return orders.filter(order => order.userId === userId);
};

export const updateOrderStatus = (
  token: string,
  orderId: string,
  status: Order['status']
) => {
  const userId = verifyToken(token);
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const order = orders.find(o => o.id === orderId && o.userId === userId);
  if (!order) {
    throw new Error('Order not found');
  }

  order.status = status;
  return order;
};