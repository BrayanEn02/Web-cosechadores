import { supabase } from '../utils/supabase/client';
import type { Database } from '../utils/supabase/types';

type Adelanto = Database['public']['Tables']['adelantos']['Row'];
type AdelantoInsert = Database['public']['Tables']['adelantos']['Insert'];

export interface AdelantoCompleto extends Adelanto {
  cosechero_nombre?: string;
  cosechero_documento?: string;
}

export const adelantosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('adelantos')
      .select(`
        *,
        cosecheros (nombre, documento)
      `)
      .order('fecha_adelanto', { ascending: false });

    if (error) throw error;

    return data.map((a: any) => ({
      ...a,
      cosechero_nombre: a.cosecheros?.nombre,
      cosechero_documento: a.cosecheros?.documento,
    })) as AdelantoCompleto[];
  },

  async getByCosechero(cosecheroId: string) {
    const { data, error } = await supabase
      .from('adelantos')
      .select(`
        *,
        cosecheros (nombre, documento)
      `)
      .eq('cosechero_id', cosecheroId)
      .order('fecha_adelanto', { ascending: false });

    if (error) throw error;

    return data.map((a: any) => ({
      ...a,
      cosechero_nombre: a.cosecheros?.nombre,
      cosechero_documento: a.cosecheros?.documento,
    })) as AdelantoCompleto[];
  },

  async create(adelanto: AdelantoInsert) {
    const { data, error } = await supabase
      .from('adelantos')
      .insert(adelanto)
      .select(`
        *,
        cosecheros (nombre, documento)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      cosechero_nombre: (data as any).cosecheros?.nombre,
      cosechero_documento: (data as any).cosecheros?.documento,
    } as AdelantoCompleto;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('adelantos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
