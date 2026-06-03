import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import {
  UserPlus,
  Scale,
  LogOut,
  Sprout,
  User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AyudanteDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user && !user.aceptoTratamientoDatos) {
      navigate('/tratamiento-datos');
    }
  }, [user, navigate]);

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
      action: () => navigate('/registrar-cosecheros'),
    },
    {
      title: 'Cosecha',
      description: 'Registrar pesajes de recolección',
      icon: Scale,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => navigate('/cosecha'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Ayudante</h1>
                <p className="text-sm text-gray-600">Sistema de Gestión Agrícola</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                {user?.nombre}
              </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido, {user?.nombre}</h2>
          <p className="text-gray-600">Selecciona una opción para comenzar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
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
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
