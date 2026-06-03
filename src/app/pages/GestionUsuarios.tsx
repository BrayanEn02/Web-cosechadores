import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Search,
  RefreshCw,
  UserPlus,
  X,
  Mail,
  User,
  Shield,
  KeyRound,
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  created_at: string;
}

export default function GestionUsuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [buscando, setBuscando] = useState('');
  const [editandoRol, setEditandoRol] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [nuevoRol, setNuevoRol] = useState('ayudante');
  const [creando, setCreando] = useState(false);
  const [cambiandoPass, setCambiandoPass] = useState<string | null>(null);
  const [nuevaPass, setNuevaPass] = useState('');
  const [guardandoPass, setGuardandoPass] = useState(false);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: err } = await supabase
        .from('usuarios')
        .select('*')
        .order('nombre', { ascending: true });

      if (err) throw err;
      setUsuarios(data || []);
    } catch {
      setError('Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarRol = async (id: string, nuevoRol: string) => {
    try {
      const { error: err } = await supabase
        .from('usuarios')
        .update({ rol: nuevoRol })
        .eq('id', id);

      if (err) throw err;
      setExito('Rol actualizado correctamente.');
      setEditandoRol(null);
      loadUsuarios();
    } catch {
      setError('Error al actualizar el rol.');
    }
  };

  const handleCambiarPass = async () => {
    if (!cambiandoPass || !nuevaPass || nuevaPass.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setGuardandoPass(true);
    setError('');
    try {
      const { error: rpcError } = await supabase.rpc('cambiar_contrasena_usuario', {
        p_user_id: cambiandoPass,
        p_nueva_password: nuevaPass,
      });
      if (rpcError) throw rpcError;
      setExito('Contraseña actualizada correctamente.');
      setCambiandoPass(null);
      setNuevaPass('');
    } catch (err: any) {
      setError(err.message || 'Error al cambiar contraseña.');
    } finally {
      setGuardandoPass(false);
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreando(true);
    setError('');

    try {
      // Try inserting into public.usuarios via RPC first (handles already-registered users)
      const { data: rpcResult, error: rpcError } = await supabase.rpc('vincular_usuario', {
        p_email: nuevoEmail,
        p_nombre: nuevoNombre,
        p_rol: nuevoRol,
      });

      if (rpcResult === true) {
        setExito(`Usuario ${nuevoEmail} vinculado como "${nuevoRol === 'admin' ? 'Administrador' : 'Ayudante'}".`);
        setShowModal(false);
        setNuevoEmail('');
        setNuevoNombre('');
        setNuevoPassword('');
        setNuevoRol('ayudante');
        loadUsuarios();
        return;
      }

      // User doesn't exist in auth yet — create via signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: nuevoEmail,
        password: nuevoPassword,
        options: { emailRedirectTo: window.location.origin },
      });

      if (authError) {
        if (authError.message?.includes('rate_limit') || authError.message?.includes('rate limit')) {
          throw new Error(
            'Límite de creación de usuarios alcanzado. Ve a Supabase > Authentication > Settings y desactiva "Confirm email", o espera 1 minuto e intenta de nuevo.'
          );
        }
        if (authError.message?.includes('already registered') || authError.message?.includes('User already')) {
          throw new Error(
            'El usuario ya existe en autenticación pero no se pudo vincular. Ejecuta este SQL en Supabase:\n\n' +
            'SELECT vincular_usuario(\'' + nuevoEmail + '\', \'' + nuevoNombre + '\', \'' + nuevoRol + '\');'
          );
        }
        throw authError;
      }

      if (!authData.user) throw new Error('No se pudo crear el usuario en autenticación.');

      const { error: insertError } = await supabase.from('usuarios').insert({
        id: authData.user.id,
        email: nuevoEmail,
        nombre: nuevoNombre,
        rol: nuevoRol,
      });

      if (insertError) throw new Error('Usuario creado en auth pero error al guardar en usuarios: ' + insertError.message);

      setExito(`Usuario ${nuevoEmail} creado como "${nuevoRol === 'admin' ? 'Administrador' : 'Ayudante'}".`);
      setShowModal(false);
      setNuevoEmail('');
      setNuevoNombre('');
      setNuevoPassword('');
      setNuevoRol('ayudante');
      loadUsuarios();
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario.');
    } finally {
      setCreando(false);
    }
  };

  const usuariosFiltrados = buscando
    ? usuarios.filter((u) =>
        u.nombre.toLowerCase().includes(buscando.toLowerCase()) ||
        u.email.toLowerCase().includes(buscando.toLowerCase())
      )
    : usuarios;

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
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-sm text-gray-600">Administra los usuarios del sistema</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Usuario
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={buscando}
                onChange={(e) => setBuscando(e.target.value)}
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="Buscar por nombre o email..."
              />
            </div>
            <button onClick={loadUsuarios} className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Nombre</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Rol</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{u.nombre}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {u.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {editandoRol === u.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <select
                            defaultValue={u.rol}
                            onChange={(e) => handleCambiarRol(u.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                          >
                            <option value="admin">Administrador</option>
                            <option value="ayudante">Ayudante</option>
                          </select>
                          <button
                            onClick={() => setEditandoRol(null)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.rol === 'admin'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {u.rol === 'admin' ? 'Administrador' : 'Ayudante'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {editandoRol !== u.id && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setCambiandoPass(u.id); setNuevaPass(''); setError(''); }}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 font-medium"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            Contraseña
                          </button>
                          <button
                            onClick={() => setEditandoRol(u.id)}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            Cambiar Rol
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
              <span className="font-medium">{usuariosFiltrados.length}</span> usuario(s)
              {buscando && ` (filtrados de ${usuarios.length})`}
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Crear Nuevo Usuario</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={nuevoPassword}
                  onChange={(e) => setNuevoPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select
                  value={nuevoRol}
                  onChange={(e) => setNuevoRol(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                >
                  <option value="ayudante">Ayudante</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={creando}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {creando ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Crear Usuario</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {cambiandoPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Cambiar Contraseña</h3>
              <button onClick={() => { setCambiandoPass(null); setNuevaPass(''); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <input
                  type="password"
                  value={nuevaPass}
                  onChange={(e) => setNuevaPass(e.target.value)}
                  minLength={6}
                  autoFocus
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <button
                onClick={handleCambiarPass}
                disabled={guardandoPass || !nuevaPass || nuevaPass.length < 6}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {guardandoPass ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                ) : (
                  <><KeyRound className="w-4 h-4" /> Cambiar Contraseña</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
