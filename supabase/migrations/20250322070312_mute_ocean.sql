/*
  # Add Location Tracking Fields

  1. Changes
    - Add delivery_location column to orders table
    - Add delivery_agent_location column to orders table
    - Add delivery_agent_id column to orders table

  2. Security
    - Maintain existing RLS policies
    - Add new policy for delivery agents
*/

ALTER TABLE orders
ADD COLUMN delivery_location jsonb,
ADD COLUMN delivery_agent_location jsonb,
ADD COLUMN delivery_agent_id uuid REFERENCES users(id);

-- Add index for delivery agent queries
CREATE INDEX idx_orders_delivery_agent ON orders(delivery_agent_id);

-- Add policy for delivery agents to update their location
CREATE POLICY "Delivery agents can update their assigned orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (delivery_agent_id = auth.uid())
  WITH CHECK (delivery_agent_id = auth.uid());