import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { pagosService, type PagoCompleto } from '../services/pagos.service';
import { cosechemrosService } from '../services/cosecheros.service';
import type { Database } from '../utils/supabase/types';

type Cosechero = Database['public']['Tables']['cosecheros']['Row'];

export interface ResumenPago {
  cosechero_id: string;
  nombre: string;
  documento: string;
  totalKilos: number;
  totalGanado: number;
  totalAdelantado: number;
  totalPagado: number;
  saldoPendiente: number;
  estado: 'pendiente' | 'pagado';
  pesajesCount: number;
}

export function usePagos() {
  const [cosecheros, setCosecheros] = useState<Cosechero[]>([]);
  const [resumen, setResumen] = useState<ResumenPago[]>([]);
  const [historialPagos, setHistorialPagos] = useState<PagoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pendiente' | 'pagado'>('todos');
  const [filtroCosechero, setFiltroCosechero] = useState('');

  useEffect(() => {
    loadData();
  }, [filtroEstado, filtroCosechero]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const cosecherosData = await cosechemrosService.getAll();
      setCosecheros(cosecherosData);

      const { data: pesajesData } = await supabase
        .from('pesajes')
        .select('cosechero_id, kilos_neto, total_pagar');

      const { data: adelantosData } = await supabase
        .from('adelantos')
        .select('cosechero_id, monto');

      const pagosData = await pagosService.getAll();
      setHistorialPagos(pagosData);

      const totalGanadoMap: { [key: string]: number } = {};
      const totalKilosMap: { [key: string]: number } = {};
      const pesajesCountMap: { [key: string]: number } = {};

      (pesajesData || []).forEach((p: any) => {
        if (!totalGanadoMap[p.cosechero_id]) {
          totalGanadoMap[p.cosechero_id] = 0;
          totalKilosMap[p.cosechero_id] = 0;
          pesajesCountMap[p.cosechero_id] = 0;
        }
        totalGanadoMap[p.cosechero_id] += Number(p.total_pagar);
        totalKilosMap[p.cosechero_id] += Number(p.kilos_neto);
        pesajesCountMap[p.cosechero_id] += 1;
      });

      const totalAdelantadoMap: { [key: string]: number } = {};
      (adelantosData || []).forEach((a: any) => {
        if (!totalAdelantadoMap[a.cosechero_id]) totalAdelantadoMap[a.cosechero_id] = 0;
        totalAdelantadoMap[a.cosechero_id] += Number(a.monto);
      });

      const totalPagadoMap: { [key: string]: number } = {};
      pagosData.forEach((p) => {
        if (!totalPagadoMap[p.cosechero_id]) totalPagadoMap[p.cosechero_id] = 0;
        totalPagadoMap[p.cosechero_id] += Number(p.monto);
      });

      const resumenList: ResumenPago[] = cosecherosData
        .map((c) => {
          const totalGanado = totalGanadoMap[c.id] || 0;
          const totalAdelantado = totalAdelantadoMap[c.id] || 0;
          const totalPagado = totalPagadoMap[c.id] || 0;
          const totalKilos = totalKilosMap[c.id] || 0;
          const pesajesCount = pesajesCountMap[c.id] || 0;
          const saldoPendiente = totalGanado - totalAdelantado - totalPagado;

          return {
            cosechero_id: c.id,
            nombre: c.nombre,
            documento: c.documento,
            totalKilos,
            totalGanado,
            totalAdelantado,
            totalPagado,
            saldoPendiente: saldoPendiente > 0 ? saldoPendiente : 0,
            estado: saldoPendiente <= 0 && totalGanado > 0 ? 'pagado' : 'pendiente',
            pesajesCount,
          };
        })
        .filter((r) => {
          if (filtroCosechero && r.cosechero_id !== filtroCosechero) return false;
          if (filtroEstado === 'todos') return r.totalGanado > 0;
          return r.estado === filtroEstado;
        })
        .sort((a, b) => b.saldoPendiente - a.saldoPendiente);

      setResumen(resumenList);
    } catch (err: any) {
      console.error('Error cargando pagos:', err);
      setError('Error al cargar los datos de pagos.');
    } finally {
      setLoading(false);
    }
  };

  const registrarPago = async (data: {
    cosechero_id: string;
    monto: number;
    nota?: string;
  }) => {
    try {
      await pagosService.create(data);
      await loadData();
      return { success: true };
    } catch (err: any) {
      console.error('Error registrando pago:', err);
      return {
        success: false,
        error: err.message || 'Error al registrar el pago.',
      };
    }
  };

  const eliminarPago = async (id: string) => {
    try {
      await pagosService.delete(id);
      await loadData();
      return { success: true };
    } catch (err: any) {
      console.error('Error eliminando pago:', err);
      return {
        success: false,
        error: err.message || 'Error al eliminar el pago.',
      };
    }
  };

  return {
    cosecheros,
    resumen,
    historialPagos,
    loading,
    error,
    filtroEstado,
    setFiltroEstado,
    filtroCosechero,
    setFiltroCosechero,
    registrarPago,
    eliminarPago,
    reloadData: loadData,
  };
}
