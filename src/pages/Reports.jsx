// src/pages/Reports.jsx
import React, { useState } from 'react';
import { Download, Filter, Calendar, BarChart3, TrendingUp, Users } from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    start: '2025-09-01',
    end: '2025-09-30'
  });

  const reports = [
    {
      id: 1,
      title: 'Ежедневный отчет по продажам',
      type: 'sales',
      period: '30.09.2025',
      size: '2.4 MB',
      icon: BarChart3,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Анализ фокусных товаров',
      type: 'focus',
      period: 'Сентябрь 2025',
      size: '1.8 MB',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 3,
      title: 'Отчет по СБП',
      type: 'sbp',
      period: 'Сентябрь 2025',
      size: '1.2 MB',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      id: 4,
      title: 'Производительность команды',
      type: 'team',
      period: 'Сентябрь 2025',
      size: '3.1 MB',
      icon: Users,
      color: 'orange'
    }
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'text-blue-400 bg-blue-500/20',
      green: 'text-green-400 bg-green-500/20',
      purple: 'text-purple-400 bg-purple-500/20',
      orange: 'text-orange-400 bg-orange-500/20'
    };
    return colors[color] || 'text-blue-400 bg-blue-500/20';
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Отчеты</h1>
          <p className="text-gray-400">Глубокая аналитика и кастомные отчеты</p>
        </div>

        {/* Фильтры и даты */}
        <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="input-field"
                />
              </div>
              <span className="text-gray-400">по</span>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm border border-gray-600">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </button>
              <button className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm">
                <Download className="h-4 w-4 mr-2" />
                Экспорт отчета
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Мои отчеты */}
          <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
              Мои отчеты
            </h2>
            <div className="space-y-4">
              {reports.map((report) => {
                const Icon = report.icon;
                return (
                  <div key={report.id} className="p-4 bg-gray-750 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getColorClass(report.color)}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{report.title}</h3>
                          <p className="text-gray-400 text-sm">{report.period} • {report.size}</p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Статистика */}
          <div className="space-y-6">
            <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Общая выручка</h3>
              <div className="text-3xl font-bold text-white mb-2">557 745 ₽</div>
              <div className="flex items-center text-green-400 text-sm">
                <TrendingUp className="h-4 w-4 mr-1" />
                +32.9% за период
              </div>
            </div>

            <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Быстрая аналитика</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Фокусные товары:</span>
                  <span className="text-white font-medium">124 850 ₽</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">СБП:</span>
                  <span className="text-white font-medium">89 340 ₽</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Средний чек:</span>
                  <span className="text-white font-medium">2 450 ₽</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Конверсия:</span>
                  <span className="text-green-400 font-medium">68%</span>
                </div>
              </div>
            </div>

            <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Создать новый отчет</h3>
              <div className="space-y-3">
                <select className="input-field">
                  <option>Выберите тип отчета</option>
                  <option>Ежедневные продажи</option>
                  <option>Фокусные товары</option>
                  <option>СБП аналитика</option>
                  <option>Производительность команды</option>
                </select>
                <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors">
                  Сгенерировать отчет
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;