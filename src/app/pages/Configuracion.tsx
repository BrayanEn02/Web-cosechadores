import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, DollarSign, Check } from 'lucide-react';
import { precioConfig } from '../../utils/precioConfig';

export default function Configuracion() {
  const navigate = useNavigate();
  const [precioActual, setPrecioActual] = useState('');
  const [precioOriginal, setPrecioOriginal] = useState('');
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const precio = precioConfig.getPrecio();
    setPrecioActual(precio.toString());
    setPrecioOriginal(precio.toString());
  }, []);

  const handleGuardar = () => {
    const nuevoPrecio = parseInt(precioActual, 10);
    if (nuevoPrecio > 0) {
      precioConfig.setPrecio(nuevoPrecio);
      setPrecioOriginal(precioActual);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 3000);
    }
  };

  const handleRestaurar = () => {
    const defaultPrecio = precioConfig.getDefault();
    precioConfig.setPrecio(defaultPrecio);
    setPrecioActual(defaultPrecio.toString());
    setPrecioOriginal(defaultPrecio.toString());
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <p className="text-sm text-gray-600">Ajustes del sistema</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Precio por Kilo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-3">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Precio por Kilo</h2>
          </div>

          {guardado && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Precio guardado correctamente</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
                Precio predeterminado por kilo:
              </label>
              <input
                id="precio"
                type="number"
                step="100"
                value={precioActual}
                onChange={(e) => setPrecioActual(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="2500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Este precio se usará como valor predeterminado al registrar pesajes.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGuardar}
                disabled={precioActual === precioOriginal || !precioActual || parseInt(precioActual, 10) <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                Guardar Precio
              </button>
              {precioActual !== precioConfig.getDefault().toString() && (
                <button
                  onClick={handleRestaurar}
                  className="px-6 border border-gray-300 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Restaurar ({precioConfig.getDefault()})
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
