import { useState, useEffect } from 'react';
import { cosechemrosService } from '../services/cosecheros.service';
import { pesajesService, type PesajesPorFecha } from '../services/pesajes.service';
import type { Database } from '../utils/supabase/types';

type Cosechero = Database['public']['Tables']['cosecheros']['Row'];

/**
 * Hook personalizado para la página de Cosecha
 * Maneja la carga de cosecheros y el historial de pesajes
 */
export function useCosecha() {
  const [cosecheros, setCosecheros] = useState<Cosechero[]>([]);
  const [historial, setHistorial] = useState<PesajesPorFecha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar cosecheros activos y historial de pesajes en paralelo
      const [cosecherosData, historialData] = await Promise.all([
        cosechemrosService.getActivos(),
        pesajesService.getPesajesPorFecha(),
      ]);

      setCosecheros(cosecherosData);
      setHistorial(historialData);
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos. Por favor recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const buscarCosechero = async (query: string) => {
    try {
      if (!query.trim()) {
        const data = await cosechemrosService.getActivos();
        setCosecheros(data);
      } else {
        const data = await cosechemrosService.search(query);
        setCosecheros(data.filter(c => c.estado === 'activo'));
      }
    } catch (err: any) {
      console.error('Error buscando cosechero:', err);
      setError('Error al buscar cosecheros.');
    }
  };

  const registrarPesaje = async (pesajeData: {
    cosechero_id: string;
    lote_id?: string;
    kilos_bruto: number;
    descuento: number;
    kilos_neto: number;
    precio_kilo: number;
    total_pagar: number;
  }) => {
    try {
      await pesajesService.create(pesajeData);

      // Recargar historial
      const historialData = await pesajesService.getPesajesPorFecha();
      setHistorial(historialData);

      return { success: true };
    } catch (err: any) {
      console.error('Error registrando pesaje:', err);
      return {
        success: false,
        error: 'Error al registrar el pesaje. Por favor intenta nuevamente.'
      };
    }
  };

  const eliminarPesaje = async (id: string) => {
    try {
      await pesajesService.delete(id);
      const historialData = await pesajesService.getPesajesPorFecha();
      setHistorial(historialData);
      return { success: true };
    } catch (err: any) {
      console.error('Error eliminando pesaje:', err);
      return {
        success: false,
        error: 'Error al eliminar el pesaje. Por favor intenta nuevamente.'
      };
    }
  };

  const resetCosecheros = async () => {
    try {
      const data = await cosechemrosService.getActivos();
      setCosecheros(data);
    } catch (err: any) {
      console.error('Error restaurando cosecheros:', err);
    }
  };

  return {
    cosecheros,
    historial,
    loading,
    error,
    buscarCosechero,
    resetCosecheros,
    registrarPesaje,
    eliminarPesaje,
    reloadData: loadData,
  };
}
