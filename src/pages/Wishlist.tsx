import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Heart, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  const handleAddToCart = (product: typeof wishlist[0]) => {
    addToCart(product);
    toast.success('Added to cart');
  };

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-4">Save items you love to your wishlist</p>
        <Link
          to="/"
          className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Wishlist</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden group"
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-red-500 hover:text-red-600"
              >
                <Heart className="h-5 w-5 fill-current" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-800">₹{product.price}</span>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}