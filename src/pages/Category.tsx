import React from 'react';
import { useParams } from 'react-router-dom';
import { products } from '../data/products';
import { useStore } from '../store/useStore';
import { Plus, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import toast from 'react-hot-toast';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Category() {
  const { category } = useParams();
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const categoryProducts = products.filter(
    (product) => product.category === category
  );

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(product);
    toast.success('Added to cart');
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-gray-800 mb-8 capitalize"
      >
        {category}
      </motion.h1>

      <motion.div
        ref={ref}
        variants={container}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {categoryProducts.map((product) => (
          <motion.div
            key={product.id}
            variants={item}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300"
          >
            <div className="relative group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-white text-gray-800 p-3 rounded-full transform -translate-y-10 group-hover:translate-y-0 transition-transform duration-300 hover:bg-blue-500 hover:text-white mx-2"
                >
                  <Plus className="h-6 w-6" />
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className="bg-white text-gray-800 p-3 rounded-full transform translate-y-10 group-hover:translate-y-0 transition-transform duration-300 hover:bg-red-500 hover:text-white mx-2"
                >
                  <Heart
                    className={`h-6 w-6 ${isInWishlist(product.id) ? 'fill-current text-red-500' : ''}`}
                  />
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">₹{product.price}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAddToCart(product)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}