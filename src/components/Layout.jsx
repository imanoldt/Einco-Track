import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children, onLogout }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log('Layout - user:', user);

  const handleLogout = async () => {
    console.log('Layout - Iniciando proceso de cerrar sesión...');
    try {
      if (onLogout) {
        await onLogout();
        console.log('Layout - Sesión cerrada con éxito');
        navigate('/login'); // Redirigir al login después de cerrar sesión
      } else {
        console.error('Layout - onLogout no está definido');
      }
    } catch (error) {
      console.error('Layout - Error al cerrar sesión:', error);
    }
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">EINCO</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Sistema de Control de Tiempo
              </span>
              {!user && (
                <button
                  onClick={handleNavigateToRegister}
                  className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrarse
                </button>
              )}
              {user && (
                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cerrar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;