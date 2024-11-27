// Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('Iniciando sesión...');
    console.log(`Email ingresado: ${email}`);
    console.log(`Password ingresado: ${password}`);

    try {
      // Intentar iniciar sesión
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Email not confirmed")) {
          console.error('Error: Email no confirmado:', authError);
          toast.error('Email no confirmado. Por favor, revisa tu correo electrónico.');
        } else {
          console.error('Error al iniciar sesión:', authError);
          toast.error('Credenciales inválidas.');
        }
        setLoading(false);
        return;
      }

      console.log('Datos de autenticación recibidos:', authData);

      // Verificar que el usuario se haya autenticado correctamente
      const user = authData.user;
      if (!user) {
        console.error('Error de autenticación: Usuario no encontrado.');
        toast.error('Error de autenticación: Usuario no encontrado.');
        setLoading(false);
        return;
      }

      console.log('Usuario autenticado:', user);

      // Obtener perfil del usuario de la tabla 'employees'
      const { data: userProfile, error: profileError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError) {
        console.error('Error al buscar perfil del usuario:', profileError);
        toast.error('Error al obtener perfil del usuario.');
        setLoading(false);
        return;
      }

      console.log('Perfil del usuario obtenido:', userProfile);

      // Redirigir según el rol del usuario
      if (userProfile.role === 'ADMIN') {
        console.log('Redirigiendo al panel de administración...');
        navigate('/admin');
      } else if (userProfile.role === 'EMPLOYEE') {
        console.log('Redirigiendo al panel del empleado...');
        navigate('/employee');
      } else {
        console.error('Rol no reconocido:', userProfile.role);
        toast.error('Rol no reconocido. Contacte con soporte.');
      }
    } catch (error) {
      console.error('Error inesperado al iniciar sesión:', error);
      toast.error('Error de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      console.log("Reenviando email de verificación para:", email);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      toast.success("Correo de verificación reenviado. Revisa tu bandeja de entrada.");
    } catch (error) {
      console.error("Error al reenviar correo de verificación:", error);
      toast.error("Error al reenviar correo de verificación. Intenta de nuevo.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form className="w-96 p-6 bg-white rounded shadow-md" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
          <input
            type="email"
            className="w-full p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingrese su correo electrónico"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Contraseña</label>
          <input
            type="password"
            className="w-full p-3 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese su contraseña"
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Iniciar Sesión'}
        </button>
        <button
          type="button"
          className="w-full p-3 mt-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          onClick={resendVerificationEmail}
          disabled={loading}
        >
          Reenviar Email de Verificación
        </button>
      </form>
    </div>
  );
};

export default Login;
