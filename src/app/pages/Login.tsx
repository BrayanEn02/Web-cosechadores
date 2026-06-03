import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Eye, EyeOff, Sprout, AlertCircle } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { supabase } from '../../utils/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se pudo obtener el usuario');

      let { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!userData) {
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert({
            id: user.id,
            email: user.email || '',
            nombre: user.email?.split('@')[0] || 'Usuario',
            rol: 'usuario',
          });

        if (insertError) {
          console.error('Error al crear usuario en tabla:', insertError);
          setError('Error al configurar tu cuenta. Contacta al administrador.');
          return;
        }
        userData = { id: user.id, email: user.email || '', nombre: user.email?.split('@')[0] || 'Usuario', rol: 'usuario' as const };
      }

      const rol = userData.rol;
      const aceptoTratamientoDatos = userData.acepto_tratamiento_datos ?? false;

      login({
        id: user.id,
        email: user.email || '',
        nombre: userData?.nombre || '',
        rol,
        aceptoTratamientoDatos,
      });

      if (!aceptoTratamientoDatos) {
        navigate('/tratamiento-datos');
        return;
      }

      if (rol === 'ayudante') {
        navigate('/ayudante');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Error en login:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Por favor confirma tu email antes de iniciar sesión.');
      } else {
        setError('Error al iniciar sesión. Por favor intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1765990604870-fffd6d5f3961?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBjb2ZmZWUlMjBjaGVycmllcyUyMHJpcGUlMjBoYXJ2ZXN0fGVufDF8fHx8MTc3Mjg2Mzg3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Cerezas de café maduras listas para cosechar"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/40 to-gray-800/20"></div>
        <div className="absolute bottom-12 left-12 text-white max-w-md">
          <h2 className="text-4xl font-bold mb-4">Plataforma digital para cosechas.</h2>
          <p className="text-lg opacity-90">
            Diseñada para facilitar la gestión de la recolección y optimizar el tiempo de los administradores..
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal de Gestión</h1>
            <p className="text-gray-600">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                placeholder="tu@email.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Regístrate aquí
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Al iniciar sesión, aceptas nuestros Términos de Servicio y Política de Privacidad
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
