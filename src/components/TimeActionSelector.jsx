import React from 'react';
import { Clock, Coffee, Utensils, LogIn, LogOut } from 'lucide-react';

const TimeActionSelector = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => onSelect('entrada')}
        className="flex flex-col items-center justify-center p-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        <LogIn className="w-8 h-8 mb-2" />
        <span>Entrada</span>
      </button>
      
      <button
        onClick={() => onSelect('salida')}
        className="flex flex-col items-center justify-center p-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <LogOut className="w-8 h-8 mb-2" />
        <span>Salida</span>
      </button>
      
      <button
        onClick={() => onSelect('descanso_inicio')}
        className="flex flex-col items-center justify-center p-6 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
      >
        <Coffee className="w-8 h-8 mb-2" />
        <span>Inicio Descanso</span>
      </button>
      
      <button
        onClick={() => onSelect('descanso_fin')}
        className="flex flex-col items-center justify-center p-6 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
      >
        <Coffee className="w-8 h-8 mb-2" />
        <span>Fin Descanso</span>
      </button>
      
      <button
        onClick={() => onSelect('comida_inicio')}
        className="flex flex-col items-center justify-center p-6 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors col-span-2"
      >
        <Utensils className="w-8 h-8 mb-2" />
        <span>Inicio Comida</span>
      </button>
      
      <button
        onClick={() => onSelect('comida_fin')}
        className="flex flex-col items-center justify-center p-6 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors col-span-2"
      >
        <Utensils className="w-8 h-8 mb-2" />
        <span>Fin Comida</span>
      </button>
    </div>
  );
};

export default TimeActionSelector;