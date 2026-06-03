import { createBrowserRouter } from 'react-router';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegistrarCosecheros from './pages/RegistrarCosecheros';
import Cosecha from './pages/Cosecha';
import Reportes from './pages/Reportes';
import AdelantoSaldo from './pages/AdelantoSaldo';
import Pagos from './pages/Pagos';
import Configuracion from './pages/Configuracion';
import ConsultarCosechero from './pages/ConsultarCosechero';
import GestionContrasenas from './pages/GestionContrasenas';
import AyudanteDashboard from './pages/AyudanteDashboard';
import GestionUsuarios from './pages/GestionUsuarios';
import TratamientoDatos from './pages/TratamientoDatos';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
  },
  {
    path: '/dashboard',
    Component: Dashboard,
  },
  {
    path: '/registrar-cosecheros',
    Component: RegistrarCosecheros,
  },
  {
    path: '/cosecha',
    Component: Cosecha,
  },
  {
    path: '/reportes',
    Component: Reportes,
  },
  {
    path: '/adelanto-saldo',
    Component: AdelantoSaldo,
  },
  {
    path: '/pagos',
    Component: Pagos,
  },
  {
    path: '/configuracion',
    Component: Configuracion,
  },
  {
    path: '/consultar-cosechero',
    Component: ConsultarCosechero,
  },
  {
    path: '/gestion-contrasenas',
    Component: GestionContrasenas,
  },
  {
    path: '/ayudante',
    Component: AyudanteDashboard,
  },
  {
    path: '/gestion-usuarios',
    Component: GestionUsuarios,
  },
  {
    path: '/tratamiento-datos',
    Component: TratamientoDatos,
  },
]);