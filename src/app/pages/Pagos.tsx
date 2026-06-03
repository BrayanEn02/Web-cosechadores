import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  CreditCard,
  Search,
  Loader2,
  X,
  DollarSign,
  Scale,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Clock,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { usePagos } from '../../hooks/usePagos';

export default function Pagos() {
  const navigate = useNavigate();
  const {
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
  } = usePagos();

  const [vistaActiva, setVistaActiva] = useState<'pagos' | 'historial'>('pagos');
  const [cosecheroPago, setCosecheroPago] = useState<string | null>(null);
  const [montoPago, setMontoPago] = useState('');
  const [notaPago, setNotaPago] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [eliminarId, setEliminarId] = useState<string | null>(null);
  const [expandirPagos, setExpandirPagos] = useState<string | null>(null);

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const handleRegistrarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');

    if (!cosecheroPago) {
      setSaveError('Selecciona un cosechero');
      return;
    }

    if (!montoPago || parseFloat(montoPago) <= 0) {
      setSaveError('Ingresa un monto válido');
      return;
    }

    setSaving(true);

    const result = await registrarPago({
      cosechero_id: cosecheroPago,
      monto: parseFloat(montoPago),
      nota: notaPago.trim() || undefined,
    });

    setSaving(false);

    if (result.success) {
      setCosecheroPago(null);
      setMontoPago('');
      setNotaPago('');
    } else {
      setSaveError(result.error);
    }
  };

  const handleEliminar = async () => {
    if (!eliminarId) return;
    const result = await eliminarPago(eliminarId);
    if (result.success) setEliminarId(null);
  };

  const cosecheroSeleccionado = resumen.find((r) => r.cosechero_id === cosecheroPago);
  const pagosDelCosechero = expandirPagos
    ? historialPagos.filter((p) => p.cosechero_id === expandirPagos)
    : [];

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
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Pagos</h1>
                <p className="text-sm text-gray-600">Gestión de pagos a cosecheros</p>
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
                  onClick={() => setVistaActiva('pagos')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    vistaActiva === 'pagos'
                      ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Gestionar Pagos
                </button>
                <button
                  onClick={() => setVistaActiva('historial')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    vistaActiva === 'historial'
                      ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Historial de Pagos
                </button>
              </div>
            </div>

            {vistaActiva === 'pagos' && (
              <>
                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value as 'todos' | 'pendiente' | 'pagado')}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                      >
                        <option value="todos">Todos</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="pagado">Pagados</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cosechero</label>
                      <select
                        value={filtroCosechero}
                        onChange={(e) => setFiltroCosechero(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                      >
                        <option value="">Todos</option>
                        {cosecheros.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end gap-3">
                      {(filtroEstado !== 'todos' || filtroCosechero) && (
                        <button
                          onClick={() => {
                            setFiltroEstado('todos');
                            setFiltroCosechero('');
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Limpiar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lista de cosecheros */}
                {resumen.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Scale className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No hay cosecheros con pesajes registrados</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-4">
                      {resumen.map((r) => (
                        <div
                          key={r.cosechero_id}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                          {/* Cabecera del cosechero */}
                          <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-lg ${
                                    r.estado === 'pagado'
                                      ? 'bg-green-100'
                                      : 'bg-orange-100'
                                  }`}
                                >
                                  {r.estado === 'pagado' ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <AlertCircle className="w-5 h-5 text-orange-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{r.nombre}</p>
                                  <p className="text-sm text-gray-500">Doc: {r.documento}</p>
                                </div>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  r.estado === 'pagado'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {r.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                              </span>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Kilos</p>
                              <p className="font-bold text-gray-900">{r.totalKilos.toFixed(1)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Ganado</p>
                              <p className="font-bold text-green-600">{formatearMoneda(r.totalGanado)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Adelantado</p>
                              <p className="font-bold text-orange-600">{formatearMoneda(r.totalAdelantado)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Saldo</p>
                              <p
                                className={`font-bold ${
                                  r.saldoPendiente > 0 ? 'text-red-600' : 'text-green-600'
                                }`}
                              >
                                {formatearMoneda(r.saldoPendiente)}
                              </p>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="p-4 border-t border-gray-100 flex items-center gap-3">
                            {r.saldoPendiente > 0 ? (
                              <button
                                onClick={() => {
                                  setCosecheroPago(r.cosechero_id);
                                  setMontoPago(r.saldoPendiente.toString());
                                  setExpandirPagos(r.cosechero_id);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                <DollarSign className="w-4 h-4" />
                                Pagar
                              </button>
                            ) : (
                              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                Todo pagado
                              </span>
                            )}
                            <button
                              onClick={() =>
                                setExpandirPagos(expandirPagos === r.cosechero_id ? null : r.cosechero_id)
                              }
                              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 ml-auto"
                            >
                              <span>Ver pagos ({r.totalPagado > 0 ? historialPagos.filter(p => p.cosechero_id === r.cosechero_id).length : 0})</span>
                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  expandirPagos === r.cosechero_id ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                          </div>

                          {/* Historial de pagos del cosechero */}
                          {expandirPagos === r.cosechero_id && (
                            <div className="p-4 border-t border-gray-100 bg-gray-50">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                Historial de pagos
                              </h4>
                              {pagosDelCosechero.length === 0 ? (
                                <p className="text-sm text-gray-500">Sin pagos registrados</p>
                              ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {pagosDelCosechero.map((p) => (
                                    <div
                                      key={p.id}
                                      className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span>
                                          {new Date(p.fecha_pago).toLocaleDateString('es-CO')}
                                        </span>
                                        {p.nota && (
                                          <span className="text-gray-400">— {p.nota}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-green-600">
                                          {formatearMoneda(p.monto)}
                                        </span>
                                        <button
                                          onClick={() => setEliminarId(p.id)}
                                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Panel de pago */}
                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
                          <CreditCard className="w-5 h-5 text-green-600" />
                          <h2 className="text-lg font-bold text-gray-900">Registrar Pago</h2>
                        </div>

                        {saveError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                            {saveError}
                          </div>
                        )}

                        {cosecheroPago && cosecheroSeleccionado ? (
                          <form onSubmit={handleRegistrarPago} className="space-y-5">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-sm text-green-700 font-medium">Cosechero:</p>
                              <p className="text-green-900 font-semibold">
                                {cosecheroSeleccionado.nombre}
                              </p>
                              <p className="text-sm text-green-600 mt-1">
                                Saldo pendiente: {formatearMoneda(cosecheroSeleccionado.saldoPendiente)}
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Monto a pagar:
                              </label>
                              <input
                                type="number"
                                step="100"
                                value={montoPago}
                                onChange={(e) => setMontoPago(e.target.value)}
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
                                value={notaPago}
                                onChange={(e) => setNotaPago(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Referencia del pago..."
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
                                  Registrando...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-5 h-5" />
                                  Confirmar Pago
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setCosecheroPago(null);
                                setMontoPago('');
                                setNotaPago('');
                              }}
                              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
                            >
                              Cancelar
                            </button>
                          </form>
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">Selecciona "Pagar" en un cosechero</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Vista Historial */}
            {vistaActiva === 'historial' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Historial de Pagos</h3>
                {historialPagos.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No hay pagos registrados</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                            Cosechero
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                            Documento
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                            Fecha
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                            Nota
                          </th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                            Monto
                          </th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {historialPagos.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                              {p.cosechero_nombre || '-'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {p.cosechero_documento || '-'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(p.fecha_pago).toLocaleDateString('es-CO')}{' '}
                                {new Date(p.fecha_pago).toLocaleTimeString('es-CO', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {p.nota ? (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5" />
                                  {p.nota}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm text-right font-bold text-green-600">
                              {formatearMoneda(p.monto)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setEliminarId(p.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
              <h3 className="text-lg font-bold text-gray-900">Eliminar Pago</h3>
              <button
                onClick={() => setEliminarId(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer.
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
