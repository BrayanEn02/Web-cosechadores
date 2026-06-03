import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Calendar,
  Users,
  Scale,
  DollarSign,
  TrendingUp,
  Filter,
  X,
  Loader2,
  Clock,
} from 'lucide-react';
import { useReportes } from '../../hooks/useReportes';

export default function Reportes() {
  const navigate = useNavigate();
  const {
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
  } = useReportes();

  const [vistaActiva, setVistaActiva] = useState<'general' | 'detalle' | 'porPersona'>('general');
  const [expandirPersona, setExpandirPersona] = useState<string | null>(null);

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const tieneFiltros = filtroCosechero || filtroFechaInicio || filtroFechaFin;

  const pesajesDePersona = expandirPersona
    ? pesajes.filter((p) => p.cosechero_id === expandirPersona)
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
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
                <p className="text-sm text-gray-600">Estadísticas y análisis de cosecha</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cosechero
              </label>
              <select
                value={filtroCosechero}
                onChange={(e) => setFiltroCosechero(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Todos los cosecheros</option>
                {cosecheros.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha inicio
              </label>
              <input
                type="date"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha fin
              </label>
              <input
                type="date"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-end">
              {tieneFiltros && (
                <button
                  onClick={limpiarFiltros}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Cargando reportes...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {/* Tarjetas resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Scale className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">Total Kilos</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{resumen.totalKilos.toFixed(1)} kg</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">Total Pagado</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatearMoneda(resumen.totalPagado)}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">Nº Pesajes</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{resumen.numeroPesajes}</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-600">Promedio kg/pesaje</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{resumen.promedioKilos.toFixed(1)} kg</p>
              </div>
            </div>

            {/* Tabs de vista */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => {
                    setVistaActiva('general');
                    setExpandirPersona(null);
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    vistaActiva === 'general'
                      ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Vista General
                </button>
                <button
                  onClick={() => {
                    setVistaActiva('porPersona');
                    setExpandirPersona(null);
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    vistaActiva === 'porPersona'
                      ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Por Persona
                </button>
                <button
                  onClick={() => {
                    setVistaActiva('detalle');
                    setExpandirPersona(null);
                  }}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    vistaActiva === 'detalle'
                      ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Detalle Completo
                </button>
              </div>

              <div className="p-6">
                {/* Vista General - Top cosecheros */}
                {vistaActiva === 'general' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Top Cosecheros por Kilos Recolectados
                    </h3>
                    {resumenPorCosechero.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No hay datos disponibles</p>
                    ) : (
                      <div className="space-y-3">
                        {resumenPorCosechero.map((c, i) => (
                          <div
                            key={c.cosechero_id}
                            className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
                          >
                            <div
                              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                i === 0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : i === 1
                                  ? 'bg-gray-200 text-gray-700'
                                  : i === 2
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{c.nombre}</p>
                              <p className="text-sm text-gray-500">Doc: {c.documento}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{c.totalKilos.toFixed(1)} kg</p>
                              <p className="text-sm text-gray-500">{c.numeroPesajes} pesajes</p>
                              <p className="text-sm text-green-600 font-medium">
                                {formatearMoneda(c.totalPagado)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Vista Por Persona */}
                {vistaActiva === 'porPersona' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Resumen por Cosechero
                    </h3>
                    {resumenPorCosechero.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No hay datos disponibles</p>
                    ) : (
                      <div className="space-y-4">
                        {resumenPorCosechero.map((c) => (
                          <div
                            key={c.cosechero_id}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() =>
                                setExpandirPersona(
                                  expandirPersona === c.cosechero_id ? null : c.cosechero_id
                                )
                              }
                              className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                                <Users className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{c.nombre}</p>
                                <p className="text-sm text-gray-500">Doc: {c.documento}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">{c.totalKilos.toFixed(1)} kg</p>
                                <p className="text-sm text-green-600 font-medium">
                                  {formatearMoneda(c.totalPagado)}
                                </p>
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform ${
                                  expandirPersona === c.cosechero_id ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>

                            {expandirPersona === c.cosechero_id && (
                              <div className="p-4 border-t border-gray-200">
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                  <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-green-600">Total Kilos</p>
                                    <p className="text-lg font-bold text-green-900">
                                      {c.totalKilos.toFixed(1)} kg
                                    </p>
                                  </div>
                                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-blue-600">Total Pagado</p>
                                    <p className="text-lg font-bold text-blue-900">
                                      {formatearMoneda(c.totalPagado)}
                                    </p>
                                  </div>
                                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-purple-600">Nº Pesajes</p>
                                    <p className="text-lg font-bold text-purple-900">
                                      {c.numeroPesajes}
                                    </p>
                                  </div>
                                </div>

                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                  Historial de pesajes
                                </h4>
                                {pesajesDePersona.length === 0 ? (
                                  <p className="text-sm text-gray-500">Sin pesajes</p>
                                ) : (
                                  <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {pesajesDePersona.map((p) => (
                                      <div
                                        key={p.id}
                                        className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg text-sm"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-4 h-4 text-gray-400" />
                                          <span>
                                            {new Date(p.fecha_pesaje).toLocaleDateString('es-CO')}{' '}
                                            {new Date(p.fecha_pesaje).toLocaleTimeString('es-CO', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            })}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <span className="font-medium">{p.kilos_neto} kg</span>
                                          <span className="font-semibold text-green-600">
                                            {formatearMoneda(p.total_pagar)}
                                          </span>
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
                    )}
                  </div>
                )}

                {/* Vista Detalle Completo */}
                {vistaActiva === 'detalle' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        Todos los Pesajes
                      </h3>
                      {pesajes.length > 0 && (
                        <span className="text-sm text-gray-500">
                          {pesajes.length} registro(s)
                        </span>
                      )}
                    </div>

                    {pesajes.length === 0 ? (
                      <p className="text-center py-8 text-gray-500">No hay pesajes registrados</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                                Cosechero
                              </th>
                              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                                Documento
                              </th>
                              <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                                Fecha
                              </th>
                              <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                                Kilos Neto
                              </th>
                              <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                                Precio/kg
                              </th>
                              <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                                Descuento
                              </th>
                              <th className="text-right py-3 px-3 text-xs font-semibold text-gray-600 uppercase">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pesajes.map((p) => (
                              <tr
                                key={p.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                              >
                                <td className="py-3 px-3 text-sm font-medium text-gray-900">
                                  {p.cosechero_nombre || '-'}
                                </td>
                                <td className="py-3 px-3 text-sm text-gray-600">
                                  {p.cosechero_documento || '-'}
                                </td>
                                <td className="py-3 px-3 text-sm text-gray-600">
                                  {new Date(p.fecha_pesaje).toLocaleDateString('es-CO')}{' '}
                                  {new Date(p.fecha_pesaje).toLocaleTimeString('es-CO', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </td>
                                <td className="py-3 px-3 text-sm text-right font-medium text-gray-900">
                                  {p.kilos_neto} kg
                                </td>
                                <td className="py-3 px-3 text-sm text-right text-gray-600">
                                  {formatearMoneda(p.precio_kilo)}
                                </td>
                                <td className="py-3 px-3 text-sm text-right text-gray-600">
                                  {formatearMoneda(p.descuento)}
                                </td>
                                <td className="py-3 px-3 text-sm text-right font-bold text-green-600">
                                  {formatearMoneda(p.total_pagar)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
