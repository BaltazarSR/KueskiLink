// src/auth/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function PrivateRoute({ allowedRoles }) {
  const { user, profile, loading } = useUser();

  if (loading) {
    console.log('[PrivateRoute] Esperando perfil...');
    return <p>Cargando sesión...</p>;
  }

  if (!user) {
    console.log('[PrivateRoute] No hay sesión, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  if (!profile) {
    console.log('[PrivateRoute] Usuario logueado pero sin perfil');
    return <Navigate to="/complete-profile" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    console.log('[PrivateRoute] Rol no permitido:', profile.role);
    return <Navigate to="/" replace />;
  }

  if (profile.role === 'employee' && allowedRoles.includes('employee') && profile.active === false) {
    console.log('[PrivateRoute] Empleado desactivado, redirigiendo a /employee-inactive');
    return <Navigate to="/employee-inactive" replace />;
  }

  return <Outlet />;
}

export default PrivateRoute;
