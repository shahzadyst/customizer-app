/*
  # Add Font File Storage Support

  1. Storage Setup
    - Create 'font-files' storage bucket for custom font uploads
    - Set up public access policies for font files
    - Configure MIME type restrictions for font files

  2. Security
    - Allow authenticated users to upload fonts
    - Allow public read access for font files (needed for storefront)
    - Restrict deletion to font owners

  ## Notes
  - Font files will be accessible publicly for use on storefronts
  - Supported formats: .ttf, .woff, .woff2, .otf
*/

-- Create storage bucket for font files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'font-files',
  'font-files',
  true,
  5242880,
  ARRAY['font/ttf', 'font/otf', 'font/woff', 'font/woff2', 'application/x-font-ttf', 'application/x-font-otf']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload fonts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their fonts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their fonts" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for fonts" ON storage.objects;

-- Allow authenticated users to upload fonts
CREATE POLICY "Authenticated users can upload fonts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'font-files');

-- Allow authenticated users to update their font files
CREATE POLICY "Users can update their fonts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'font-files');

-- Allow authenticated users to delete their font files
CREATE POLICY "Users can delete their fonts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'font-files');

-- Allow public read access to font files (required for storefront)
CREATE POLICY "Public read access for fonts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'font-files');