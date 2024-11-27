import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Coffee, Utensils } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTime } from '../hooks/useTime';
import toast from 'react-hot-toast';

const TimeButton = ({ onClick, icon: Icon, label, color }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 ${color} text-white rounded-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg`}
  >
    <Icon className="h-6 w-6 mb-2" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const translateEntryType = (type) => {
  const translations = {
    'ENTRADA': 'Entrada',
    'SALIDA': 'Salida',
    'DESCANSO_INICIO': 'Inicio de Descanso',
    'DESCANSO_FIN': 'Fin de Descanso',
    'COMIDA_INICIO': 'Inicio de Comida',
    'COMIDA_FIN': 'Fin de Comida'
  };
  return translations[type] || type;
};

export const EmployeeView = () => {
  const { user } = useAuth();
  const { currentTime, todayStats, registerTime, fetchStats } = useTime();
  const [validationCode, setValidationCode] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const handleTimeAction = async (type) => {
    console.log(`Intentando realizar acción de tipo: ${type}`);
    console.log(`Código de validación ingresado: ${validationCode}`);

    if (!validationCode) {
      setShowValidation(true);
      toast.error('Por favor, ingrese el código de validación.');
      console.error('Error: No se ingresó el código de validación.');
      return;
    }

    try {
      // Validaciones de flujo lógico de fichaje
      const lastEntry = todayStats.recentEntries.length > 0 ? todayStats.recentEntries[0] : null;
      console.log('Última entrada registrada:', lastEntry);

      if (type === 'ENTRADA' && lastEntry && lastEntry.type === 'ENTRADA') {
        toast.error('No puedes registrar otra entrada sin registrar una salida.');
        console.error('Error: Intento de registrar entrada sin haber registrado salida.');
        return;
      }

      if (type === 'SALIDA' && (!lastEntry || lastEntry.type !== 'ENTRADA')) {
        toast.error('No puedes registrar salida sin haber registrado entrada.');
        console.error('Error: Intento de registrar salida sin haber registrado entrada.');
        return;
      }

      if (type === 'DESCANSO_INICIO' && (!lastEntry || lastEntry.type !== 'ENTRADA')) {
        toast.error('No puedes iniciar un descanso sin haber registrado entrada.');
        console.error('Error: Intento de iniciar descanso sin haber registrado entrada.');
        return;
      }

      if (type === 'DESCANSO_FIN' && (!lastEntry || lastEntry.type !== 'DESCANSO_INICIO')) {
        toast.error('No puedes finalizar un descanso sin haberlo iniciado.');
        console.error('Error: Intento de finalizar descanso sin haberlo iniciado.');
        return;
      }

      if (type === 'COMIDA_INICIO' && (!lastEntry || lastEntry.type !== 'ENTRADA')) {
        toast.error('No puedes iniciar comida sin haber registrado entrada.');
        console.error('Error: Intento de iniciar comida sin haber registrado entrada.');
        return;
      }

      if (type === 'COMIDA_FIN' && (!lastEntry || lastEntry.type !== 'COMIDA_INICIO')) {
        toast.error('No puedes finalizar comida sin haberla iniciado.');
        console.error('Error: Intento de finalizar comida sin haberla iniciado.');
        return;
      }

      console.log('Validaciones pasadas, registrando tiempo...');
      await registerTime(type, validationCode);
      setValidationCode('');
      setShowValidation(false);
      toast.success('Registro exitoso');
      console.log('Registro de tiempo exitoso.');

      // Actualizar estadísticas después de registrar
      await fetchStats();
      console.log('Estadísticas actualizadas después del registro.');
    } catch (error) {
      toast.error('Código de validación inválido');
      console.error('Error al registrar el tiempo:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Actualizar estadísticas del día cada 30 segundos
      fetchStats();
      console.log('Actualizando estadísticas del día...');
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Panel Principal */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                ¡Bienvenido, {user?.name}!
              </h2>
              <p className="text-gray-600">DNI: {user?.dni}</p>
              <div className="text-4xl font-mono font-bold text-blue-600 mt-4">
                {currentTime}
              </div>
            </div>

            {showValidation && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Validación
                </label>
                <input
                  type="text"
                  value={validationCode}
                  onChange={(e) => setValidationCode(e.target.value.toUpperCase())}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ingrese el código diario"
                  autoComplete="off"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <TimeButton
                onClick={() => handleTimeAction('ENTRADA')}
                icon={LogIn}
                label="Registrar Entrada"
                color="bg-green-500"
              />
              <TimeButton
                onClick={() => handleTimeAction('SALIDA')}
                icon={LogOut}
                label="Registrar Salida"
                color="bg-red-500"
              />
              <TimeButton
                onClick={() => handleTimeAction('DESCANSO_INICIO')}
                icon={Coffee}
                label="Iniciar Descanso"
                color="bg-yellow-500"
              />
              <TimeButton
                onClick={() => handleTimeAction('DESCANSO_FIN')}
                icon={Coffee}
                label="Finalizar Descanso"
                color="bg-yellow-600"
              />
              <TimeButton
                onClick={() => handleTimeAction('COMIDA_INICIO')}
                icon={Utensils}
                label="Iniciar Comida"
                color="bg-orange-500"
              />
              <TimeButton
                onClick={() => handleTimeAction('COMIDA_FIN')}
                icon={Utensils}
                label="Finalizar Comida"
                color="bg-orange-600"
              />
            </div>
          </div>

          {/* Estadísticas del Día */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Resumen del Día</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Hora de Entrada</p>
                <p className="text-lg font-bold">{todayStats.entryTime || 'Sin registro'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Tiempo Trabajado</p>
                <p className="text-lg font-bold">{todayStats.effectiveTime}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600 font-medium">Tiempo de Descanso</p>
                <p className="text-lg font-bold">{todayStats.breakTime}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Tiempo de Comida</p>
                <p className="text-lg font-bold">{todayStats.lunchTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Registro de Actividad */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Registros de Hoy</h3>
          <div className="space-y-3">
            {todayStats.recentEntries.map((entry, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium">
                  {translateEntryType(entry.type)}
                </span>
                <span className="text-gray-600">{entry.time}</span>
              </div>
            ))}
            {todayStats.recentEntries.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No hay registros para el día de hoy
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeView;
