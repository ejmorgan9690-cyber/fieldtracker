import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvuewdghhhntmllrzvrm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_KEY_HERE'; // Need to read from .env
// Wait, I can just use curl or fetch directly. No, I don't have the key.
// I will read the .env file to get the key.
