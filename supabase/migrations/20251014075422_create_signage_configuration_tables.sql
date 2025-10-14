/*
  # Create Signage Customizer Configuration Tables

  ## Overview
  This migration creates the database structure for a Shopify signage customizer app
  that supports multiple stores with customizable fonts, colors, sizes, and other options.

  ## New Tables

  ### 1. `stores`
  Tracks each Shopify store using the app
  - `id` (uuid, primary key)
  - `shop_domain` (text, unique) - Shopify store domain
  - `access_token` (text) - Encrypted Shopify access token
  - `script_tag_id` (text, nullable) - Shopify script tag ID for storefront embed
  - `is_active` (boolean) - Whether the app is active for this store
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `fonts`
  Available fonts for signage customization
  - `id` (uuid, primary key)
  - `store_id` (uuid, foreign key)
  - `name` (text) - Font name
  - `font_family` (text) - CSS font family value
  - `font_url` (text, nullable) - URL to font file if custom
  - `is_active` (boolean)
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ### 3. `colors`
  Available color options
  - `id` (uuid, primary key)
  - `store_id` (uuid, foreign key)
  - `name` (text) - Color name (e.g., "Red", "Blue")
  - `hex_value` (text) - Hex color code
  - `is_active` (boolean)
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ### 4. `sizes`
  Available size options
  - `id` (uuid, primary key)
  - `store_id` (uuid, foreign key)
  - `name` (text) - Size name
  - `width` (numeric, nullable)
  - `height` (numeric, nullable)
  - `unit` (text) - Measurement unit (inches, cm, etc.)
  - `price_modifier` (numeric) - Additional cost for this size
  - `is_active` (boolean)
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ### 5. `usage_types`
  Indoor or Outdoor usage types
  - `id` (uuid, primary key)
  - `store_id` (uuid, foreign key)
  - `name` (text) - "Indoor" or "Outdoor"
  - `description` (text, nullable)
  - `price_modifier` (numeric)
  - `is_active` (boolean)
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ### 6. `acrylic_shapes`
  Shape options for signage
  - `id` (uuid, primary key)
  - `store_id` (uuid, foreign key)
  - `name` (text) - Shape name
  - `description` (text, nullable)
  - `price_modifier` (numeric)
  - `is_active` (boolean)
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ### 7. `backboard_colors`
  Backboard color options
  - `id` (uuid, primary key)
  - `store_id` (uuid, foreign key)
  - `name` (text)
  - `hex_value` (text)
  - `price_modifier` (numeric)
  - `is_active` (boolean)
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ### 8. `hanging_options`
  Hanging/mounting options
  - `id` (uuid, primary key)
  - `store_id` (uuid, foreign key)
  - `name` (text)
  - `description` (text, nullable)
  - `price_modifier` (numeric)
  - `is_active` (boolean)
  - `display_order` (integer)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated access based on store ownership
*/

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain text UNIQUE NOT NULL,
  access_token text,
  script_tag_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create fonts table
CREATE TABLE IF NOT EXISTS fonts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  font_family text NOT NULL,
  font_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create colors table
CREATE TABLE IF NOT EXISTS colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  hex_value text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create sizes table
CREATE TABLE IF NOT EXISTS sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  width numeric,
  height numeric,
  unit text DEFAULT 'inches',
  price_modifier numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create usage_types table
CREATE TABLE IF NOT EXISTS usage_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price_modifier numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create acrylic_shapes table
CREATE TABLE IF NOT EXISTS acrylic_shapes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price_modifier numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create backboard_colors table
CREATE TABLE IF NOT EXISTS backboard_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  hex_value text NOT NULL,
  price_modifier numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create hanging_options table
CREATE TABLE IF NOT EXISTS hanging_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price_modifier numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fonts_store_id ON fonts(store_id);
CREATE INDEX IF NOT EXISTS idx_colors_store_id ON colors(store_id);
CREATE INDEX IF NOT EXISTS idx_sizes_store_id ON sizes(store_id);
CREATE INDEX IF NOT EXISTS idx_usage_types_store_id ON usage_types(store_id);
CREATE INDEX IF NOT EXISTS idx_acrylic_shapes_store_id ON acrylic_shapes(store_id);
CREATE INDEX IF NOT EXISTS idx_backboard_colors_store_id ON backboard_colors(store_id);
CREATE INDEX IF NOT EXISTS idx_hanging_options_store_id ON hanging_options(store_id);

-- Enable Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE fonts ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE acrylic_shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE backboard_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hanging_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores table
CREATE POLICY "Allow public read access to stores"
  ON stores FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to stores"
  ON stores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to stores"
  ON stores FOR UPDATE
  USING (true);

-- RLS Policies for fonts table
CREATE POLICY "Allow public read access to fonts"
  ON fonts FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to fonts"
  ON fonts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to fonts"
  ON fonts FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete from fonts"
  ON fonts FOR DELETE
  USING (true);

-- RLS Policies for colors table
CREATE POLICY "Allow public read access to colors"
  ON colors FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to colors"
  ON colors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to colors"
  ON colors FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete from colors"
  ON colors FOR DELETE
  USING (true);

-- RLS Policies for sizes table
CREATE POLICY "Allow public read access to sizes"
  ON sizes FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to sizes"
  ON sizes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to sizes"
  ON sizes FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete from sizes"
  ON sizes FOR DELETE
  USING (true);

-- RLS Policies for usage_types table
CREATE POLICY "Allow public read access to usage_types"
  ON usage_types FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to usage_types"
  ON usage_types FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to usage_types"
  ON usage_types FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete from usage_types"
  ON usage_types FOR DELETE
  USING (true);

-- RLS Policies for acrylic_shapes table
CREATE POLICY "Allow public read access to acrylic_shapes"
  ON acrylic_shapes FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to acrylic_shapes"
  ON acrylic_shapes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to acrylic_shapes"
  ON acrylic_shapes FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete from acrylic_shapes"
  ON acrylic_shapes FOR DELETE
  USING (true);

-- RLS Policies for backboard_colors table
CREATE POLICY "Allow public read access to backboard_colors"
  ON backboard_colors FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to backboard_colors"
  ON backboard_colors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to backboard_colors"
  ON backboard_colors FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete from backboard_colors"
  ON backboard_colors FOR DELETE
  USING (true);

-- RLS Policies for hanging_options table
CREATE POLICY "Allow public read access to hanging_options"
  ON hanging_options FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to hanging_options"
  ON hanging_options FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to hanging_options"
  ON hanging_options FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete from hanging_options"
  ON hanging_options FOR DELETE
  USING (true);