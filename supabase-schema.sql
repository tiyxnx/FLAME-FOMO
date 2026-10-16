-- ==============================================================================
-- FLAME FOMO: SUPABASE DATABASE SETUP SCRIPT
-- ==============================================================================
-- This script sets up the two main tables for FLAME FOMO:
-- 1. "profiles" - Stores student profile data, cohort, interests, timetable & saved events
-- 2. "events"   - Stores campus events, locations, deadlines, and registration links
-- ==============================================================================

-- 1. Create the PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  flame_email TEXT PRIMARY KEY,                       -- Strictly @flame.edu.in
  name TEXT NOT NULL,                                 -- Student display name
  academic_year TEXT NOT NULL DEFAULT 'UG2',          -- UG1, UG2, UG3, UG4, All
  category_preferences JSONB DEFAULT '[]'::jsonb,    -- Array of preferred category strings
  academic_timetable JSONB DEFAULT '[]'::jsonb,      -- Array of enrolled class objects for clash detection
  saved_events JSONB DEFAULT '[]'::jsonb,             -- Event IDs marked as Saved
  going_events JSONB DEFAULT '[]'::jsonb,             -- Event IDs marked as I'm Going
  favourite_events JSONB DEFAULT '[]'::jsonb,         -- Event IDs marked as Favourite (Star)
  favourite_categories JSONB DEFAULT '[]'::jsonb,     -- Starred categories
  quiz_completed BOOLEAN DEFAULT false,               -- Whether student completed initial onboarding
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS favourite_events JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS quiz_completed BOOLEAN DEFAULT false;

-- 2. Create the EVENTS table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,                                -- Unique Event ID (e.g. evt-1)
  event_name TEXT NOT NULL,                           -- Prominent card title
  category TEXT NOT NULL,                             -- Academic, Clubs, Sports, Performances, etc.
  date DATE NOT NULL,                                 -- YYYY-MM-DD
  time_start_end TEXT NOT NULL,                       -- e.g. "18:00 - 20:00"
  time_start TEXT,                                    -- e.g. "18:00"
  time_end TEXT,                                      -- e.g. "20:00"
  venue_zone TEXT NOT NULL,                           -- Academics, Sports, Eateries, Flora & Fauna, Shantiniketan/Recreational
  room_specific TEXT,                                 -- e.g. "Vikram Sarabhai Centre 204" or "FLAME Kund"
  organizer TEXT NOT NULL,                            -- e.g. "FLAME Music & Arts Guild"
  description TEXT NOT NULL,                          -- Readable full paragraph
  registration_deadline TEXT,                         -- Deadline date & time
  registration_link TEXT,                             -- Google Form or external portal URL
  requirements_eligibility TEXT,                      -- e.g. "Open to All Cohorts"
  event_image TEXT,                                   -- Photo URL inside Polaroid frame
  status TEXT NOT NULL DEFAULT 'Upcoming',            -- Upcoming, Registration Closed, Cancelled
  submitted_by TEXT,                                  -- Student email who published the event
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) & Allow Public Read/Write for Student Community
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Allow anyone with the anon key to read profiles & events
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public write profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public insert events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update events" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Public delete events" ON public.events FOR DELETE USING (true);

-- 4. Clean Slate for Production
-- Events are created dynamically by students and club leads using the web application's
-- "Create Event" (+) floating action button or directly managed in the Supabase Table Editor.

-- 5. Student Feedback & Ratings System
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ratings JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS feedback JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS saved_users JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS going_users JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS favourite_users JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS saved_count INT DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS going_count INT DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS favourite_count INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.site_feedback (
  id TEXT PRIMARY KEY,
  user_email TEXT,
  category TEXT NOT NULL,
  rating INT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.site_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_feedback" ON public.site_feedback FOR SELECT USING (true);
CREATE POLICY "Public insert site_feedback" ON public.site_feedback FOR INSERT WITH CHECK (true);


