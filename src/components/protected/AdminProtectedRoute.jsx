// src/components/AdminProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../ui/Loader';

function AdminProtectedRoute({ children }) {
  const { profile, loading } = useAuth(); // Usamos el perfil que ya cargamos en el AuthContext

  if (loading) {
    return <Loader size='32' fullScreen overlay message="Cargando..." />
  }

  // Si el usuario no tiene el rol de administrador, lo redirigimos a la página principal.
  if (profile?.role !== 'administrador') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminProtectedRoute;