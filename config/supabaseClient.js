import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wasytsylagnmqfachwth.supabase.co';  // Replace with your project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indhc3l0c3lsYWdubXFmYWNod3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwNjQzMTIsImV4cCI6MjA1MjY0MDMxMn0.qATHfTIbCJMQ9_PQOJzs_EqJzUyW2ImandCKw-rH7ss';  // Replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
