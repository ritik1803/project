/*
  # Seed Initial Data

  1. Purpose
    - Add initial product data
    - Add admin user role
    - Add sample categories

  2. Changes
    - Add admin column to users table
    - Insert sample products
    - Insert sample categories
*/

-- Add admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, subcategory, stock) VALUES
('Lays Classic', 'Classic salted potato chips', 20, 'https://images.unsplash.com/photo-1566478989037-eec170784d0b', 'grocery', 'snacks', 100),
('Mixed Nuts', 'Premium mixed nuts (500g)', 299, 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32', 'grocery', 'snacks', 50),
('Fresh Apples', 'Fresh red apples (1kg)', 80, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6', 'grocery', 'fruits_vegetables', 200),
('Organic Bananas', 'Organic bananas (1kg)', 60, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e', 'grocery', 'fruits_vegetables', 150),
('Butter Chicken', 'Creamy butter chicken curry', 280, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398', 'food', 'main_course', 20),
('Paneer Tikka', 'Grilled cottage cheese with spices', 220, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8', 'food', 'main_course', 25);

-- Add RLS policy for admin users
CREATE POLICY "Admin users can perform all actions" ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );