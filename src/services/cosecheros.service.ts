import { supabase } from '../utils/supabase/client';
import { hashPassword } from '../utils/passwordUtils';
import type { Database } from '../utils/supabase/types';

type Cosechero = Database['public']['Tables']['cosecheros']['Row'];
type CosecheroInsert = Database['public']['Tables']['cosecheros']['Insert'];
type CosecheroUpdate = Database['public']['Tables']['cosecheros']['Update'];

export const cosechemrosService = {
  // Obtener todos los cosecheros
  async getAll() {
    const { data, error } = await supabase
      .from('cosecheros')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data as Cosechero[];
  },

  // Obtener cosecheros activos
  async getActivos() {
    const { data, error } = await supabase
      .from('cosecheros')
      .select('*')
      .eq('estado', 'activo')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data as Cosechero[];
  },

  // Buscar cosechero por nombre y documento exactos
  async buscarPorNombreYDocumento(nombre: string, documento: string) {
    const { data, error } = await supabase
      .from('cosecheros')
      .select('*')
      .eq('nombre', nombre)
      .eq('documento', documento)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Cosechero;
  },

  // Buscar cosecheros por nombre o documento
  async search(query: string) {
    const { data, error } = await supabase
      .from('cosecheros')
      .select('*')
      .or(`nombre.ilike.%${query}%,documento.ilike.%${query}%`)
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data as Cosechero[];
  },

  // Obtener un cosechero por ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('cosecheros')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Cosechero;
  },

  // Crear un nuevo cosechero
  async create(cosechero: CosecheroInsert) {
    const { data, error } = await supabase
      .from('cosecheros')
      .insert(cosechero)
      .select()
      .single();

    if (error) throw error;
    return data as Cosechero;
  },

  // Actualizar un cosechero
  async update(id: string, updates: CosecheroUpdate) {
    const { data, error } = await supabase
      .from('cosecheros')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Cosechero;
  },

  // Eliminar un cosechero
  async delete(id: string) {
    const { error } = await supabase
      .from('cosecheros')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Establecer contraseña (primer ingreso o reset)
  async setPassword(id: string, password: string) {
    const password_hash = await hashPassword(password);
    const { error } = await supabase
      .from('cosecheros')
      .update({ password_hash, primer_ingreso: false })
      .eq('id', id);

    if (error) throw error;
  },

  // Resetear contraseña (admin)
  async resetPassword(id: string) {
    const { error } = await supabase
      .from('cosecheros')
      .update({ password_hash: null, primer_ingreso: true })
      .eq('id', id);

    if (error) throw error;
  },

  // Obtener cosecheros con info de password
  async getAllWithPasswordInfo() {
    const { data, error } = await supabase
      .from('cosecheros')
      .select('id, nombre, documento, telefono, estado, primer_ingreso, created_at')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data as (Pick<Cosechero, 'id' | 'nombre' | 'documento' | 'telefono' | 'estado' | 'created_at'> & { primer_ingreso: boolean })[];
  },
};
