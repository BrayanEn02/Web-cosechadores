import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  DollarSign,
  Search,
  Calendar,
  Loader2,
  Trash2,
  X,
  FileText,
  Wallet,
  Filter,
} from 'lucide-react';
import { useAdelantos } from '../../hooks/useAdelantos';
import type { Database } from '../../utils/supabase/types';

type Cosechero = Database['public']['Tables']['cosecheros']['Row'];

export default function AdelantoSaldo() {
  const navigate = useNavigate();
  const {
    cosecheros,
    adelantos,
    resumen,
    loading,
    error,
    filtroCosechero,
    setFiltroCosechero,
    registrarAdelanto,
    eliminarAdelanto,
  } = useAdelantos();

  const [busqueda, setBusqueda] = useState('');
  const [cosecheroSeleccionado, setCosecheroSeleccionado] = useState<Cosechero | null>(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [monto, setMonto] = useState('');
  const [nota, setNota] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [eliminarId, setEliminarId] = useState<string | null>(null);
  const [vistaActiva, setVistaActiva] = useState<'registrar' | 'historial' | 'saldos'>('registrar');

  const cosecherosFiltrados = cosecheros.filter(
    (c) =>
      c.estado === 'activo' &&
      (c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.documento.includes(busqueda))
  );

  const seleccionarCosechero = (c: Cosechero) => {
    setCosecheroSeleccionado(c);
    setBusqueda(c.nombre);
    setMostrarSugerencias(false);
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');

    if (!cosecheroSeleccionado) {
      setSaveError('Selecciona un cosechero');
      return;
    }

    if (!monto || parseFloat(monto) <= 0) {
      setSaveError('Ingresa un monto válido');
      return;
    }

    setSaving(true);

    const result = await registrarAdelanto({
      cosechero_id: cosecheroSeleccionado.id,
      monto: parseFloat(monto),
      nota: nota.trim() || undefined,
    });

    setSaving(false);

    if (result.success) {
      setBusqueda('');
      setCosecheroSeleccionado(null);
      setMonto('');
      setNota('');
    } else {
      setSaveError(result.error);
    }
  };

  const handleEliminar = async () => {
    if (!eliminarId) return;
    const result = await eliminarAdelanto(eliminarId);
    if (result.success) {
      setEliminarId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Adelanto de Saldo</h1>
                <p className="text-sm text-gray-600">Registro y control de adelantos</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setVistaActiva('registrar')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    vistaActiva === 'registrar'
                      ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Registrar Adelanto
                </button>
                <button
                  onClick={() => setVistaActiva('historial')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    vistaActiva === 'historial'
                      ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Historial
                </button>
                <button
                  onClick={() => setVistaActiva('saldos')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    vistaActiva === 'saldos'
                      ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Saldos
                </button>
              </div>
            </div>

            {/* Vista Registrar */}
            {vistaActiva === 'registrar' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h2 className="text-xl font-bold text-gray-900">Nuevo Adelanto</h2>
                    </div>

                    {saveError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                        {saveError}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Buscar Cosechero:
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            autoComplete="off"
                            value={busqueda}
                            onChange={(e) => {
                              setBusqueda(e.target.value);
                              setMostrarSugerencias(true);
                              if (!e.target.value) setCosecheroSeleccionado(null);
                            }}
                            onFocus={() => setMostrarSugerencias(true)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nombre o documento..."
                          />
                        </div>

                        {mostrarSugerencias && busqueda && cosecherosFiltrados.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {cosecherosFiltrados.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => seleccionarCosechero(c)}
                                className="w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0"
                              >
                                <div className="font-medium text-gray-900">{c.nombre}</div>
                                <div className="text-sm text-gray-600">Doc: {c.documento}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {cosecheroSeleccionado && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="text-sm text-green-700 font-medium">Cosechero seleccionado:</div>
                          <div className="text-green-900 font-semibold">{cosecheroSeleccionado.nombre}</div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monto del Adelanto:
                        </label>
                        <input
                          type="number"
                          step="100"
                          value={monto}
                          onChange={(e) => setMonto(e.target.value)}
                          onWheel={(e) => e.currentTarget.blur()}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nota (opcional):
                        </label>
                        <textarea
                          value={nota}
                          onChange={(e) => setNota(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                          placeholder="Motivo del adelanto..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-5 h-5" />
                            Registrar Adelanto
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de Saldos</h3>
                    {resumen.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No hay adelantos registrados</p>
                    ) : (
                      <div className="space-y-3">
                        {resumen.map((r) => (
                          <div
                            key={r.cosechero_id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-gray-900">{r.nombre}</p>
                              <span className="text-sm text-gray-500">Doc: {r.documento}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-orange-50 rounded-lg p-2 text-center">
                                <p className="text-xs text-orange-600">Adelantado</p>
                                <p className="text-sm font-bold text-orange-900">
                                  {formatearMoneda(r.totalAdelantado)}
                                </p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-2 text-center">
                                <p className="text-xs text-green-600">Ganado</p>
                                <p className="text-sm font-bold text-green-900">
                                  {formatearMoneda(r.totalGanado)}
                                </p>
                              </div>
                              <div
                                className={`rounded-lg p-2 text-center ${
                                  r.saldoPendiente >= 0
                                    ? 'bg-blue-50'
                                    : 'bg-red-50'
                                }`}
                              >
                                <p className="text-xs text-gray-600">Saldo</p>
                                <p
                                  className={`text-sm font-bold ${
                                    r.saldoPendiente >= 0 ? 'text-blue-900' : 'text-red-900'
                                  }`}
                                >
                                  {formatearMoneda(r.saldoPendiente)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Vista Historial */}
            {vistaActiva === 'historial' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Historial de Adelantos</h3>
                  <div className="flex items-center gap-2 w-64">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={filtroCosechero}
                      onChange={(e) => setFiltroCosechero(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white text-sm"
                    >
                      <option value="">Todos</option>
                      {cosecheros.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {adelantos.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No hay adelantos registrados</p>
                ) : (
                  <div className="space-y-3">
                    {adelantos.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{a.cosechero_nombre}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(a.fecha_adelanto).toLocaleDateString('es-CO')}
                              </span>
                              {a.nota && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5" />
                                  {a.nota}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-bold text-orange-600">
                            -{formatearMoneda(a.monto)}
                          </p>
                          <button
                            onClick={() => setEliminarId(a.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vista Saldos */}
            {vistaActiva === 'saldos' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Saldos por Cosechero</h3>
                {resumen.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No hay datos de saldos</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                            Cosechero
                          </th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                            Total Ganado
                          </th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                            Total Adelantado
                          </th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                            Saldo Restante
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {resumen.map((r) => (
                          <tr
                            key={r.cosechero_id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900">{r.nombre}</p>
                              <p className="text-sm text-gray-500">Doc: {r.documento}</p>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-semibold text-green-600">
                                {formatearMoneda(r.totalGanado)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="font-semibold text-orange-600">
                                {formatearMoneda(r.totalAdelantado)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`font-bold ${
                                  r.saldoPendiente >= 0
                                    ? 'text-blue-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {formatearMoneda(r.saldoPendiente)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal eliminar */}
      {eliminarId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Eliminar Adelanto</h3>
              <button
                onClick={() => setEliminarId(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este adelanto? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setEliminarId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
