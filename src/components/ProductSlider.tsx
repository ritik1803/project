import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  subcategory: string;
}

interface ProductSliderProps {
  title: string;
  products: Product[];
}

export default function ProductSlider({ title, products }: ProductSliderProps) {
  const { addToCart, toggleWishlist, wishlist } = useStore();

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 }
        }}
        className="product-slider"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden group">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      addToCart(product);
                      toast.success('Added to cart');
                    }}
                    className="bg-white p-3 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      toggleWishlist(product);
                      toast.success(
                        isInWishlist(product.id)
                          ? 'Removed from wishlist'
                          : 'Added to wishlist'
                      );
                    }}
                    className={`bg-white p-3 rounded-full transition-colors ${
                      isInWishlist(product.id)
                        ? 'text-red-500 hover:bg-red-500 hover:text-white'
                        : 'hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isInWishlist(product.id) ? 'fill-current' : ''
                      }`}
                    />
                  </motion.button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-blue-600">
                    ₹{product.price}
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}