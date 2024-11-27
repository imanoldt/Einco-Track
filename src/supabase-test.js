import { supabase } from './lib/supabase.js';

async function testConnection() {
  const { data, error } = await supabase.from('employees').select('*');
  if (error) {
    console.error('Error connecting to Supabase:', error);
  } else {
    console.log('Connection successful, employees data:', data);
  }
}

testConnection();
