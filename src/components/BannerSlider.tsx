import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const banners = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1920',
    title: 'Fresh Groceries',
    subtitle: 'Get fresh groceries delivered to your doorstep',
    color: 'from-green-600/60',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1920',
    title: 'Delicious Food',
    subtitle: 'Order your favorite meals online',
    color: 'from-blue-600/60',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1543168256-418811576931?q=80&w=1920',
    title: 'Special Offers',
    subtitle: 'Save big on your favorite items',
    color: 'from-purple-600/60',
  },
];

export default function BannerSlider() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        effect="fade"
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        className="h-[500px] rounded-xl overflow-hidden"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative w-full h-full group">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${banner.color} to-transparent flex flex-col justify-end p-12 text-white`}>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-bold mb-4"
                >
                  {banner.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl"
                >
                  {banner.subtitle}
                </motion.p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
}