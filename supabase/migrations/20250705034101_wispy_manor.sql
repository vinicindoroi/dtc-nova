/*
  # Fix Analytics Table Migration

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

  3. Performance
    - Add indexes for common query patterns
    - Optimize for analytics workload
*/

-- Drop table if exists to start fresh
DROP TABLE IF EXISTS vsl_analytics CASCADE;

-- Create the vsl_analytics table
CREATE TABLE vsl_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('page_enter', 'video_play', 'video_progress', 'pitch_reached', 'offer_click', 'page_exit')),
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

-- Create indexes for performance
CREATE INDEX idx_vsl_analytics_session_id ON vsl_analytics (session_id);
CREATE INDEX idx_vsl_analytics_event_type ON vsl_analytics (event_type);
CREATE INDEX idx_vsl_analytics_created_at ON vsl_analytics (created_at);
CREATE INDEX idx_vsl_analytics_timestamp ON vsl_analytics (timestamp);
CREATE INDEX idx_vsl_analytics_country_code ON vsl_analytics (country_code);
CREATE INDEX idx_vsl_analytics_ip ON vsl_analytics (ip);
CREATE INDEX idx_vsl_analytics_last_ping ON vsl_analytics (last_ping);
CREATE INDEX idx_vsl_analytics_vturb_loaded ON vsl_analytics (vturb_loaded);

-- Create RLS policies
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
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;