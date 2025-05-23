/*
  # Add Payment Fields to Orders Table

  1. Changes
    - Add payment_id column to orders table
    - Add payment_status column to orders table

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE orders
ADD COLUMN payment_id text,
ADD COLUMN payment_status text DEFAULT 'pending';