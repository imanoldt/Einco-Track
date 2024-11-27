import { createClient } from '@supabase/supabase-js';

// Usar `process.env` en lugar de `import.meta.env`
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('Missing VITE_SUPABASE_URL');
if (!supabaseKey) throw new Error('Missing VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseKey);
