// src/components/PublicRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../ui/Loader';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Loader size='32' fullScreen overlay message="Cargando..." />
    );
  }

  if (user) return <Navigate to="/" replace />;

  return children;
}
