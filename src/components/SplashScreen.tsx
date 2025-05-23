import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="inline-block mb-4"
        >
          <ShoppingBag className="h-20 w-20 text-white drop-shadow-lg" />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-bold text-white mb-2 drop-shadow-lg"
        >
          FoodMart
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/90 text-xl font-light"
        >
          Your One-Stop Food Shop
        </motion.p>
      </motion.div>
    </div>
  );
}