import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { adelantosService, type AdelantoCompleto } from '../services/adelantos.service';
import { cosechemrosService } from '../services/cosecheros.service';
import type { Database } from '../utils/supabase/types';

type Cosechero = Database['public']['Tables']['cosecheros']['Row'];

export interface ResumenAdelanto {
  cosechero_id: string;
  nombre: string;
  documento: string;
  totalAdelantado: number;
  totalGanado: number;
  saldoPendiente: number;
}

export function useAdelantos() {
  const [cosecheros, setCosecheros] = useState<Cosechero[]>([]);
  const [adelantos, setAdelantos] = useState<AdelantoCompleto[]>([]);
  const [resumen, setResumen] = useState<ResumenAdelanto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filtroCosechero, setFiltroCosechero] = useState('');

  useEffect(() => {
    loadData();
  }, [filtroCosechero]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [cosecherosData, adelantosData] = await Promise.all([
        cosechemrosService.getAll(),
        filtroCosechero ? adelantosService.getByCosechero(filtroCosechero) : adelantosService.getAll(),
      ]);

      setCosecheros(cosecherosData);
      setAdelantos(adelantosData);

      const totalGanadoMap: { [key: string]: number } = {};
      const { data: pesajesData } = await supabase
        .from('pesajes')
        .select('cosechero_id, total_pagar');

      if (pesajesData) {
        pesajesData.forEach((p: any) => {
          if (!totalGanadoMap[p.cosechero_id]) totalGanadoMap[p.cosechero_id] = 0;
          totalGanadoMap[p.cosechero_id] += Number(p.total_pagar);
        });
      }

      const resumenMap: { [key: string]: ResumenAdelanto } = {};
      cosecherosData.forEach((c) => {
        resumenMap[c.id] = {
          cosechero_id: c.id,
          nombre: c.nombre,
          documento: c.documento,
          totalAdelantado: 0,
          totalGanado: totalGanadoMap[c.id] || 0,
          saldoPendiente: 0,
        };
      });

      adelantosData.forEach((a) => {
        if (resumenMap[a.cosechero_id]) {
          resumenMap[a.cosechero_id].totalAdelantado += Number(a.monto);
        }
      });

      const resumenList = Object.values(resumenMap)
        .map((r) => ({
          ...r,
          saldoPendiente: r.totalGanado - r.totalAdelantado,
        }))
        .filter((r) => r.totalAdelantado > 0 || r.totalGanado > 0)
        .sort((a, b) => b.totalAdelantado - a.totalAdelantado);

      setResumen(resumenList);
    } catch (err: any) {
      console.error('Error cargando adelantos:', err);
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const registrarAdelanto = async (data: {
    cosechero_id: string;
    monto: number;
    nota?: string;
  }) => {
    try {
      await adelantosService.create(data);
      await loadData();
      return { success: true };
    } catch (err: any) {
      console.error('Error registrando adelanto:', err);
      return {
        success: false,
        error: err.message || 'Error al registrar el adelanto. Verifica la conexión.',
      };
    }
  };

  const eliminarAdelanto = async (id: string) => {
    try {
      await adelantosService.delete(id);
      await loadData();
      return { success: true };
    } catch (err: any) {
      console.error('Error eliminando adelanto:', err);
      return {
        success: false,
        error: err.message || 'Error al eliminar el adelanto.',
      };
    }
  };

  return {
    cosecheros,
    adelantos,
    resumen,
    loading,
    error,
    filtroCosechero,
    setFiltroCosechero,
    registrarAdelanto,
    eliminarAdelanto,
    reloadData: loadData,
  };
}
