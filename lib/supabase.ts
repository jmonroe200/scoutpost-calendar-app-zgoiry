
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

/**
 * Sign out the current user
 * @returns Promise that resolves when sign out is complete
 */
export const signOut = async (): Promise<void> => {
  try {
    console.log('Signing out user...');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
    
    console.log('Sign out successful');
  } catch (error) {
    console.error('Unexpected error during sign out:', error);
    throw error;
  }
};

/**
 * Check if user is currently authenticated
 * @returns Promise that resolves to boolean indicating auth status
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

/**
 * Get current user session
 * @returns Promise that resolves to the current session or null
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting current session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Unexpected error getting current session:', error);
    return null;
  }
};
