-- ResQ Database Migration
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- NEEDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_text TEXT NOT NULL,
  location_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  geom GEOMETRY(Point, 4326),
  embedding VECTOR(1536),
  need_type TEXT,
  urgency_score INTEGER DEFAULT 0 CHECK (urgency_score >= 0 AND urgency_score <= 100),
  affected_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'resolved')),
  report_count INTEGER DEFAULT 1,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- VOLUNTEERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  skills TEXT[],
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  geom GEOMETRY(Point, 4326),
  is_available BOOLEAN DEFAULT true,
  active_task_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id UUID NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  matched_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  claude_reasoning TEXT,
  completed_at TIMESTAMPTZ
);

-- ============================================
-- TRIGGER: Auto-populate geom from lat/lng
-- ============================================
CREATE OR REPLACE FUNCTION set_geom_from_latlng()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER needs_set_geom
  BEFORE INSERT OR UPDATE ON needs
  FOR EACH ROW EXECUTE FUNCTION set_geom_from_latlng();

CREATE TRIGGER volunteers_set_geom
  BEFORE INSERT OR UPDATE ON volunteers
  FOR EACH ROW EXECUTE FUNCTION set_geom_from_latlng();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_needs_geom ON needs USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_needs_urgency ON needs (urgency_score DESC);
CREATE INDEX IF NOT EXISTS idx_needs_status ON needs (status);
CREATE INDEX IF NOT EXISTS idx_volunteers_geom ON volunteers USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_volunteers_available ON volunteers (is_available);
CREATE INDEX IF NOT EXISTS idx_assignments_need ON assignments (need_id);
CREATE INDEX IF NOT EXISTS idx_assignments_volunteer ON assignments (volunteer_id);

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE needs;
ALTER PUBLICATION supabase_realtime ADD TABLE assignments;
