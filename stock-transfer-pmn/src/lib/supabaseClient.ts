import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase configurado
 * Conecta con la base de datos usando credenciales del .env
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase no configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Ejemplo de uso en servicios:
 * 
 * const { data, error } = await supabase
 *   .from('transfers')
 *   .select('*')
 * 
 * if (error) throw error
 * return data
 */
