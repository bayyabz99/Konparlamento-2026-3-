-- ========================================================
-- KONPARLAMENTO 2026 DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(100) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  age INT,
  grade VARCHAR(50),
  gender VARCHAR(20),
  avatar_url TEXT,
  pin_hash TEXT,
  role VARCHAR(50) DEFAULT 'KATILIMCI', -- KATILIMCI, SUPER_ADMIN, YONETICI, ICERIK_EDITORU, KOMISYON_SORUMLUSU
  committee_id VARCHAR(100),
  duty VARCHAR(100) DEFAULT 'Delegasyon Üyesi',
  status VARCHAR(30) DEFAULT 'BEKLEMEDE', -- BEKLEMEDE, ONAYLANDI, REDDEDILDI
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(100) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  age INT,
  grade VARCHAR(50),
  gender VARCHAR(20),
  avatar_url TEXT,
  motivation TEXT,
  pin VARCHAR(10) NOT NULL,
  requested_role VARCHAR(100),
  requested_party VARCHAR(100),
  attended BOOLEAN DEFAULT FALSE,
  attended_at TIMESTAMP WITH TIME ZONE,
  invite_token VARCHAR(50),
  status VARCHAR(30) DEFAULT 'BEKLEMEDE', -- BEKLEMEDE, ONAYLANDI, REDDEDILDI
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. COMMITTEES TABLE
CREATE TABLE IF NOT EXISTS committees (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  short_description TEXT,
  detailed_description TEXT,
  logo_url TEXT,
  purpose TEXT,
  workflow TEXT,
  duties TEXT,
  rules TEXT,
  chair_person VARCHAR(150),
  vice_chair_person VARCHAR(150),
  images JSONB DEFAULT '[]'::jsonb, -- 3 images slider array
  order_num INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. COMMITTEE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS committee_members (
  id VARCHAR(100) PRIMARY KEY,
  committee_id VARCHAR(100) REFERENCES committees(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role_title VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  order_num INT DEFAULT 0
);

-- 5. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(100) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role_title VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'Organizasyon', -- Yönetim, Teknik Ekip, Organizasyon, Medya, Komisyon Yönetimi
  avatar_url TEXT,
  order_num INT DEFAULT 0
);

-- 6. SPONSORS TABLE
CREATE TABLE IF NOT EXISTS sponsors (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  logo_url TEXT NOT NULL,
  sponsor_type VARCHAR(50) DEFAULT 'Ana Sponsor', -- Ana Sponsor, Altın Sponsor, Gümüş Sponsor, Destekçi
  website_url TEXT,
  order_num INT DEFAULT 0,
  is_supporter BOOLEAN DEFAULT FALSE
);

-- 7. PROGRAM DAYS & EVENTS TABLE
CREATE TABLE IF NOT EXISTS program_days (
  id VARCHAR(100) PRIMARY KEY,
  day_number INT UNIQUE NOT NULL, -- 1, 2, 3, 4
  title VARCHAR(100) NOT NULL, -- e.g. "1. Gün — 15 Nisan 2026"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS program_events (
  id VARCHAR(100) PRIMARY KEY,
  day_number INT NOT NULL,
  time_slot VARCHAR(30) NOT NULL, -- e.g. "09:00"
  title VARCHAR(150) NOT NULL,
  description TEXT,
  location VARCHAR(100),
  order_num INT DEFAULT 0
);

-- 8. GALLERY OFFICIAL TABLE
CREATE TABLE IF NOT EXISTS gallery_official (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(150),
  image_url TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'Etkinlik Fotoğrafı',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. GALLERY PARTICIPANT UPLOADS TABLE
CREATE TABLE IF NOT EXISTS gallery_uploads (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(100),
  user_name VARCHAR(150) NOT NULL,
  user_role VARCHAR(100) DEFAULT 'Katılımcı',
  file_path TEXT NOT NULL,
  file_size_bytes INT,
  status VARCHAR(30) DEFAULT 'BEKLEMEDE', -- BEKLEMEDE, ONAYLANDI, REDDEDILDI
  approved_by VARCHAR(100),
  approved_at TIMESTAMP WITH TIME ZONE,
  consent_given BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. RIDDLES & ANSWERS TABLE
CREATE TABLE IF NOT EXISTS riddles (
  id VARCHAR(100) PRIMARY KEY,
  question TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS riddle_answers (
  id VARCHAR(100) PRIMARY KEY,
  riddle_id VARCHAR(100) REFERENCES riddles(id) ON DELETE CASCADE,
  user_id VARCHAR(100),
  user_name VARCHAR(150) NOT NULL,
  answer_text TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'BEKLIYOR', -- BEKLIYOR, DOGRU, YANLIS
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. POLLS & VOTES TABLE
CREATE TABLE IF NOT EXISTS polls (
  id VARCHAR(100) PRIMARY KEY,
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS poll_options (
  id VARCHAR(100) PRIMARY KEY,
  poll_id VARCHAR(100) REFERENCES polls(id) ON DELETE CASCADE,
  option_text VARCHAR(200) NOT NULL,
  vote_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id VARCHAR(100) PRIMARY KEY,
  poll_id VARCHAR(100) REFERENCES polls(id) ON DELETE CASCADE,
  option_id VARCHAR(100) REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_poll UNIQUE (poll_id, user_id)
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(100) PRIMARY KEY,
  user_id VARCHAR(150), -- NULL for broadcast, or target user ID / email
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'DUYURU', -- BASVURU_ONAY, BASVURU_RED, BILMECE_SONUC, FOTOGRAF_ONAY, FOTOGRAF_RED, DUYURU, SISTEM
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. LEGAL DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS legal_documents (
  id VARCHAR(50) PRIMARY KEY, -- kvkk, gizlilik, cerez, kullanimKosullari
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  admin_name VARCHAR(150) NOT NULL,
  action VARCHAR(150) NOT NULL,
  target VARCHAR(150),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. PARTIES TABLE
CREATE TABLE IF NOT EXISTS parties (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  acronym VARCHAR(20) NOT NULL,
  color VARCHAR(20) DEFAULT '#dc2626',
  logo_url TEXT,
  description TEXT,
  ideology VARCHAR(100),
  leader VARCHAR(150),
  member_count INT DEFAULT 0,
  seats INT DEFAULT 0,
  order_num INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on core security tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE riddle_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE riddles ENABLE ROW LEVEL SECURITY;
ALTER TABLE committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow full CRUD permissions for admin management operations
CREATE POLICY "Full Access Applications" ON applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Riddles" ON riddles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Riddle Answers" ON riddle_answers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Polls" ON polls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Poll Options" ON poll_options FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Poll Votes" ON poll_votes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Gallery Uploads" ON gallery_uploads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Committees" ON committees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Parties" ON parties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Site Settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Full Access Notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('gallery-uploads', 'gallery-uploads', true),
  ('avatars', 'avatars', true),
  ('sponsor-logos', 'sponsor-logos', true),
  ('committee-images', 'committee-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Read Storage" ON storage.objects FOR SELECT USING (bucket_id IN ('gallery-uploads', 'avatars', 'sponsor-logos', 'committee-images'));
CREATE POLICY "Public Insert Storage Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-uploads');
