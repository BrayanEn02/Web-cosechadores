import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import {
  UserPlus,
  Wallet,
  FileBarChart,
  Users,
  LogOut,
  Sprout,
  Scale,
  Settings,
  CreditCard,
  UserCheck,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    if (user && !user.aceptoTratamientoDatos) {
      navigate('/tratamiento-datos');
    }
  }, [isAdmin, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      title: 'Registrar Cosechero',
      description: 'Agregar nuevos cosecheros al sistema',
      icon: UserPlus,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => navigate('/registrar-cosecheros')
    },
    {
      title: 'Cosecha',
      description: 'Registrar pesajes y pagos de recolección',
      icon: Scale,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => navigate('/cosecha')
    },
    {
      title: 'Adelanto de Saldo',
      description: 'Registrar y controlar adelantos a cosecheros',
      icon: Wallet,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => navigate('/adelanto-saldo')
    },
    
    {
      title: 'Pagos',
      description: 'Gestionar pagos y saldos de cosecheros',
      icon: CreditCard,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => navigate('/pagos')
    },
    
    {
      title: 'Ver Reportes',
      description: 'Consultar estadísticas y reportes',
      icon: FileBarChart,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => navigate('/reportes')
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administrar usuarios del sistema',
      icon: Users,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => navigate('/gestion-usuarios')
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema y precios',
      icon: Settings,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => navigate('/configuracion')
    },
    {
      title: 'Consulta Cosechero',
      description: 'Cosecheros: consulta tus pesajes y saldos',
      icon: UserCheck,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      action: () => navigate('/consultar-cosechero')
    },
    {
      title: 'Gestión de Contraseñas',
      description: 'Administrar contraseñas de cosecheros',
      icon: KeyRound,
      color: 'bg-violet-600 hover:bg-violet-700',
      action: () => navigate('/gestion-contrasenas')
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel Principal</h1>
                <p className="text-sm text-gray-600">Sistema de Gestión Agrícola</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:inline">{user?.nombre}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h2>
          <p className="text-gray-600">Selecciona una opción para comenzar</p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="group bg-white p-6 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 transition-all duration-200 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center w-14 h-14 ${item.color} rounded-lg transition-colors`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Gestión Eficiente</h3>
              <p className="text-green-50 max-w-2xl">
                Optimiza la administración de tu producción agrícola con nuestras herramientas diseñadas 
                especialmente para cosecheros y administradores.
              </p>
            </div>
            <Sprout className="w-16 h-16 text-green-200 opacity-50" />
          </div>
        </div>
      </main>
    </div>
  );
}