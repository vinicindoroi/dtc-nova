import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced error handling with better debugging
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not defined. Please check your environment variables.');
  console.error('Available env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
  console.error('💡 Solution: Click "Connect to Supabase" button in the top right corner');
  throw new Error('Missing VITE_SUPABASE_URL environment variable - Please connect to Supabase first');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not defined. Please check your environment variables.');
  console.error('Available env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
  console.error('💡 Solution: Click "Connect to Supabase" button in the top right corner');
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable - Please connect to Supabase first');
}

// Validate URL format
try {
  const url = new URL(supabaseUrl);
  if (!url.hostname.includes('supabase.co') && !url.hostname.includes('localhost')) {
    console.warn('⚠️ URL does not appear to be a Supabase URL:', supabaseUrl);
  }
} catch (error) {
  console.error('❌ Invalid VITE_SUPABASE_URL format:', supabaseUrl);
  console.error('💡 Expected format: https://your-project.supabase.co');
  throw new Error('Invalid VITE_SUPABASE_URL format - Please check your Supabase project URL');
}

// Validate anon key format (basic check)
if (supabaseAnonKey.length < 100) {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY appears to be too short. Expected a JWT token.');
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

// Test connection on initialization with better error handling
const testConnection = async () => {
  try {
    console.log('🧪 Testing Supabase connection...');
    
    // First test: Basic connectivity
    const { data, error } = await supabase
      .from('vsl_analytics')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      console.error('Error details:', error);
      
      // Provide helpful error messages based on error type
      if (error.code === 'PGRST116') {
        console.error('💡 Table not found or no permissions');
        console.error('🔧 Solution: Run the database migration or check RLS policies');
      } else if (error.code === '42P01') {
        console.error('💡 Table "vsl_analytics" does not exist');
        console.error('🔧 Solution: Run the database migration to create the table');
      } else if (error.message.includes('JWT')) {
        console.error('💡 Authentication failed');
        console.error('🔧 Solution: Check your VITE_SUPABASE_ANON_KEY');
      } else if (error.message.includes('Failed to fetch')) {
        console.error('💡 Network connection failed');
        console.error('🔧 Solution: Check your internet connection and Supabase URL');
      } else if (error.code === 'PGRST301') {
        console.error('💡 Row Level Security is blocking access');
        console.error('🔧 Solution: Check RLS policies on vsl_analytics table');
      }
      
      return false;
    } else {
      console.log('✅ Supabase connection test successful');
      console.log('📊 Found', data?.length || 0, 'existing analytics records');
      
      // Test insert capability
      try {
        const testInsert = await supabase
          .from('vsl_analytics')
          .insert({
            session_id: `connection_test_${Date.now()}`,
            event_type: 'page_enter',
            event_data: { test: true, connection_test: true },
            ip: '127.0.0.1',
            country_code: 'TEST',
            country_name: 'Test Country'
          })
          .select('id');
        
        if (testInsert.error) {
          console.warn('⚠️ Connection OK but insert failed:', testInsert.error.message);
          console.warn('🔧 Check RLS policies for INSERT operations');
        } else {
          console.log('✅ Insert test successful - Analytics fully functional');
          
          // Clean up test record
          if (testInsert.data?.[0]?.id) {
            await supabase
              .from('vsl_analytics')
              .delete()
              .eq('id', testInsert.data[0].id);
          }
        }
      } catch (insertError) {
        console.warn('⚠️ Insert test failed:', insertError);
      }
      
      return true;
    }
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('💡 Network error - check your internet connection');
      console.error('🔧 Also verify your Supabase URL is correct');
    }
    
    return false;
  }
};

// Test connection after a short delay to allow for initialization
let connectionTested = false;
const initializeConnection = async () => {
  if (connectionTested) return;
  connectionTested = true;
  
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.error('🚨 Supabase connection failed - Analytics may not work properly');
    console.error('📋 Troubleshooting steps:');
    console.error('1. Click "Connect to Supabase" button in Bolt');
    console.error('2. Verify your Supabase project is active');
    console.error('3. Check if the vsl_analytics table exists');
    console.error('4. Verify RLS policies are configured correctly');
  }
};

// Test connection immediately and also after a delay
setTimeout(initializeConnection, 1000);

// Also test when the page becomes visible (in case of network issues)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !connectionTested) {
      initializeConnection();
    }
  });
}

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