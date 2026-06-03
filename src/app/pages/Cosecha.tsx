import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, Scale, Search, Calendar, Clock, Sprout, Loader2, Trash2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCosecha } from '../../hooks/useCosecha';
import { precioConfig } from '../../utils/precioConfig';
import type { Database } from '../../utils/supabase/types';

type Cosechero = Database['public']['Tables']['cosecheros']['Row'];

export default function Cosecha() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { cosecheros, historial, loading, error, buscarCosechero, registrarPesaje, eliminarPesaje, resetCosecheros, reloadData } = useCosecha();

  const [busquedaCosechero, setBusquedaCosechero] = useState('');
  const [cosecheroSeleccionado, setCosecheroSeleccionado] = useState<Cosechero | null>(null);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [kilos, setKilos] = useState('');
  const [precioPorKilo, setPrecioPorKilo] = useState(precioConfig.getPrecio().toString());
  const [descuento, setDescuento] = useState('0');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [pesajeAEliminar, setPesajeAEliminar] = useState<string | null>(null);

  const handleBusqueda = (value: string) => {
    setBusquedaCosechero(value);
    setMostrarSugerencias(true);
    if (!value) {
      setCosecheroSeleccionado(null);
      resetCosecheros();
    } else {
      buscarCosechero(value);
    }
  };

  const seleccionarCosechero = (cosechero: Cosechero) => {
    setCosecheroSeleccionado(cosechero);
    setBusquedaCosechero(cosechero.nombre);
    setMostrarSugerencias(false);
  };

  const calcularTotal = () => {
    const k = parseFloat(kilos) || 0;
    const precio = parseFloat(precioPorKilo) || 0;
    const desc = parseFloat(descuento) || 0;
    return (k * precio) - desc;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');

    if (!cosecheroSeleccionado) {
      setSaveError('Por favor selecciona un cosechero');
      return;
    }

    if (!kilos || parseFloat(kilos) <= 0) {
      setSaveError('Ingresa una cantidad válida de kilos');
      return;
    }

    const k = parseFloat(kilos);
    const precio = parseFloat(precioPorKilo);
    const desc = parseFloat(descuento) || 0;
    const total = calcularTotal();

    if (total < 0) {
      setSaveError('El descuento no puede ser mayor al total a pagar');
      return;
    }

    const result = await registrarPesaje({
      cosechero_id: cosecheroSeleccionado.id,
      kilos_bruto: k,
      descuento: desc,
      kilos_neto: k,
      precio_kilo: precio,
      total_pagar: total,
    });

    setSaving(false);

    if (result.success) {
      setBusquedaCosechero('');
      setCosecheroSeleccionado(null);
      setKilos('');
      setDescuento('0');
      reloadData();
    } else {
      setSaveError(result.error || 'Error al registrar el pesaje');
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(valor);
  };

  const confirmarEliminacion = (pesajeId: string) => {
    setPesajeAEliminar(pesajeId);
  };

  const cancelarEliminacion = () => {
    setPesajeAEliminar(null);
  };

  const handleEliminar = async () => {
    if (!pesajeAEliminar) return;
    const result = await eliminarPesaje(pesajeAEliminar);
    if (result.success) {
      setPesajeAEliminar(null);
    } else {
      setSaveError(result.error || 'Error al eliminar el pesaje');
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
                onClick={() => navigate(isAdmin ? '/dashboard' : '/ayudante')}
                className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cosecha</h1>
                <p className="text-sm text-gray-600">Registro de pesajes y pagos</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Cargando datos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Formulario de Pesaje */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
                  <Scale className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Nuevo Pesaje</h2>
                </div>

                {saveError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    {saveError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Buscar Cosechero */}
                  <div className="relative">
                    <label htmlFor="cosechero" className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar Cosechero:
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="cosechero"
                        type="text"
                        autoComplete="off"
                        value={busquedaCosechero}
                        onChange={(e) => handleBusqueda(e.target.value)}
                        onFocus={() => setMostrarSugerencias(true)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                        placeholder="Nombre o documento..."
                      />
                    </div>

                    {/* Sugerencias de cosecheros */}
                    {mostrarSugerencias && busquedaCosechero && cosecheros.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {cosecheros.map(cosechero => (
                          <button
                            key={cosechero.id}
                            type="button"
                            onClick={() => seleccionarCosechero(cosechero)}
                            className="w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <div className="font-medium text-gray-900">{cosechero.nombre}</div>
                            <div className="text-sm text-gray-600">Doc: {cosechero.documento}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {mostrarSugerencias && busquedaCosechero && cosecheros.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                        No se encontraron cosecheros
                      </div>
                    )}
                  </div>

                  {/* Cosechero Seleccionado */}
                  {cosecheroSeleccionado && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-sm text-green-700 font-medium">
                        Cosechero seleccionado:
                      </div>
                      <div className="text-green-900 font-semibold">
                        {cosecheroSeleccionado.nombre}
                      </div>
                    </div>
                  )}

                  {/* Kilos */}
                  <div>
                    <label htmlFor="kilos" className="block text-sm font-medium text-gray-700 mb-2">
                      Kilos Recolectados:
                    </label>
                    <input
                      id="kilos"
                      type="number"
                      step="0.1"
                      value={kilos}
                      onChange={(e) => setKilos(e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      placeholder="0.0"
                    />
                  </div>

                  {/* Precio por Kilo */}
                  <div>
                    <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
                      Precio por Kilo:
                      <span className="text-xs text-gray-400 font-normal ml-1">(predeterminado)</span>
                    </label>
                    <input
                      id="precio"
                      type="number"
                      step="100"
                      value={precioPorKilo}
                      onChange={(e) => setPrecioPorKilo(e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      placeholder="2500"
                    />
                  </div>

                  {/* Descuento */}
                  <div>
                    <label htmlFor="descuento" className="block text-sm font-medium text-gray-700 mb-2">
                      Descuento / Saldo:
                    </label>
                    <input
                      id="descuento"
                      type="number"
                      step="100"
                      value={descuento}
                      onChange={(e) => setDescuento(e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      placeholder="0"
                    />
                  </div>

                  {/* Total a Pagar */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total a Pagar:</div>
                    <div className="text-3xl font-bold text-green-600">
                      {formatearMoneda(calcularTotal())}
                    </div>
                    {kilos && (
                      <div className="text-xs text-gray-500 mt-2">
                        {kilos} kg × {formatearMoneda(parseFloat(precioPorKilo))} 
                        {parseFloat(descuento) > 0 && ` - ${formatearMoneda(parseFloat(descuento))}`}
                      </div>
                    )}
                  </div>

                  {/* Botón Guardar */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Registrar Pesaje
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Historial de Pesajes */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Historial de Pesajes</h2>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    {error}
                  </div>
                )}

                {historial.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No hay pesajes registrados
                  </div>
                ) : (
                  <div className="space-y-6">
                    {historial.map(grupo => (
                      <div key={grupo.fecha}>
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <h3 className="font-semibold text-gray-900 capitalize">
                            {grupo.fecha}
                          </h3>
                        </div>

                        <div className="space-y-3">
                          {grupo.pesajes.map(pesaje => (
                            <div
                              key={pesaje.id}
                              className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors relative"
                            >
                              <button
                                type="button"
                                onClick={() => confirmarEliminacion(pesaje.id)}
                                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar pesaje"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              <div className="flex items-start justify-between mb-2 pr-10">
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {pesaje.cosechero_nombre || 'Cosechero'}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                    <Clock className="w-4 h-4" />
                                    {new Date(pesaje.fecha_pesaje).toLocaleTimeString('es-CO')}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-green-600">
                                    {formatearMoneda(pesaje.total_pagar)}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-300">
                                <div>
                                  <div className="text-xs text-gray-600">Kilos</div>
                                  <div className="font-semibold text-gray-900">{pesaje.kilos_neto} kg</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-600">Precio/kg</div>
                                  <div className="font-semibold text-gray-900">
                                    {formatearMoneda(pesaje.precio_kilo)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-600">Descuento</div>
                                  <div className="font-semibold text-gray-900">
                                    {formatearMoneda(pesaje.descuento)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Totales del día */}
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-green-700">
                              Total del día:
                            </span>
                            <span className="text-lg font-bold text-green-900">
                              {formatearMoneda(grupo.totalPagar)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-green-600">
                              Kilos totales:
                            </span>
                            <span className="text-sm font-semibold text-green-800">
                              {grupo.totalKilos.toFixed(1)} kg
                            </span>
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
      </main>

      {/* Modal de confirmación para eliminar */}
      {pesajeAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Eliminar Pesaje</h3>
              <button
                onClick={cancelarEliminacion}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este pesaje? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelarEliminacion}
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
