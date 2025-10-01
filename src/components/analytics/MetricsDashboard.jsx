import React from 'react';
import { DollarSign, Target, TrendingUp, Users, Clock, BarChart3 } from 'lucide-react';

const MetricsDashboard = ({ metrics }) => {
  const metricConfigs = {
    revenue: {
      icon: DollarSign,
      color: 'blue',
      label: 'Выручка',
      formatter: (value) => `${value?.toLocaleString('ru-RU')} ₽`
    },
    focus: {
      icon: Target,
      color: 'green',
      label: 'Фокусные товары',
      formatter: (value) => `${value?.toLocaleString('ru-RU')} ₽`
    },
    sbp: {
      icon: BarChart3,
      color: 'purple',
      label: 'СБП',
      formatter: (value) => `${value?.toLocaleString('ru-RU')} ₽`
    },
    employees: {
      icon: Users,
      color: 'orange',
      label: 'Активных сотрудников',
      formatter: (value) => value
    },
    activity: {
      icon: Clock,
      color: 'red',
      label: 'Дней с данными',
      formatter: (value) => value
    },
    trend: {
      icon: TrendingUp,
      color: 'green',
      label: 'Тренд',
      formatter: (value) => `${value > 0 ? '+' : ''}${value}%`
    }
  };

  const getMetricColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
    };
    return colors[color] || 'from-blue-500 to-blue-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(metrics).map(([key, value]) => {
        const config = metricConfigs[key];
        if (!config) return null;

        const Icon = config.icon;
        const displayValue = config.formatter ? config.formatter(value) : value;

        return (
          <div
            key={key}
            className={`bg-gradient-to-r ${getMetricColor(config.color)} rounded-xl p-6 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{config.label}</p>
                <p className="text-2xl font-bold mt-1">{displayValue}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <Icon className="h-6 w-6" />
              </div>
            </div>
            
            {/* Мини-индикатор прогресса */}
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ 
                  width: `${Math.min(Math.abs(value) / 1000, 100)}%` 
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsDashboard;