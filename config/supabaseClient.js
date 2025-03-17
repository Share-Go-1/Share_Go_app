// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uhleujhysonyidiyzlqp.supabase.co'; // e.g., https://your-project-ref.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobGV1amh5c29ueWlkaXl6bHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxOTc1MTgsImV4cCI6MjA1Nzc3MzUxOH0.cfWhNaJ0s9fSrSgsnuXwNQs6CFX-j_0llqKhctM5p1w'; // Your public anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
