import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, Pencil, Sprout, Loader2, AlertCircle, Trash2, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cosechemrosService } from '../../services/cosecheros.service';
import PoliticaTratamientoDatos from '../components/PoliticaTratamientoDatos';
import type { Database } from '../../utils/supabase/types';

type Cosechero = Database['public']['Tables']['cosecheros']['Row'];

export default function RegistrarCosecheros() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [nombre, setNombre] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [estado, setEstado] = useState<'activo' | 'inactivo'>('activo');
  const [cosecheros, setCosecheros] = useState<Cosechero[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [eliminarId, setEliminarId] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [aceptaDatos, setAceptaDatos] = useState(false);
  const [showPolitica, setShowPolitica] = useState(false);

  useEffect(() => {
    loadCosecheros();
  }, []);

  const loadCosecheros = async () => {
    try {
      setLoading(true);
      const data = await cosechemrosService.getAll();
      setCosecheros(data);
    } catch (err: any) {
      console.error('Error cargando cosecheros:', err);
      setError('Error al cargar los cosecheros. Por favor recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingId !== null) {
        await cosechemrosService.update(editingId, { nombre, documento, telefono, estado });
      } else {
        if (!aceptaDatos) {
          throw new Error('Debes aceptar la política de tratamiento de datos personales.');
        }
        await cosechemrosService.create({
          nombre, documento, telefono, estado,
        });
      }

      // Recargar lista
      await loadCosecheros();

      // Limpiar formulario
      setNombre('');
      setDocumento('');
      setTelefono('');
      setEstado('activo');
      setEditingId(null);
      setAceptaDatos(false);
    } catch (err: any) {
      console.error('Error guardando cosechero:', err);
      if (err.message?.includes('duplicate key')) {
        setError('Ya existe un cosechero con ese documento.');
      } else {
        setError('Error al guardar el cosechero. Por favor intenta nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cosechero: Cosechero) => {
    setNombre(cosechero.nombre);
    setDocumento(cosechero.documento);
    setTelefono(cosechero.telefono);
    setEstado(cosechero.estado);
    setEditingId(cosechero.id);
  };

  const handleCancelEdit = () => {
    setNombre('');
    setDocumento('');
    setTelefono('');
    setEstado('activo');
    setEditingId(null);
    setAceptaDatos(false);
  };

  const handleDelete = async () => {
    if (!eliminarId) return;
    setEliminando(true);
    try {
      await cosechemrosService.delete(eliminarId);
      await loadCosecheros();
      setEliminarId(null);
    } catch (err: any) {
      console.error('Error eliminando cosechero:', err);
      setError('Error al eliminar el cosechero. Verifica si tiene pesajes asociados.');
    } finally {
      setEliminando(false);
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
                <h1 className="text-2xl font-bold text-gray-900">Registrar Cosecheros</h1>
                <p className="text-sm text-gray-600">Gestión de cosecheros del sistema</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
              {editingId !== null ? 'Editar Cosechero' : 'Registrar Nuevo Cosechero'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre:
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ingrese el nombre completo"
                />
              </div>

              {/* Documento */}
              <div>
                <label htmlFor="documento" className="block text-sm font-medium text-gray-700 mb-2">
                  Documento:
                </label>
                <input
                  id="documento"
                  type="text"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ingrese el número de documento"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono:
                </label>
                <input
                  id="telefono"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ingrese el teléfono"
                />
              </div>

              {/* Estado */}
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado:
                </label>
                <select
                  id="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value as 'activo' | 'inactivo')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              {/* Aceptación de datos personales */}
              {editingId === null && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm text-amber-800">
                        Al registrar un cosechero, aceptas la{' '}
                        <button
                          type="button"
                          onClick={() => setShowPolitica(true)}
                          className="text-amber-700 underline hover:text-amber-900 font-medium"
                        >
                          Política de Tratamiento de Datos Personales
                        </button>{' '}
                        (Ley 1581 de 2012).
                      </p>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aceptaDatos}
                          onChange={(e) => setAceptaDatos(e.target.checked)}
                          className="mt-0.5 h-4 w-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                        />
                        <span className="text-sm text-amber-800">
                          El cosechero autoriza de manera voluntaria, previa, explícita e informada el tratamiento de sus datos personales (nombre, documento, teléfono) de acuerdo con la política establecida.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar
                    </>
                  )}
                </button>
                {editingId !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de Cosecheros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
              Lista de Cosecheros
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-3" />
                <p className="text-gray-600">Cargando cosecheros...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Documento</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Editar</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cosecheros.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">
                          No hay cosecheros registrados
                        </td>
                      </tr>
                    ) : (
                      cosecheros.map((cosechero) => (
                        <tr key={cosechero.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-900">{cosechero.nombre}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{cosechero.documento}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                cosechero.estado === 'activo'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {cosechero.estado === 'activo' ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleEdit(cosechero)}
                              className="flex items-center gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                              <span className="text-sm font-medium">Editar</span>
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setEliminarId(cosechero.id)}
                              className="flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-sm font-medium">Eliminar</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total de cosecheros:</span>
                  <span className="font-semibold text-gray-900">{cosecheros.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Activos:</span>
                  <span className="font-semibold text-green-600">
                    {cosecheros.filter(c => c.estado === 'activo').length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de confirmación para eliminar */}
      {eliminarId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Eliminar Cosechero</h3>
              <button
                onClick={() => setEliminarId(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-gray-600 mb-2">
              ¿Estás seguro de que deseas eliminar este cosechero?
            </p>
            <p className="text-sm text-red-600 mb-6">
              Nota: Si el cosechero tiene pesajes asociados, no podrá ser eliminado.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setEliminarId(null)}
                disabled={eliminando}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={eliminando}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {eliminando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPolitica && <PoliticaTratamientoDatos onClose={() => setShowPolitica(false)} />}
    </div>
  );
}
