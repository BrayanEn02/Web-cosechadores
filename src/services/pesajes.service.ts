import { supabase } from '../utils/supabase/client';
import type { Database } from '../utils/supabase/types';

type Pesaje = Database['public']['Tables']['pesajes']['Row'];
type PesajeInsert = Database['public']['Tables']['pesajes']['Insert'];
type PesajeUpdate = Database['public']['Tables']['pesajes']['Update'];

export interface PesajeCompleto extends Pesaje {
  cosechero_nombre?: string;
  cosechero_documento?: string;
  lote_nombre?: string;
}

export interface PesajesPorFecha {
  fecha: string;
  pesajes: PesajeCompleto[];
  totalKilos: number;
  totalPagar: number;
}

export const pesajesService = {
  // Obtener todos los pesajes con información completa
  async getAll() {
    const { data, error } = await supabase
      .from('pesajes')
      .select(`
        *,
        cosecheros (nombre, documento),
        lotes (nombre)
      `)
      .order('fecha_pesaje', { ascending: false });

    if (error) throw error;

    return data.map((p: any) => ({
      ...p,
      cosechero_nombre: p.cosecheros?.nombre,
      cosechero_documento: p.cosecheros?.documento,
      lote_nombre: p.lotes?.nombre,
    })) as PesajeCompleto[];
  },

  // Obtener pesajes de un cosechero
  async getByCosechero(cosecheroId: string) {
    const { data, error } = await supabase
      .from('pesajes')
      .select(`
        *,
        cosecheros (nombre, documento),
        lotes (nombre)
      `)
      .eq('cosechero_id', cosecheroId)
      .order('fecha_pesaje', { ascending: false });

    if (error) throw error;

    return data.map((p: any) => ({
      ...p,
      cosechero_nombre: p.cosecheros?.nombre,
      cosechero_documento: p.cosecheros?.documento,
      lote_nombre: p.lotes?.nombre,
    })) as PesajeCompleto[];
  },

  // Obtener pesajes por rango de fechas
  async getByDateRange(fechaInicio: string, fechaFin: string) {
    const { data, error } = await supabase
      .from('pesajes')
      .select(`
        *,
        cosecheros (nombre, documento),
        lotes (nombre)
      `)
      .gte('fecha_pesaje', fechaInicio)
      .lte('fecha_pesaje', fechaFin)
      .order('fecha_pesaje', { ascending: false });

    if (error) throw error;

    return data.map((p: any) => ({
      ...p,
      cosechero_nombre: p.cosecheros?.nombre,
      cosechero_documento: p.cosecheros?.documento,
      lote_nombre: p.lotes?.nombre,
    })) as PesajeCompleto[];
  },

  // Obtener pesajes agrupados por fecha
  async getPesajesPorFecha() {
    const pesajes = await this.getAll();

    const agrupados: { [key: string]: PesajesPorFecha } = {};

    pesajes.forEach((pesaje) => {
      const fecha = new Date(pesaje.fecha_pesaje).toLocaleDateString('es-CO');

      if (!agrupados[fecha]) {
        agrupados[fecha] = {
          fecha,
          pesajes: [],
          totalKilos: 0,
          totalPagar: 0,
        };
      }

      agrupados[fecha].pesajes.push(pesaje);
      agrupados[fecha].totalKilos += Number(pesaje.kilos_neto);
      agrupados[fecha].totalPagar += Number(pesaje.total_pagar);
    });

    return Object.values(agrupados).sort((a, b) => {
      return new Date(b.pesajes[0].fecha_pesaje).getTime() - new Date(a.pesajes[0].fecha_pesaje).getTime();
    });
  },

  // Crear un nuevo pesaje
  async create(pesaje: PesajeInsert) {
    const { data, error } = await supabase
      .from('pesajes')
      .insert(pesaje)
      .select(`
        *,
        cosecheros (nombre, documento),
        lotes (nombre)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      cosechero_nombre: (data as any).cosecheros?.nombre,
      cosechero_documento: (data as any).cosecheros?.documento,
      lote_nombre: (data as any).lotes?.nombre,
    } as PesajeCompleto;
  },

  // Actualizar un pesaje
  async update(id: string, updates: PesajeUpdate) {
    const { data, error } = await supabase
      .from('pesajes')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        cosecheros (nombre, documento),
        lotes (nombre)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      cosechero_nombre: (data as any).cosecheros?.nombre,
      cosechero_documento: (data as any).cosecheros?.documento,
      lote_nombre: (data as any).lotes?.nombre,
    } as PesajeCompleto;
  },

  // Eliminar un pesaje
  async delete(id: string) {
    const { error } = await supabase
      .from('pesajes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

};
