import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Sprout, AlertCircle, CheckCircle2, Loader2, Shield } from 'lucide-react';
import { supabase } from '../../utils/supabase/client';
import { useAuth } from '../../contexts/AuthContext';

export default function TratamientoDatos() {
  const navigate = useNavigate();
  const { user, updateUser, isAdmin, isAyudante } = useAuth();
  const [acepto, setAcepto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAceptar = async () => {
    if (!acepto || !user) return;
    setLoading(true);
    setError('');

    try {
      const { error: err } = await supabase
        .from('usuarios')
        .update({ acepto_tratamiento_datos: true })
        .eq('id', user.id);

      if (err) throw err;

      updateUser({ aceptoTratamientoDatos: true });

      if (isAyudante) {
        navigate('/ayudante');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Error al guardar tu aceptación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Protección de Datos Personales</h1>
            <p className="text-sm text-gray-600">Ley 1581 de 2012</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="prose prose-sm max-w-none text-gray-700 space-y-4 mb-6">
          <p>
            En cumplimiento de la <strong>Ley 1581 de 2012</strong> y sus decretos reglamentarios, 
            informamos que los datos personales recolectados serán tratados de acuerdo con la siguiente 
            política:
          </p>

          <h3 className="text-lg font-semibold text-gray-900">Datos Recolectados</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nombre completo</li>
            <li>Número de documento de identidad</li>
            <li>Número de teléfono</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900">Finalidad del Tratamiento</h3>
          <p>
            Los datos personales suministrados serán utilizados exclusivamente para:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Gestión y control de cosecheros en el sistema agrícola</li>
            <li>Registro de pesajes, adelantos y pagos</li>
            <li>Generación de reportes y estadísticas internas</li>
            <li>Comunicación relacionada con las actividades de cosecha</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900">Derechos del Titular</h3>
          <p>
            Como titular de los datos personales, tienes derecho a:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Acceder</strong> a tus datos personales</li>
            <li><strong>Actualizar</strong> o corregir tus datos cuando sean inexactos</li>
            <li><strong>Solicitar</strong> la eliminación de tus datos cuando no sean necesarios</li>
            <li><strong>Revocar</strong> la autorización para el tratamiento de datos</li>
            <li><strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC)</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900">Medidas de Seguridad</h3>
          <p>
            Implementamos medidas técnicas, legales y organizativas para proteger tus datos 
            personales contra acceso no autorizado, pérdida o uso indebido. El acceso al sistema 
            está controlado mediante autenticación de usuarios y roles de acceso.
          </p>

          <h3 className="text-lg font-semibold text-gray-900">Vigencia</h3>
          <p>
            Los datos personales serán almacenados durante el tiempo que dure la relación 
            contractual o el tiempo necesario para cumplir con las finalidades descritas, 
            y posteriormente durante los plazos legales aplicables.
          </p>
        </div>

        <label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors mb-6">
          <input
            type="checkbox"
            checked={acepto}
            onChange={(e) => setAcepto(e.target.checked)}
            className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">
            He leído y acepto la política de tratamiento de datos personales de acuerdo con la 
            Ley 1581 de 2012.
          </span>
        </label>

        <button
          onClick={handleAceptar}
          disabled={!acepto || loading}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
          ) : (
            <><CheckCircle2 className="w-5 h-5" /> Aceptar y Continuar</>
          )}
        </button>

        <p className="mt-4 text-xs text-gray-400 text-center">
          Al hacer clic en "Aceptar y Continuar", autorizas el tratamiento de tus datos 
          personales conforme a la política descrita.
        </p>
      </div>
    </div>
  );
}