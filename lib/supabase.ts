
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://nivtvyagoecwcegynlnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdnR2eWFnb2Vjd2NlZ3lubG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NzcxNzcsImV4cCI6MjA3MzQ1MzE3N30.H4T7Hk8kwb-wJ0nwdRws0cvhsqT3zk470G2PiouRQrM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
