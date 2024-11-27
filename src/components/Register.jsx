import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    try {
      console.log("Intentando registrar usuario...");

      // Registrando al usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      console.log("Usuario registrado en Supabase Auth:", authData);

      if (authData?.user) {
        // Insertar el usuario en la tabla `employees` con rol `EMPLOYEE` por defecto
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .insert([
            {
              id: authData.user.id, // Utilizar el ID generado por Supabase Auth
              dni,
              name: `Empleado ${dni}`, // Esto lo puedes ajustar según tus necesidades
              email,
              role: 'EMPLOYEE', // Rol por defecto
              department: 'General', // Esto también puedes personalizarlo
            },
          ]);

        if (employeeError) throw employeeError;

        console.log("Usuario agregado a la tabla employees:", employeeData);
        toast.success('Usuario registrado correctamente.');
        
        // Redirigir al login después de registrarse
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error.message);
      toast.error('Error al registrar usuario. Verifica los datos e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto">
        <h2 className="text-2xl font-bold mb-6">Registrar Usuario</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            DNI
          </label>
          <input
            type="text"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Ingrese DNI"
            autoComplete="off"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Ingrese Correo Electrónico"
            autoComplete="off"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Ingrese Contraseña"
          />
        </div>
        <button
          onClick={handleRegister}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all"
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </div>
    </div>
  );
};

export default Register;
