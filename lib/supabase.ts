import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our Supabase tables
export type Boost = {
  id: number;
  coin_address: string;
  amount_paid: string;
  duration_hours: number;
  created_at: string;
  expires_at: string;
};

export type GraduatedCoin = {
  id: number;
  coin_address: string;
  name: string;
  ticker: string;
  image_uri: string;
  creator_fid: number;
  created_at: string;
};
