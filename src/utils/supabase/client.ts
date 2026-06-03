import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuración de Supabase
const supabaseUrl = 'https://medorydgcjnfhrggvred.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('VITE_SUPABASE_ANON_KEY no está configurada. Por favor, añade tu clave en un archivo .env');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
