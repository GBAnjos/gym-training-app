import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mkwwvlauzlficncjfzmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rd3d2bGF1emxmaWNuY2pmem1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTc5OTIsImV4cCI6MjA4ODYzMzk5Mn0.Y-rpFA2MeaOD3LWzLOU66WUfcRnm-7HtLI9XbaY9-uw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
