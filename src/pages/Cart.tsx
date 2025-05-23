import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function Cart() {
  const { cart, updateQuantity, removeFromCart } = useStore();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some items to your cart to get started</p>
        <Link
          to="/"
          className="inline-block bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors"
        >
          Start Shopping
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-gray-800 mb-8"
      >
        Shopping Cart
      </motion.h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="lg:col-span-2"
        >
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="bg-white rounded-xl shadow-md p-6 mb-4 transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-6">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 mb-2">{item.description}</p>
                    <p className="text-lg font-bold text-blue-600">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 rounded-full hover:bg-gray-200"
                      >
                        <Minus className="h-4 w-4" />
                      </motion.button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 rounded-full hover:bg-gray-200"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
            <Link
              to="/checkout"
              className="mt-8 block bg-blue-500 text-white py-3 px-4 rounded-full text-center hover:bg-blue-600 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
