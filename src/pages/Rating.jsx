import React, { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, Award, Crown, Target, Calendar } from 'lucide-react';
import { dataService } from '../services/dataService';

const Rating = ({ userData }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [ratingData, setRatingData] = useState([]);

  useEffect(() => {
    loadRatingData();
  }, [timeRange]);

  const loadRatingData = () => {
    const allData = dataService.getData();
    if (!allData) return;

    const employeeMap = {};
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    Object.entries(allData.revenueData || {}).forEach(([date, entries]) => {
      if (new Date(date) >= startDate) {
        entries.forEach(entry => {
          if (!employeeMap[entry.employeeId]) {
            employeeMap[entry.employeeId] = {
              name: entry.employeeName,
              total: 0,
              focus: 0,
              sbp: 0,
              entries: 0,
              lastActivity: entry.timestamp
            };
          }
          
          employeeMap[entry.employeeId].total += (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0);
          employeeMap[entry.employeeId].focus += parseInt(entry.focus) || 0;
          employeeMap[entry.employeeId].sbp += parseInt(entry.sbp) || 0;
          employeeMap[entry.employeeId].entries++;
          employeeMap[entry.employeeId].lastActivity = entry.timestamp;
        });
      }
    });

    const rankedData = Object.values(employeeMap)
      .map(employee => ({
        ...employee,
        score: calculateScore(employee)
      }))
      .sort((a, b) => b.score - a.score)
      .map((employee, index) => ({
        ...employee,
        place: index + 1
      }));

    setRatingData(rankedData);
  };

  const calculateScore = (employee) => {
    // Баллы за общую выручку
    const revenueScore = employee.total * 0.5;
    
    // Бонус за фокусные товары
    const focusBonus = employee.focus * 0.3;
    
    // Бонус за СБП
    const sbpBonus = employee.sbp * 0.2;
    
    // Бонус за активность (больше записей = больше активности)
    const activityBonus = employee.entries * 1000;
    
    return revenueScore + focusBonus + sbpBonus + activityBonus;
  };

  const getMedalIcon = (place) => {
    if (place === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (place === 2) return <Trophy className="h-6 w-6 text-gray-300" />;
    if (place === 3) return <Award className="h-6 w-6 text-orange-400" />;
    return <Star className="h-6 w-6 text-blue-400" />;
  };

  const getMedalColor = (place) => {
    if (place === 1) return 'from-yellow-500 to-yellow-600';
    if (place === 2) return 'from-gray-400 to-gray-500';
    if (place === 3) return 'from-orange-500 to-orange-600';
    return 'from-blue-500 to-blue-600';
  };

  const getRangeDisplayName = (range) => {
    const names = {
      'week': 'За неделю',
      'month': 'За месяц',
      'quarter': 'За квартал'
    };
    return names[range] || range;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Рейтинг сотрудников</h1>
            <p className="text-gray-400">Мотивационная система и достижения</p>
          </div>
          
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
            {['week', 'month', 'quarter'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {getRangeDisplayName(range)}
              </button>
            ))}
          </div>
        </div>

        {/* Топ-3 сотрудника */}
        {ratingData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {ratingData.slice(0, 3).map((employee, index) => (
              <div
                key={employee.name}
                className={`card p-6 relative overflow-hidden ${
                  index === 0 ? 'md:col-span-3 lg:col-span-1' : ''
                }`}
              >
                {/* Фон для пьедестала */}
                {index === 0 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5" />
                )}
                {index === 1 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-gray-600/5" />
                )}
                {index === 2 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5" />
                )}

                <div className="relative z-10 text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getMedalColor(employee.place)} flex items-center justify-center`}>
                      {getMedalIcon(employee.place)}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-lg font-bold text-white">{employee.name}</div>
                    <div className="text-sm text-gray-400">
                      {employee.place} место в рейтинге
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-white">
                      {employee.total.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-sm text-gray-400">Общая выручка</div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-green-400 font-medium">
                          {employee.focus.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-gray-400">Фокусные</div>
                      </div>
                      <div>
                        <div className="text-purple-400 font-medium">
                          {employee.sbp.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-gray-400">СБП</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        {employee.entries} записей
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {Math.round(employee.score).toLocaleString('ru-RU')} баллов
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Полный рейтинг */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-yellow-400" />
            Полный рейтинг сотрудников
          </h3>
          
          {ratingData.length > 0 ? (
            <div className="space-y-3">
              {ratingData.map((employee) => (
                <div
                  key={employee.name}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8">
                      {employee.place <= 3 ? (
                        getMedalIcon(employee.place)
                      ) : (
                        <span className="text-gray-400 font-semibold">
                          {employee.place}
                        </span>
                      )}
                    </div>
                    
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    
                    <div>
                      <div className="text-white font-medium">{employee.name}</div>
                      <div className="text-gray-400 text-sm">
                        {employee.entries} записей • {Math.round(employee.score).toLocaleString('ru-RU')} баллов
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-semibold text-lg">
                      {employee.total.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-gray-400 text-sm">
                      <span className="text-green-400">{employee.focus.toLocaleString('ru-RU')} ₽</span>
                      {' • '}
                      <span className="text-purple-400">{employee.sbp.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Нет данных для отображения рейтинга</p>
              <p className="text-gray-500 text-sm mt-2">
                Начните вносить данные о продажах, чтобы появился рейтинг
              </p>
            </div>
          )}
        </div>

        {/* Система мотивации */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-green-400" />
              Как работает рейтинг?
            </h3>
            
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>1 балл за каждые 2 рубля общей выручки</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Дополнительные 0.3 балла за каждый рубль фокусных товаров</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>Дополнительные 0.2 балла за каждый рубль СБП</span>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span>1000 баллов за каждую внесенную запись (активность)</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-400" />
              Бонусы и награды
            </h3>
            
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex justify-between items-center">
                <span>🥇 1 место:</span>
                <span className="text-yellow-400">Премия + специальный бейдж</span>
              </div>
              <div className="flex justify-between items-center">
                <span>🥈 2 место:</span>
                <span className="text-gray-300">Премия</span>
              </div>
              <div className="flex justify-between items-center">
                <span>🥉 3 место:</span>
                <span className="text-orange-400">Бонусные баллы</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Топ-10:</span>
                <span className="text-blue-400">Сертификат достижений</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-500">
                * Награды выплачиваются по итогам каждого периода
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rating;