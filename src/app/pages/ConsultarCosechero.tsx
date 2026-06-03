import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Search,
  Loader2,
  User,
  Scale,
  DollarSign,
  AlertCircle,
  Calendar,
  Clock,
  Wallet,
  TrendingDown,
  CheckCircle2,
  X,
  QrCode,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { verificarPassword, hashPassword } from '../../utils/passwordUtils';
import { cosechemrosService } from '../../services/cosecheros.service';
import type { Database } from '../../utils/supabase/types';

type Cosechero = Database['public']['Tables']['cosecheros']['Row'];
type Pesaje = Database['public']['Tables']['pesajes']['Row'];
type Adelanto = Database['public']['Tables']['adelantos']['Row'];

interface DatosCosechero {
  info: Cosechero;
  pesajes: (Pesaje & { fecha_formateada: string; hora: string })[];
  adelantos: (Adelanto & { fecha_formateada: string })[];
  totalGanado: number;
  totalAdelantado: number;
  saldoPendiente: number;
}

type Paso = 'login' | 'primer-ingreso' | 'datos';

const URL_CONSULTA = typeof window !== 'undefined' 
  ? `${window.location.origin}/consultar-cosechero`
  : '';

export default function ConsultarCosechero() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState<Paso>('login');
  const [documento, setDocumento] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showNuevaPassword, setShowNuevaPassword] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');
  const [cosecheroId, setCosecheroId] = useState<string | null>(null);
  const [datos, setDatos] = useState<DatosCosechero | null>(null);

  const formatearMoneda = (valor: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!documento.trim() || !password) {
      setError('Ingresa tu documento y contraseña.');
      return;
    }

    setBuscando(true);

    try {
      const { data: cosechero, error: err } = await supabase
        .from('cosecheros')
        .select('*')
        .eq('documento', documento.trim())
        .single();

      if (err || !cosechero) {
        setError('No se encontró un cosechero con ese documento.');
        setBuscando(false);
        return;
      }

      if (cosechero.primer_ingreso || !cosechero.password_hash) {
        setCosecheroId(cosechero.id);
        setPaso('primer-ingreso');
        setBuscando(false);
        return;
      }

      const valida = await verificarPassword(password, cosechero.password_hash);
      if (!valida) {
        setError('Contraseña incorrecta.');
        setBuscando(false);
        return;
      }

      await cargarDatos(cosechero.id);
    } catch {
      setError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setBuscando(false);
    }
  };

  const handlePrimerIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (nuevaPassword.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!cosecheroId) return;

    setBuscando(true);

    try {
      await cosechemrosService.setPassword(cosecheroId, nuevaPassword);
      await cargarDatos(cosecheroId);
    } catch {
      setError('Error al guardar la contraseña. Intenta nuevamente.');
    } finally {
      setBuscando(false);
    }
  };

  const cargarDatos = async (id: string) => {
    try {
      const [pesajesData, adelantosData] = await Promise.all([
        supabase
          .from('pesajes')
          .select('*')
          .eq('cosechero_id', id)
          .order('fecha_pesaje', { ascending: false }),
        supabase
          .from('adelantos')
          .select('*')
          .eq('cosechero_id', id)
          .order('fecha_adelanto', { ascending: false }),
      ]);

      const { data: info } = await supabase
        .from('cosecheros')
        .select('*')
        .eq('id', id)
        .single();

      if (!info) return;

      const pesajes = (pesajesData.data || []).map((p) => ({
        ...p,
        fecha_formateada: new Date(p.fecha_pesaje).toLocaleDateString('es-CO'),
        hora: new Date(p.fecha_pesaje).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      }));

      const adelantos = (adelantosData.data || []).map((a) => ({
        ...a,
        fecha_formateada: new Date(a.fecha_adelanto).toLocaleDateString('es-CO'),
      }));

      const totalGanado = pesajes.reduce((s, p) => s + Number(p.total_pagar), 0);
      const totalAdelantado = adelantos.reduce((s, a) => s + Number(a.monto), 0);

      setDatos({
        info: info as Cosechero,
        pesajes,
        adelantos,
        totalGanado,
        totalAdelantado,
        saldoPendiente: totalGanado - totalAdelantado,
      });

      setPaso('datos');
    } catch {
      setError('Error al cargar los datos.');
    }
  };

  const reiniciar = () => {
    setPaso('login');
    setDocumento('');
    setPassword('');
    setNuevaPassword('');
    setConfirmarPassword('');
    setCosecheroId(null);
    setDatos(null);
    setError('');
  };

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
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Portal del Cosechero</h1>
                <p className="text-sm text-gray-600">Consulta tus pesajes y saldos</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {paso === 'login' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Formulario de login */}
            <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Ingresa al portal</h2>
                <p className="text-gray-500 mt-1">Usa tu documento y contraseña</p>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Documento</label>
                  <input
                    type="text"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    autoComplete="off"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="Tu cédula"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all pr-12"
                      placeholder="Tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    ¿Primera vez? Solo ingresa tu documento y presiona "Entrar".
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={buscando}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buscando ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</>
                  ) : (
                    <><KeyRound className="w-5 h-5" /> Entrar</>
                  )}
                </button>
              </form>
            </div>

            {/* QR Code */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center sticky top-6">
                <div className="flex items-center gap-2 justify-center mb-4">
                  <QrCode className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Escanea para acceder</h3>
                </div>
                <div className="bg-white p-4 rounded-lg inline-block mx-auto border border-gray-200">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(URL_CONSULTA)}`}
                    alt="QR Code para acceder al portal"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Abre la cámara de tu celular y escanea el código para ingresar directamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {paso === 'primer-ingreso' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Crea tu contraseña</h2>
                <p className="text-gray-500 mt-1">Es la primera vez que ingresas. Establece una contraseña segura.</p>
              </div>

              {error && (
                <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handlePrimerIngreso} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                  <div className="relative">
                    <input
                      type={showNuevaPassword ? 'text' : 'password'}
                      value={nuevaPassword}
                      onChange={(e) => setNuevaPassword(e.target.value)}
                      required
                      minLength={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all pr-12"
                      placeholder="Mínimo 4 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNuevaPassword(!showNuevaPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNuevaPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    required
                    minLength={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="Repite la contraseña"
                  />
                </div>
                <button
                  type="submit"
                  disabled={buscando}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buscando ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" /> Crear Contraseña</>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {paso === 'datos' && datos && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{datos.info.nombre}</h2>
                  <p className="text-gray-500">Doc: {datos.info.documento}</p>
                  {datos.info.telefono && <p className="text-sm text-gray-400">Tel: {datos.info.telefono}</p>}
                </div>
                <button
                  onClick={reiniciar}
                  className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <Scale className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-green-600 font-medium uppercase">Total Ganado</p>
                <p className="text-2xl font-bold text-green-900">{formatearMoneda(datos.totalGanado)}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center">
                <TrendingDown className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-xs text-orange-600 font-medium uppercase">Adelantos</p>
                <p className="text-2xl font-bold text-orange-900">{formatearMoneda(datos.totalAdelantado)}</p>
              </div>
              <div className={`rounded-xl p-5 text-center border ${datos.saldoPendiente >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                {datos.saldoPendiente >= 0
                  ? <CheckCircle2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  : <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />}
                <p className={`text-xs font-medium uppercase ${datos.saldoPendiente >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  Saldo Pendiente
                </p>
                <p className={`text-2xl font-bold ${datos.saldoPendiente >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                  {formatearMoneda(Math.abs(datos.saldoPendiente))}
                </p>
                <p className={`text-xs mt-1 ${datos.saldoPendiente >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                  {datos.saldoPendiente >= 0 ? 'Saldo a favor' : 'Saldo en contra'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                <Scale className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Historial de Pesajes</h3>
              </div>
              {datos.pesajes.length === 0 ? (
                <p className="text-center py-6 text-gray-500">No tienes pesajes registrados</p>
              ) : (
                <div className="space-y-3">
                  {datos.pesajes.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.fecha_formateada}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {p.hora}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{p.kilos_neto} kg</p>
                        <p className="text-sm font-semibold text-green-600">{formatearMoneda(p.total_pagar)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                <Wallet className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-bold text-gray-900">Adelantos de Saldo</h3>
              </div>
              {datos.adelantos.length === 0 ? (
                <p className="text-center py-6 text-gray-500">No tienes adelantos registrados</p>
              ) : (
                <div className="space-y-3">
                  {datos.adelantos.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-orange-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{a.fecha_formateada}</p>
                          {a.nota && <p className="text-xs text-gray-500">{a.nota}</p>}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-orange-700">{formatearMoneda(a.monto)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center">
              <button onClick={reiniciar} className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
