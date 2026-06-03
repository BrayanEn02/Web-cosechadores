import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  KeyRound,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  RefreshCw,
} from 'lucide-react';
import { cosechemrosService } from '../../services/cosecheros.service';

interface CosecheroInfo {
  id: string;
  nombre: string;
  documento: string;
  telefono: string;
  estado: 'activo' | 'inactivo';
  primer_ingreso: boolean;
  created_at: string;
}

export default function GestionContrasenas() {
  const navigate = useNavigate();
  const [cosecheros, setCosecheros] = useState<CosecheroInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [buscando, setBuscando] = useState('');
  const [reseteando, setReseteando] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await cosechemrosService.getAllWithPasswordInfo();
      setCosecheros(data as CosecheroInfo[]);
    } catch {
      setError('Error al cargar los cosecheros.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (id: string, nombre: string) => {
    if (!confirm(`¿Resetear contraseña de ${nombre}? El cosechero deberá crear una nueva al ingresar.`)) return;

    setReseteando(id);
    setError('');
    setExito('');

    try {
      await cosechemrosService.resetPassword(id);
      setExito(`Contraseña de ${nombre} reseteada correctamente.`);
      await loadData();
    } catch {
      setError('Error al resetear la contraseña.');
    } finally {
      setReseteando(null);
    }
  };

  const cosecherosFiltrados = buscando
    ? cosecheros.filter(
        (c) =>
          c.nombre.toLowerCase().includes(buscando.toLowerCase()) ||
          c.documento.includes(buscando)
      )
    : cosecheros;

  const activos = cosecherosFiltrados.filter((c) => c.estado === 'activo');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Contraseñas</h1>
                <p className="text-sm text-gray-600">Administra las contraseñas de los cosecheros</p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {exito && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{exito}</p>
          </div>
        )}

        {/* Buscador */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={buscando}
              onChange={(e) => setBuscando(e.target.value)}
              autoComplete="off"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="Buscar por nombre o documento..."
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando cosecheros...</p>
          </div>
        ) : cosecheros.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <KeyRound className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay cosecheros registrados</p>
          </div>
        ) : activos.length === 0 && buscando ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No se encontraron cosecheros con ese criterio</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Documento</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Estado</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody>
                {activos.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{c.nombre}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{c.documento}</td>
                    <td className="py-3 px-4 text-center">
                      {c.primer_ingreso ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          Sin contraseña
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3" />
                          Configurada
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleReset(c.id, c.nombre)}
                        disabled={reseteando === c.id || c.primer_ingreso}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={c.primer_ingreso ? 'Aún no tiene contraseña' : 'Resetear contraseña'}
                      >
                        {reseteando === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Resetear
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {cosecheros.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
                <span className="font-medium">{activos.length}</span> cosecheros activos
                {buscando && ` (filtrados de ${cosecheros.length})`}
                {' — '}
                <span className="font-medium text-yellow-700">{activos.filter(c => c.primer_ingreso).length}</span> sin contraseña
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
