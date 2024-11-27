import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const useTime = () => {
  const [currentTime, setCurrentTime] = useState('');
  const [todayStats, setTodayStats] = useState({
    recentEntries: [],
    entryTime: null,
    effectiveTime: null,
    breakTime: null,
    lunchTime: null,
  });

  const fetchStats = async () => {
    try {
      const todayDate = new Date().toISOString().split('T')[0];

      const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select('type, timestamp')
        .eq('employee_id', supabase.auth.user().id)
        .gte('timestamp', todayDate);

      if (error) throw error;

      // Procesar estadísticas
      const processedStats = processTimeEntries(timeEntries);
      setTodayStats(processedStats);
    } catch (error) {
      console.error('Error al obtener las estadísticas:', error);
      toast.error('Error al obtener las estadísticas');
    }
  };

  const registerTime = async (type, validationCode) => {
    try {
      // Verificar código diario
      const todayDate = new Date().toISOString().split('T')[0];
      const { data: dailyCode, error: codeError } = await supabase
        .from('daily_codes')
        .select('*')
        .eq('code', validationCode)
        .eq('date', todayDate)
        .eq('used', false)
        .single();

      if (codeError || !dailyCode) {
        toast.error('Código de validación inválido o ya utilizado.');
        throw new Error('Invalid or used validation code.');
      }

      // Actualizar código como usado
      const { error: updateError } = await supabase
        .from('daily_codes')
        .update({ used: true })
        .eq('id', dailyCode.id);

      if (updateError) {
        toast.error('No se pudo actualizar el estado del código.');
        throw new Error('Failed to update code status.');
      }

      // Registrar el tiempo en la base de datos
      const { error } = await supabase
        .from('time_entries')
        .insert({
          employee_id: supabase.auth.user().id,
          type,
          timestamp: new Date().toISOString(),
          validated_by: dailyCode.created_by,
        });

      if (error) throw error;

      // Actualizar estadísticas tras el registro
      fetchStats();
      toast.success('Registro de tiempo exitoso');
    } catch (error) {
      console.error('Error al registrar el tiempo:', error);
      toast.error('Error al registrar el tiempo');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    currentTime,
    todayStats,
    registerTime,
  };
};

// Función auxiliar para procesar las entradas y calcular estadísticas del día
const processTimeEntries = (entries) => {
  const stats = {
    recentEntries: entries.map((entry) => ({
      type: entry.type,
      time: new Date(entry.timestamp).toLocaleTimeString(),
    })),
    entryTime: null,
    effectiveTime: null,
    breakTime: null,
    lunchTime: null,
  };

  // Aquí puedes agregar la lógica para calcular tiempos efectivos, de descanso y de comida
  return stats;
};
