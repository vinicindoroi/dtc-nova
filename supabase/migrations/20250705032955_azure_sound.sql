/*
  # Create VSL Analytics Table

  1. New Tables
    - `vsl_analytics`
      - `id` (uuid, primary key)
      - `session_id` (text, not null)
      - `event_type` (text, not null, constrained)
      - `event_data` (jsonb, default empty object)
      - `timestamp` (timestamptz, default now)
      - `created_at` (timestamptz, default now)
      - `ip` (text, nullable)
      - `country_code` (text, nullable)
      - `country_name` (text, nullable)
      - `city` (text, nullable)
      - `region` (text, nullable)
      - `last_ping` (timestamptz, default now)
      - `vturb_loaded` (boolean, default false)

  2. Security
    - Enable RLS on `vsl_analytics` table
    - Add policies for public read and insert access
    - Grant necessary permissions to anon and authenticated users

  3. Performance
    - Add indexes for commonly queried columns
    - Optimize for analytics queries and live user tracking
*/

-- Create the vsl_analytics table
CREATE TABLE IF NOT EXISTS vsl_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  ip text,
  country_code text,
  country_name text,
  city text,
  region text,
  last_ping timestamptz DEFAULT now(),
  vturb_loaded boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE vsl_analytics ENABLE ROW LEVEL SECURITY;

-- Add constraint for event_type (with safe check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'vsl_analytics' 
    AND constraint_name = 'vsl_analytics_event_type_check'
  ) THEN
    ALTER TABLE vsl_analytics ADD CONSTRAINT vsl_analytics_event_type_check 
    CHECK (event_type = ANY (ARRAY['page_enter'::text, 'video_play'::text, 'video_progress'::text, 'pitch_reached'::text, 'offer_click'::text, 'page_exit'::text]));
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_session_id ON vsl_analytics (session_id);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_event_type ON vsl_analytics (event_type);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_created_at ON vsl_analytics (created_at);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_timestamp ON vsl_analytics (timestamp);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_country_code ON vsl_analytics (country_code);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_ip ON vsl_analytics (ip);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_last_ping ON vsl_analytics (last_ping);
CREATE INDEX IF NOT EXISTS idx_vsl_analytics_vturb_loaded ON vsl_analytics (vturb_loaded);

-- Drop existing policies if they exist (to avoid conflicts)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public read for analytics" ON vsl_analytics;
  DROP POLICY IF EXISTS "Allow public insert for analytics" ON vsl_analytics;
EXCEPTION
  WHEN undefined_object THEN
    -- Policy doesn't exist, continue
    NULL;
END $$;

-- Create RLS policies (without IF NOT EXISTS)
CREATE POLICY "Allow public read for analytics"
  ON vsl_analytics
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert for analytics"
  ON vsl_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT ON vsl_analytics TO anon;
GRANT SELECT, INSERT, UPDATE ON vsl_analytics TO authenticated;