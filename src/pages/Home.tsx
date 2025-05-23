import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Utensils, Truck, Clock, Shield, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import BannerSlider from '../components/BannerSlider';
import { getFeaturedProducts, getProductsBySubcategory } from '../data/products';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const features = [
  {
    icon: <Truck className="w-6 h-6" />,
    title: "Fast Delivery",
    description: "Get your orders delivered within hours",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Quality Assured",
    description: "Fresh and high-quality products",
    color: "bg-yellow-100 text-yellow-600"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "24/7 Support",
    description: "Round the clock customer service",
    color: "bg-red-100 text-red-600"
  }
];

const ProductCard = ({ product }: { product: any }) => {
  const { addToCart } = useStore();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      variants={item}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className="bg-white rounded-xl shadow-lg overflow-hidden group"
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => {
              addToCart(product);
              toast.success('Added to cart');
            }}
            className="bg-white text-gray-800 px-6 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 hover:bg-blue-500 hover:text-white"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">₹{product.price}</span>
        </div>
      </div>
    </motion.div>
  );
};

const ProductSection = ({ title, products, link }: { title: string; products: any[]; link: string }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className="mb-12"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <Link
          to={link}
          className="flex items-center text-blue-500 hover:text-blue-600"
        >
          View All
          <ChevronRight className="h-5 w-5 ml-1" />
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </motion.div>
  );
};

export default function Home() {
  const featuredProducts = getFeaturedProducts();
  const popularSnacks = getProductsBySubcategory('food', 'quick_bites');
  const freshProduce = getProductsBySubcategory('grocery', 'fruits_vegetables');

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to FoodMart
        </h1>
        <p className="text-gray-600 text-lg">
          Your one-stop destination for groceries and delicious food
        </p>
      </motion.div>

      <BannerSlider />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 gap-8 mb-12"
      >
        <motion.div variants={item}>
          <Link
            to="/category/grocery"
            className="block bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="p-8">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Grocery</h2>
              <p className="text-gray-600 mb-4">
                Fresh produce, pantry essentials, snacks, and more. Shop from our wide
                selection of groceries.
              </p>
              <span className="inline-flex items-center text-green-600 font-semibold">
                Browse Grocery
                <ChevronRight className="h-5 w-5 ml-1" />
              </span>
            </div>
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <Link
            to="/category/food"
            className="block bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="p-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <Utensils className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Food</h2>
              <p className="text-gray-600 mb-4">
                Ready-to-eat meals, snacks, and desserts. Order your favorite dishes
                for instant delivery.
              </p>
              <span className="inline-flex items-center text-blue-600 font-semibold">
                Browse Food
                <ChevronRight className="h-5 w-5 ml-1" />
              </span>
            </div>
          </Link>
        </motion.div>
      </motion.div>

      <ProductSection
        title="Featured Products"
        products={featuredProducts}
        link="/category/grocery"
      />

      <ProductSection
        title="Popular Quick Bites"
        products={popularSnacks}
        link="/category/food"
      />

      <ProductSection
        title="Fresh Produce"
        products={freshProduce}
        link="/category/grocery"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-8 mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Why Choose FoodMart?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center mb-12"
      >
        <h2 className="text-2xl font-bold mb-4">Download Our App</h2>
        <p className="mb-6">Get exclusive offers and track your orders in real-time</p>
        <div className="flex justify-center space-x-4">
          <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            App Store
          </button>
          <button className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Play Store
          </button>
        </div>
      </motion.div>
    </div>
  );
}