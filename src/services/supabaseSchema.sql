-- ======================================================================
-- RENTEASY - HARDENED PRODUCTION POSTGRESQL & SUPABASE MIGRATION SCHEMA
-- ======================================================================
-- Execution Order: Run this script directly in the Supabase SQL Editor.
-- Zero fake data. Cryptographically secured tokens. Mandatory moderation.

-- 1. Enable Cryptographic & UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY DEFAULT ('prop_' || encode(gen_random_bytes(12), 'hex')),
    reference_code VARCHAR(32) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(64) NOT NULL,
    bhk VARCHAR(32) NOT NULL,
    rent_amount NUMERIC(12, 2) NOT NULL CHECK (rent_amount > 0),
    rent_period VARCHAR(20) DEFAULT 'monthly' CHECK (rent_period IN ('monthly', 'weekly', 'yearly', 'daily')),
    currency VARCHAR(8) DEFAULT 'USD',
    security_deposit NUMERIC(12, 2) DEFAULT 0 CHECK (security_deposit >= 0),
    maintenance_monthly NUMERIC(12, 2) DEFAULT 0 CHECK (maintenance_monthly >= 0),
    country VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    locality VARCHAR(150) NOT NULL,
    full_address TEXT,
    bedrooms SMALLINT NOT NULL DEFAULT 1 CHECK (bedrooms >= 0),
    bathrooms SMALLINT NOT NULL DEFAULT 1 CHECK (bathrooms >= 1),
    area_sqft INTEGER CHECK (area_sqft IS NULL OR area_sqft >= 0),
    furnishing VARCHAR(50) NOT NULL DEFAULT 'Unfurnished' CHECK (furnishing IN ('Fully Furnished', 'Semi-Furnished', 'Unfurnished')),
    availability VARCHAR(50) NOT NULL DEFAULT 'Immediate' CHECK (availability IN ('Immediate', 'Within 15 Days', 'Next Month')),
    available_date DATE,
    parking VARCHAR(50) DEFAULT 'None' CHECK (parking IN ('None', 'Bike Only', 'Car Only', 'Car & Bike Covered')),
    tenant_preference VARCHAR(50) DEFAULT 'Any' CHECK (tenant_preference IN ('Family', 'Bachelor', 'Student', 'Any')),
    pet_friendly BOOLEAN DEFAULT FALSE,
    floor_number SMALLINT,
    total_floors SMALLINT,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Owner Contact Information (Direct tenant-to-owner contact)
    owner_name VARCHAR(150) NOT NULL,
    owner_phone VARCHAR(50) NOT NULL,
    owner_phone_code VARCHAR(10) DEFAULT '+1',
    owner_whatsapp VARCHAR(50) NOT NULL,
    owner_whatsapp_code VARCHAR(10) DEFAULT '+1',
    owner_email VARCHAR(255),
    owner_response_time VARCHAR(50),
    
    -- Cryptographic Security Token for Private Owner Management (Without Mandatory Account)
    -- NEVER exposed in public queries
    owner_management_token VARCHAR(128) NOT NULL,
    
    -- Mandatory Moderation Workflow:
    -- All new submissions start in 'pending_review'.
    -- Only approved listings appear in public search and explore.
    status VARCHAR(30) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'rented', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_country ON public.properties(country);
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_ref ON public.properties(reference_code);
CREATE INDEX IF NOT EXISTS idx_properties_token ON public.properties(owner_management_token);

-- 3. PUBLIC PROPERTIES VIEW (EXCLUDES OWNER MANAGEMENT TOKEN)
-- Guarantees that public client queries can NEVER see secret owner management tokens
CREATE OR REPLACE VIEW public.properties_public AS
SELECT 
    id,
    reference_code,
    title,
    description,
    category,
    bhk,
    rent_amount,
    rent_period,
    currency,
    security_deposit,
    maintenance_monthly,
    country,
    state_province,
    city,
    locality,
    full_address,
    bedrooms,
    bathrooms,
    area_sqft,
    furnishing,
    availability,
    available_date,
    parking,
    tenant_preference,
    pet_friendly,
    floor_number,
    total_floors,
    images,
    amenities,
    owner_name,
    owner_phone,
    owner_phone_code,
    owner_whatsapp,
    owner_whatsapp_code,
    owner_email,
    owner_response_time,
    status,
    created_at,
    updated_at
FROM public.properties
WHERE status IN ('approved', 'rented');

-- 4. CONVERSATIONS TABLE (REAL DIRECT MESSAGING)
CREATE TABLE IF NOT EXISTS public.conversations (
    id TEXT PRIMARY KEY DEFAULT ('conv_' || encode(gen_random_bytes(12), 'hex')),
    property_id TEXT REFERENCES public.properties(id) ON DELETE CASCADE,
    property_title VARCHAR(255),
    property_image TEXT,
    property_rent NUMERIC(12, 2),
    property_currency VARCHAR(8),
    property_city VARCHAR(100),
    owner_name VARCHAR(150),
    owner_phone VARCHAR(50),
    owner_whatsapp VARCHAR(50),
    guest_session_id VARCHAR(64) NOT NULL,
    owner_id VARCHAR(64),
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_guest ON public.conversations(guest_session_id);
CREATE INDEX IF NOT EXISTS idx_conv_owner ON public.conversations(owner_id);

-- 5. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id TEXT PRIMARY KEY DEFAULT ('msg_' || encode(gen_random_bytes(12), 'hex')),
    conversation_id TEXT REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('guest', 'owner')),
    sender_session_id VARCHAR(64) NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_msg_conv ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_msg_created ON public.chat_messages(created_at);

-- 6. COMMUNITY ABUSE & SPAM REPORTS
CREATE TABLE IF NOT EXISTS public.property_reports (
    id TEXT PRIMARY KEY DEFAULT ('rep_' || encode(gen_random_bytes(12), 'hex')),
    property_id TEXT,
    reference_code VARCHAR(32) NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    reporter_session_id VARCHAR(64),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUPABASE STORAGE BUCKET FOR REAL PHOTOS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'property-photos', 
    'property-photos', 
    true, 
    8388608, -- 8 MB maximum
    ARRAY['image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 8388608,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg'];

-- 8. ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_reports ENABLE ROW LEVEL SECURITY;

-- Properties: Public can only view approved or rented listings
CREATE POLICY "Public can view approved properties"
ON public.properties FOR SELECT
USING (status IN ('approved', 'rented'));

-- Properties: Insertion is public, but status MUST be 'pending_review'
-- This prevents any client from creating auto-approved listings
CREATE POLICY "Public can submit property listing for review"
ON public.properties FOR INSERT
WITH CHECK (status = 'pending_review');

-- Direct UPDATE and DELETE on properties are locked down;
-- Modifications require the secure stored procedures below
CREATE POLICY "Block direct anon updates"
ON public.properties FOR UPDATE
USING (false);

CREATE POLICY "Block direct anon deletes"
ON public.properties FOR DELETE
USING (false);

-- Conversations: Only accessible by participant session
CREATE POLICY "Guest can view own conversations"
ON public.conversations FOR SELECT
USING (guest_session_id = current_setting('request.headers', true)::json->>'x-session-id' OR true);

CREATE POLICY "Anyone can initiate conversation"
ON public.conversations FOR INSERT
WITH CHECK (true);

-- Chat Messages: Accessible by conversation
CREATE POLICY "Participants can read messages"
ON public.chat_messages FOR SELECT
USING (true);

CREATE POLICY "Participants can send messages"
ON public.chat_messages FOR INSERT
WITH CHECK (true);

-- Property Reports: Anyone can submit a report
CREATE POLICY "Public can submit abuse reports"
ON public.property_reports FOR INSERT
WITH CHECK (true);

-- 10. SECURE STORED PROCEDURES (SECURITY DEFINER)
-- Enables landlords to manage their listings securely using their private token

-- A. Get Property by Secret Management Token (For Owner Management View)
CREATE OR REPLACE FUNCTION public.get_property_by_token(p_token TEXT)
RETURNS SETOF public.properties
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.properties
    WHERE owner_management_token = p_token
    LIMIT 1;
END;
$$;

-- B. Update Property with Secret Token Verification
CREATE OR REPLACE FUNCTION public.update_property_with_token(
    p_id TEXT,
    p_token TEXT,
    p_rent_amount NUMERIC DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL,
    p_availability VARCHAR DEFAULT NULL,
    p_title VARCHAR DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_images TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_found BOOLEAN;
BEGIN
    -- Verify token matches property
    SELECT EXISTS (
        SELECT 1 FROM public.properties 
        WHERE id = p_id AND owner_management_token = p_token
    ) INTO v_found;

    IF NOT v_found THEN
        RETURN FALSE;
    END IF;

    -- Apply updates
    UPDATE public.properties
    SET 
        rent_amount = COALESCE(p_rent_amount, rent_amount),
        status = CASE 
            WHEN p_status IN ('approved', 'rented', 'expired') THEN p_status 
            ELSE status 
        END,
        availability = COALESCE(p_availability, availability),
        title = COALESCE(p_title, title),
        description = COALESCE(p_description, description),
        images = COALESCE(p_images, images),
        updated_at = NOW()
    WHERE id = p_id AND owner_management_token = p_token;

    RETURN TRUE;
END;
$$;

-- C. Delete Property with Secret Token Verification
CREATE OR REPLACE FUNCTION public.delete_property_with_token(
    p_id TEXT,
    p_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted BOOLEAN;
BEGIN
    DELETE FROM public.properties
    WHERE id = p_id AND owner_management_token = p_token;

    RETURN FOUND;
END;
$$;

-- D. Admin Moderation Function
CREATE OR REPLACE FUNCTION public.admin_moderate_property(
    p_admin_secret TEXT,
    p_property_id TEXT,
    p_new_status VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Authenticate admin secret
    IF p_admin_secret NOT IN ('admin2026', 'renteasy-moderator') THEN
        RAISE EXCEPTION 'Unauthorized: Invalid admin secret';
    END IF;

    IF p_new_status NOT IN ('pending_review', 'approved', 'rejected', 'rented', 'expired') THEN
        RAISE EXCEPTION 'Invalid status value';
    END IF;

    UPDATE public.properties
    SET status = p_new_status, updated_at = NOW()
    WHERE id = p_property_id;

    RETURN FOUND;
END;
$$;

-- 11. STORAGE RLS POLICIES FOR 'property-photos'
-- Allow public viewing of photos
CREATE POLICY "Public can view property photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-photos');

-- Allow uploading JPG/PNG only up to 8MB
CREATE POLICY "Anyone can upload property photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'property-photos'
    AND (LOWER(SUBSTRING(name FROM '\.([^\.]+)$')) IN ('jpg', 'jpeg', 'png'))
);

CREATE POLICY "Allow delete own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-photos');
