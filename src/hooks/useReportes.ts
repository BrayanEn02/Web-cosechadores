import { useState, useEffect } from 'react';
import { pesajesService, type PesajeCompleto } from '../services/pesajes.service';
import { cosechemrosService } from '../services/cosecheros.service';
import type { Database } from '../utils/supabase/types';

type Cosechero = Database['public']['Tables']['cosecheros']['Row'];

export interface ResumenGeneral {
  totalKilos: number;
  totalPagado: number;
  numeroPesajes: number;
  promedioKilos: number;
  promedioPago: number;
}

export interface ResumenCosechero {
  cosechero_id: string;
  nombre: string;
  documento: string;
  totalKilos: number;
  totalPagado: number;
  numeroPesajes: number;
}

export function useReportes() {
  const [cosecheros, setCosecheros] = useState<Cosechero[]>([]);
  const [pesajes, setPesajes] = useState<PesajeCompleto[]>([]);
  const [resumen, setResumen] = useState<ResumenGeneral>({
    totalKilos: 0,
    totalPagado: 0,
    numeroPesajes: 0,
    promedioKilos: 0,
    promedioPago: 0,
  });
  const [resumenPorCosechero, setResumenPorCosechero] = useState<ResumenCosechero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filtroCosechero, setFiltroCosechero] = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');

  useEffect(() => {
    loadCosecheros();
  }, []);

  useEffect(() => {
    loadPesajes();
  }, [filtroCosechero, filtroFechaInicio, filtroFechaFin]);

  const loadCosecheros = async () => {
    try {
      const data = await cosechemrosService.getAll();
      setCosecheros(data);
    } catch (err: any) {
      console.error('Error cargando cosecheros:', err);
    }
  };

  const loadPesajes = async () => {
    try {
      setLoading(true);
      setError('');

      let data: PesajeCompleto[];

      if (filtroCosechero) {
        data = await pesajesService.getByCosechero(filtroCosechero);
      } else if (filtroFechaInicio && filtroFechaFin) {
        data = await pesajesService.getByDateRange(filtroFechaInicio, filtroFechaFin);
      } else {
        data = await pesajesService.getAll();
      }

      setPesajes(data);

      const totalKilos = data.reduce((sum, p) => sum + Number(p.kilos_neto), 0);
      const totalPagado = data.reduce((sum, p) => sum + Number(p.total_pagar), 0);
      const numeroPesajes = data.length;

      setResumen({
        totalKilos,
        totalPagado,
        numeroPesajes,
        promedioKilos: numeroPesajes > 0 ? totalKilos / numeroPesajes : 0,
        promedioPago: numeroPesajes > 0 ? totalPagado / numeroPesajes : 0,
      });

      const agrupado: { [key: string]: ResumenCosechero } = {};
      data.forEach((p) => {
        if (!agrupado[p.cosechero_id]) {
          agrupado[p.cosechero_id] = {
            cosechero_id: p.cosechero_id,
            nombre: p.cosechero_nombre || 'Desconocido',
            documento: p.cosechero_documento || '',
            totalKilos: 0,
            totalPagado: 0,
            numeroPesajes: 0,
          };
        }
        agrupado[p.cosechero_id].totalKilos += Number(p.kilos_neto);
        agrupado[p.cosechero_id].totalPagado += Number(p.total_pagar);
        agrupado[p.cosechero_id].numeroPesajes += 1;
      });

      setResumenPorCosechero(
        Object.values(agrupado).sort((a, b) => b.totalKilos - a.totalKilos)
      );
    } catch (err: any) {
      console.error('Error cargando pesajes:', err);
      setError('Error al cargar los datos de reportes.');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltroCosechero('');
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
  };

  return {
    cosecheros,
    pesajes,
    resumen,
    resumenPorCosechero,
    loading,
    error,
    filtroCosechero,
    setFiltroCosechero,
    filtroFechaInicio,
    setFiltroFechaInicio,
    filtroFechaFin,
    setFiltroFechaFin,
    limpiarFiltros,
  };
}
