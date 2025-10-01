// src/components/charts/ProgressChart.jsx
import React from 'react';

const ProgressChart = ({ data }) => {
  const { plan, fact, title } = data;
  
  // Безопасное вычисление процента
  const percentage = plan > 0 ? Math.min(Math.round((fact / plan) * 100)) : 0;
  
  // Определяем цвет в зависимости от процента
  let color;
  if (percentage < 50) {
    color = 'text-red-400';
  } else if (percentage < 90) {
    color = 'text-orange-400';
  } else {
    color = 'text-green-400';
  }

  return (
    <div className="flex flex-col items-center">
      {/* Большой процент выполнения */}
      <div className="text-center mb-4">
        <div className={`text-5xl font-bold ${color} leading-none mb-2`}>
          {percentage}%
        </div>
        <div className="text-sm text-gray-400">
          выполнения
        </div>
      </div>

      {/* Информация */}
      <div className="text-center w-full">
        <div className="text-sm font-medium text-gray-300 mb-3">{title}</div>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Факт:</span>
            <span className="text-white font-medium">{fact.toLocaleString('ru-RU')} ₽</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">План:</span>
            <span className="text-white">{plan.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;