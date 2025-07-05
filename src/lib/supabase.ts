import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced error handling with better debugging
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not defined. Please check your environment variables.');
  console.error('Available env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not defined. Please check your environment variables.');
  console.error('Available env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('❌ Invalid VITE_SUPABASE_URL format:', supabaseUrl);
  throw new Error('Invalid VITE_SUPABASE_URL format');
}

console.log('✅ Supabase configuration loaded successfully');
console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Anon Key length:', supabaseAnonKey.length);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist auth sessions for analytics
    autoRefreshToken: false,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'BlueDrops-VSL-Analytics'
    }
  }
});

// Test connection on initialization
const testConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('vsl_analytics')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      console.error('Error details:', error);
      
      // Provide helpful error messages
      if (error.code === 'PGRST116') {
        console.error('💡 Suggestion: Check if the table exists and RLS policies are configured');
      } else if (error.code === '42P01') {
        console.error('💡 Suggestion: Run the database migration to create the vsl_analytics table');
      } else if (error.message.includes('JWT')) {
        console.error('💡 Suggestion: Check your VITE_SUPABASE_ANON_KEY');
      }
    } else {
      console.log('✅ Supabase connection test successful');
      console.log('📊 Found', data?.length || 0, 'existing analytics records');
    }
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
  }
};

// Test connection after a short delay to allow for initialization
setTimeout(testConnection, 2000);

export type Database = {
  public: {
    Tables: {
      vsl_analytics: {
        Row: {
          id: string;
          session_id: string;
          event_type: 'page_enter' | 'video_play' | 'video_progress' | 'pitch_reached' | 'offer_click' | 'page_exit';
          event_data: any;
          timestamp: string;
          created_at: string;
          ip: string | null;
          country_code: string | null;
          country_name: string | null;
          city: string | null;
          region: string | null;
          last_ping: string | null;
          vturb_loaded: boolean | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          event_type: 'page_enter' | 'video_play' | 'video_progress' | 'pitch_reached' | 'offer_click' | 'page_exit';
          event_data?: any;
          timestamp?: string;
          created_at?: string;
          ip?: string | null;
          country_code?: string | null;
          country_name?: string | null;
          city?: string | null;
          region?: string | null;
          last_ping?: string | null;
          vturb_loaded?: boolean | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          event_type?: 'page_enter' | 'video_play' | 'video_progress' | 'pitch_reached' | 'offer_click' | 'page_exit';
          event_data?: any;
          timestamp?: string;
          created_at?: string;
          ip?: string | null;
          country_code?: string | null;
          country_name?: string | null;
          city?: string | null;
          region?: string | null;
          last_ping?: string | null;
          vturb_loaded?: boolean | null;
        };
      };
    };
  };
};