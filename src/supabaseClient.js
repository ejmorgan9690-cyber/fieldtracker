import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owygcutjqfbjiihpevfr.supabase.co';
const supabaseAnonKey = 'sb_publishable_SRExcUhLmEReJ-W99l5Kjg_ug_cjCur';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
