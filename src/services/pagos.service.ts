import { supabase } from '../utils/supabase/client';
import type { Database } from '../utils/supabase/types';

type Pago = Database['public']['Tables']['pagos']['Row'];
type PagoInsert = Database['public']['Tables']['pagos']['Insert'];

export interface PagoCompleto extends Pago {
  cosechero_nombre?: string;
  cosechero_documento?: string;
}

export const pagosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        cosecheros (nombre, documento)
      `)
      .order('fecha_pago', { ascending: false });

    if (error) throw error;

    return data.map((p: any) => ({
      ...p,
      cosechero_nombre: p.cosecheros?.nombre,
      cosechero_documento: p.cosecheros?.documento,
    })) as PagoCompleto[];
  },

  async create(pago: PagoInsert) {
    const { data, error } = await supabase
      .from('pagos')
      .insert(pago)
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
    } as PagoCompleto;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('pagos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
