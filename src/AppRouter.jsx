import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminView from './components/AdminView';
import EmployeeView from './components/EmployeeView';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import { useAuth } from './hooks/useAuth';

const PrivateRoute = ({ element: Component, requiredRole }) => {
  const { user, loading, signOut } = useAuth();

  console.log('PrivateRoute - user:', user);
  console.log('PrivateRoute - loading:', loading);

  if (loading) {
    // Mostrar un indicador de carga mientras se obtiene el perfil del usuario.
    return <div>Cargando...</div>;
  }

  if (!user) {
    // Si no hay usuario logueado, redirige a la página de login.
    console.warn('PrivateRoute - No user logged in, redirecting to /login');
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Si el usuario logueado no tiene el rol adecuado, redirige a la página correspondiente.
    console.warn('PrivateRoute - Incorrect role, redirecting based on role');
    return user.role === 'EMPLOYEE' ? <Navigate to="/employee" /> : <Navigate to="/admin" />;
  }

  // Si todo está bien, muestra el componente solicitado envuelto en el Layout.
  return <Layout user={user} onLogout={signOut}>{React.cloneElement(Component)}</Layout>;
};

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protegiendo la ruta de admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute element={<AdminView />} requiredRole="ADMIN" />
          }
        />
        
        {/* Protegiendo la ruta de empleado */}
        <Route
          path="/employee"
          element={
            <PrivateRoute element={<EmployeeView />} requiredRole="EMPLOYEE" />
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;