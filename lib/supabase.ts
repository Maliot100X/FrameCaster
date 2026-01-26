import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Use fallback to prevent crash on client-side if env vars are missing
const supabaseUrl = process.env.SUPABASE_URL || 'https://plkhqvhqbnmtovjvwgfj.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our Supabase tables
export type Boost = {
  id: string; // uuid
  coin_address: string;
  amount_paid: number; // bigint in DB, but usually treated as string/number in JS
  duration_hours: number;
  user_fid?: number;
  created_at: string;
  expires_at: string;
  tx_hash?: string;
};

export type GraduatedCoin = {
  id: string; // uuid
  coin_address: string;
  name: string;
  ticker: string;
  image_uri: string;
  creator_fid: number;
  created_at: string;
};

export type Subscriber = {
  id: string; // uuid
  user_fid: number;
  trial_paid: boolean;
  monthly_paid: boolean;
  badge: string;
  start_date: string;
};
