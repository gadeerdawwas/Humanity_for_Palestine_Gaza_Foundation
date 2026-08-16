import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
  status: 'new' | 'read' | 'replied';
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  created_at: string;
};

export type Project = {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  category: 'women_child' | 'relief' | 'education' | 'health';
  status: 'ongoing' | 'completed';
  cover_image_url: string;
  display_order: number;
  created_at: string;
};

export type GalleryImage = {
  id: string;
  image_url: string;
  caption_ar: string | null;
  caption_en: string | null;
  display_order: number;
  created_at: string;
};

export type Service = {
  id: string;
  number: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  accent_color: string;
  icon_name: string;
  display_order: number;
};
