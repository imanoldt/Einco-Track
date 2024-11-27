import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('Intentando obtener el perfil del usuario...');
        setLoading(true);

        // Obtener el usuario autenticado actual desde Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error('Error al obtener el usuario autenticado:', authError);
          setUser(null);
          return;
        }

        const authUser = authData?.user;
        if (authUser) {
          console.log('Usuario autenticado:', authUser);

          // Intentar obtener el perfil del usuario de la tabla employees
          const { data: profileData, error: profileError } = await supabase
            .from('employees')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profileError) {
            // Si no se encuentra el usuario en employees, crearlo
            if (profileError.code === 'PGRST116' || profileError.details?.includes('result contains 0 rows')) {
              console.warn('Usuario no encontrado en employees. Creando registro...');

              const { error: insertError } = await supabase.from('employees').insert([
                {
                  id: authUser.id,
                  dni: 'NO DEFINIDO',  // Deberás definir cómo quieres llenar estos datos
                  name: authUser.email.split('@')[0],
                  email: authUser.email,
                  role: 'EMPLOYEE',  // Asigna un rol por defecto, podrías cambiarlo según las necesidades
                  department: 'General'
                }
              ]);

              if (insertError) {
                throw new Error('Error al crear el registro en employees: ' + insertError.message);
              } else {
                console.log('Registro creado exitosamente en employees');
                toast.success('Usuario registrado exitosamente en employees.');

                // Obtener el perfil recién creado
                const { data: newProfileData, error: newProfileError } = await supabase
                  .from('employees')
                  .select('*')
                  .eq('id', authUser.id)
                  .single();

                if (newProfileError) {
                  throw new Error('Error al obtener el perfil recién creado: ' + newProfileError.message);
                }

                setUser(newProfileData);
              }
            } else {
              throw profileError;
            }
          } else {
            console.log('Perfil del usuario obtenido:', profileData);
            setUser(profileData);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        toast.error('Error al obtener el perfil del usuario.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    // Listener para actualizar el usuario automáticamente si el estado de autenticación cambia
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log('El usuario ha cerrado sesión');
        setUser(null);
      } else if (event === 'SIGNED_IN' && session) {
        fetchUserProfile();
      }
    });

    // Cleanup del listener
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada exitosamente.');
      setUser(null);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión.');
    }
  };

  return { user, loading, signOut };
};
