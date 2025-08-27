-- Create roles enum and user_roles table for RBAC
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'agent');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER function to check roles without recursive RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Listings status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
    CREATE TYPE public.listing_status AS ENUM ('pending', 'published', 'unpublished');
  END IF;
END $$;

-- Feedback status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_status') THEN
    CREATE TYPE public.feedback_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

-- Listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  price numeric(12,2),
  location text,
  description text,
  features jsonb NOT NULL DEFAULT '[]',
  images text[] NOT NULL DEFAULT '{}',
  status public.listing_status NOT NULL DEFAULT 'pending',
  contact_name text,
  contact_phone text,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text,
  email text,
  message text NOT NULL,
  status public.feedback_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_listings_updated_at'
  ) THEN
    CREATE TRIGGER trg_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_feedback_updated_at'
  ) THEN
    CREATE TRIGGER trg_feedback_updated_at
    BEFORE UPDATE ON public.feedback
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Policies: Listings
-- Published listings are viewable by everyone
CREATE POLICY IF NOT EXISTS "Published listings are viewable by everyone"
ON public.listings
FOR SELECT
USING (status = 'published');

-- Users can view their own listings
CREATE POLICY IF NOT EXISTS "Users can view their own listings"
ON public.listings
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Admins can view all listings
CREATE POLICY IF NOT EXISTS "Admins can view all listings"
ON public.listings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can create a pending listing without owner (public submission)
CREATE POLICY IF NOT EXISTS "Anyone can submit pending listing"
ON public.listings
FOR INSERT
WITH CHECK (
  (owner_id IS NULL AND status = 'pending')
  OR (owner_id = auth.uid() AND status IN ('pending','unpublished'))
  OR public.has_role(auth.uid(), 'admin')
);

-- Agents can update their own non-published listings
CREATE POLICY IF NOT EXISTS "Agents can update own non-published listings"
ON public.listings
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid() AND status <> 'published')
WITH CHECK (owner_id = auth.uid() AND status <> 'published');

-- Admins can insert/update/delete any listing
CREATE POLICY IF NOT EXISTS "Admins can modify any listing"
ON public.listings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Prevent non-admin from publishing via trigger
CREATE OR REPLACE FUNCTION public.prevent_non_admin_publish()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'published' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can publish listings';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_only_admin_publish'
  ) THEN
    CREATE TRIGGER trg_only_admin_publish
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.prevent_non_admin_publish();
  END IF;
END $$;

-- Policies: Feedback
-- Approved feedback is viewable by everyone
CREATE POLICY IF NOT EXISTS "Approved feedback is public"
ON public.feedback
FOR SELECT
USING (status = 'approved');

-- Anyone can submit feedback (pending)
CREATE POLICY IF NOT EXISTS "Anyone can submit feedback"
ON public.feedback
FOR INSERT
WITH CHECK (status = 'pending');

-- Admins can manage feedback
CREATE POLICY IF NOT EXISTS "Admins can manage feedback"
ON public.feedback
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create public storage bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images','listing-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for listing images
CREATE POLICY IF NOT EXISTS "Public can view listing images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'listing-images');

CREATE POLICY IF NOT EXISTS "Anyone can upload listing images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'listing-images');