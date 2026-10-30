import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string | undefined => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.[key]) {
      return (import.meta as any).env[key];
    }
  } catch {
    // ignore
  }
  try {
    if (typeof process !== 'undefined' && process.env?.[key]) {
      return process.env[key];
    }
  } catch {
    // ignore
  }
  return undefined;
};

// Supabase Client API Configuration
export const SUPABASE_URL =
  getEnvVar('VITE_SUPABASE_URL') ||
  getEnvVar('SUPABASE_URL') ||
  'https://wkaduojflufgffthbfuo.supabase.co';

export const SUPABASE_ANON_KEY =
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  getEnvVar('SUPABASE_ANON_KEY') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYWR1b2pmbHVnZmZ0aGJmYnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDAwMDAsImV4cCI6MjA1NTU1NTU1NX0.placeholder_anon_key';

export const isSupabaseRealtimeConfigured =
  Boolean(SUPABASE_ANON_KEY) && !SUPABASE_ANON_KEY.includes('placeholder_anon_key');

let clientInstance: SupabaseClient;

try {
  clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} catch (err) {
  console.warn('[CloudPlay Notice] Supabase client initialized with safe fallback:', err);
  clientInstance = {
    channel: () => ({
      on: function () {
        return this;
      },
      subscribe: function () {
        return this;
      },
    }),
    removeChannel: () => {},
  } as unknown as SupabaseClient;
}

export const supabase: SupabaseClient = clientInstance;
