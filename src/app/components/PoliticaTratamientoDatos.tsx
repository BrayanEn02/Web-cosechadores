import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function PoliticaTratamientoDatos({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Política de Tratamiento de Datos Personales</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            En cumplimiento de la <strong>Ley 1581 de 2012</strong> y sus decretos reglamentarios, 
            informamos a los cosecheros y usuarios del sistema sobre el tratamiento de sus datos personales.
          </p>

          <h4 className="font-bold text-gray-900">1. Datos recolectados</h4>
          <p>
            Los datos personales que recolectamos y tratamos son: nombre completo, número de documento 
            de identidad y número de teléfono. Estos datos son proporcionados voluntariamente por el 
            cosechero al momento de su registro en el sistema.
          </p>

          <h4 className="font-bold text-gray-900">2. Finalidad del tratamiento</h4>
          <p>Los datos personales serán utilizados para las siguientes finalidades:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Identificación y registro de cosecheros en el sistema de gestión agrícola.</li>
            <li>Control y registro de pesajes, adelantos y pagos realizados a cada cosechero.</li>
            <li>Generación de reportes y estadísticas de producción.</li>
            <li>Comunicación directa con el cosechero para asuntos relacionados con su actividad.</li>
            <li>Cumplimiento de obligaciones contables y fiscales.</li>
          </ul>

          <h4 className="font-bold text-gray-900">3. Derechos del titular</h4>
          <p>De acuerdo con la Ley 1581 de 2012, el cosechero tiene los siguientes derechos:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Acceder</strong> a sus datos personales en cualquier momento.</li>
            <li><strong>Actualizar</strong> o <strong>rectificar</strong> sus datos cuando sean incorrectos o estén desactualizados.</li>
            <li><strong>Solicitar</strong> la eliminación de sus datos cuando considere que no están siendo tratados conforme a la ley.</li>
            <li><strong>Revocar</strong> la autorización otorgada para el tratamiento de sus datos.</li>
            <li><strong>Conocer</strong> las actualizaciones de esta política de tratamiento.</li>
          </ul>

          <h4 className="font-bold text-gray-900">4. Ejercicio de derechos</h4>
          <p>
            Para ejercer sus derechos, el cosechero puede comunicarse con el administrador del sistema 
            o contactarnos a través del correo electrónico registrado. La solicitud será atendida en un 
            plazo máximo de 15 días hábiles.
          </p>

          <h4 className="font-bold text-gray-900">5. Seguridad de los datos</h4>
          <p>
            Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger los 
            datos personales contra acceso no autorizado, pérdida, alteración o divulgación indebida. 
            El acceso a los datos está restringido únicamente a usuarios autorizados del sistema.
          </p>

          <h4 className="font-bold text-gray-900">6. Vigencia</h4>
          <p>
            Esta política de tratamiento de datos personales rige a partir de su publicación y se 
            mantendrá vigente durante el tiempo que los datos sean necesarios para las finalidades 
            descritas o mientras el titular no solicite su eliminación.
          </p>

          <h4 className="font-bold text-gray-900">7. Actualizaciones</h4>
          <p>
            Nos reservamos el derecho de modificar esta política en cualquier momento. Los cambios 
            serán comunicados a través del sistema y entrarán en vigencia inmediatamente después de 
            su publicación.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
