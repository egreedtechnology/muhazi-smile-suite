-- Add is_hero_slide column to gallery_media for hero carousel selection
ALTER TABLE public.gallery_media ADD COLUMN IF NOT EXISTS is_hero_slide boolean NOT NULL DEFAULT false;

-- Create index for faster hero slide queries
CREATE INDEX IF NOT EXISTS idx_gallery_media_hero_slide ON public.gallery_media(is_hero_slide) WHERE is_hero_slide = true;