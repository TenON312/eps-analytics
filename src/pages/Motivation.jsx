import React, { useState, useEffect } from 'react';
import { Gift, Award, Star, TrendingUp, ArrowLeft, Target, Zap, Calendar, Users, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { useNotifications } from '../contexts/NotificationContext';

const Motivation = ({ userData }) => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  
  const [motivationData, setMotivationData] = useState(null);
  const [activeTab, setActiveTab] = useState('bonuses');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  useEffect(() => {
    loadMotivationData();
  }, [selectedPeriod]);

  const loadMotivationData = () => {
    // Генерация данных мотивации на основе реальных данных
    const employees = dataService.getEmployees();
    const motivationData = generateMotivationData(employees, selectedPeriod);
    setMotivationData(motivationData);
  };

  const generateMotivationData = (employees, period) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const employeeBonuses = employees.map(employee => {
      // Получаем данные о продажах сотрудника
      const salesData = getEmployeeSalesData(employee.employeeId, period);
      
      // Расчет бонусов
      const bonuses = calculateBonuses(salesData);
      const totalBonus = Object.values(bonuses).reduce((sum, bonus) => sum + bonus.amount, 0);
      
      // Уровень и достижения
      const level = calculateLevel(totalBonus, salesData.completedPlans);
      const achievements = getAchievements(employee, salesData);

      return {
        ...employee,
        salesData,
        bonuses,
        totalBonus,
        level,
        achievements,
        rank: 0 // Заполним после сортировки
      };
    });

    // Сортируем по общему бонусу и назначаем ранги
    employeeBonuses.sort((a, b) => b.totalBonus - a.totalBonus);
    employeeBonuses.forEach((employee, index) => {
      employee.rank = index + 1;
    });

    // Общая статистика по отделу
    const departmentStats = {
      totalBonuses: employeeBonuses.reduce((sum, emp) => sum + emp.totalBonus, 0),
      avgBonus: Math.round(employeeBonuses.reduce((sum, emp) => sum + emp.totalBonus, 0) / employeeBonuses.length),
      topPerformer: employeeBonuses[0],
      completedPlans: employeeBonuses.reduce((sum, emp) => sum + emp.salesData.completedPlans, 0),
      totalRevenue: employeeBonuses.reduce((sum, emp) => sum + emp.salesData.totalRevenue, 0)
    };

    return {
      employees: employeeBonuses,
      departmentStats,
      period: getPeriodName(period)
    };
  };

  const getEmployeeSalesData = (employeeId, period) => {
    // В реальном приложении здесь будет запрос к API
    // Сейчас генерируем демо-данные
    return {
      totalRevenue: Math.floor(Math.random() * 1000000) + 200000,
      focusSales: Math.floor(Math.random() * 300000) + 50000,
      sbpSales: Math.floor(Math.random() * 200000) + 30000,
      completedPlans: Math.floor(Math.random() * 20) + 5,
      daysWorked: Math.floor(Math.random() * 20) + 10,
      averageReceipt: Math.floor(Math.random() * 5000) + 1000
    };
  };

  const calculateBonuses = (salesData) => {
    const { totalRevenue, focusSales, sbpSales, completedPlans, averageReceipt } = salesData;

    return {
      revenue: {
        name: 'Бонус за выручку',
        amount: Math.max(0, totalRevenue - 500000) * 0.05,
        target: 500000,
        actual: totalRevenue,
        description: '5% от суммы превышения плана по выручке'
      },
      focus: {
        name: 'Бонус за фокусные товары',
        amount: Math.max(0, focusSales - 100000) * 0.1,
        target: 100000,
        actual: focusSales,
        description: '10% от суммы превышения плана по фокусным товарам'
      },
      sbp: {
        name: 'Бонус за СБП',
        amount: Math.max(0, sbpSales - 50000) * 0.08,
        target: 50000,
        actual: sbpSales,
        description: '8% от суммы превышения плана по СБП'
      },
      plans: {
        name: 'Бонус за выполнение планов',
        amount: completedPlans * 1000,
        target: 15,
        actual: completedPlans,
        description: '1000 руб за каждый выполненный дневной план'
      },
      quality: {
        name: 'Бонус за качество работы',
        amount: averageReceipt > 3000 ? 5000 : 0,
        target: 3000,
        actual: averageReceipt,
        description: '5000 руб за средний чек выше 3000 руб'
      }
    };
  };

  const calculateLevel = (totalBonus, completedPlans) => {
    if (totalBonus > 50000 && completedPlans > 18) return { name: 'Эксперт', color: 'from-purple-500 to-pink-500', multiplier: 1.2 };
    if (totalBonus > 30000 && completedPlans > 12) return { name: 'Профессионал', color: 'from-blue-500 to-cyan-500', multiplier: 1.1 };
    if (totalBonus > 15000 && completedPlans > 8) return { name: 'Специалист', color: 'from-green-500 to-emerald-500', multiplier: 1.05 };
    return { name: 'Новичок', color: 'from-gray-500 to-gray-600', multiplier: 1.0 };
  };

  const getAchievements = (employee, salesData) => {
    const achievements = [];
    
    if (salesData.totalRevenue > 800000) {
      achievements.push({
        name: 'Миллионер',
        description: 'Выручка более 800,000 руб',
        icon: '💰',
        unlocked: true
      });
    }
    
    if (salesData.completedPlans > 15) {
      achievements.push({
        name: 'Стабильность',
        description: 'Более 15 выполненных планов',
        icon: '📈',
        unlocked: true
      });
    }
    
    if (salesData.focusSales > 200000) {
      achievements.push({
        name: 'Фокусный продавец',
        description: 'Продажи фокусных товаров более 200,000 руб',
        icon: '🎯',
        unlocked: true
      });
    }

    // Заблокированные достижения
    if (salesData.totalRevenue <= 800000) {
      achievements.push({
        name: 'Миллионер',
        description: 'Выручка более 800,000 руб',
        icon: '💰',
        unlocked: false
      });
    }

    return achievements;
  };

  const getPeriodName = (period) => {
    const periods = {
      current: 'Текущий месяц',
      previous: 'Прошлый месяц',
      quarter: 'Этот квартал'
    };
    return periods[period] || 'Текущий период';
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('ru-RU');
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Award className="h-6 w-6 text-yellow-400" />;
      case 2: return <Award className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-orange-400" />;
      default: return <Star className="h-4 w-4 text-blue-400" />;
    }
  };

  if (!motivationData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка данных мотивации...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Кнопка назад */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к дашборду
        </button>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Система мотивации</h1>
          <p className="text-gray-400">Бонусы, достижения и рейтинг сотрудников</p>
        </header>

        {/* Период и фильтры */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-gray-300">Период:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-primary"
              >
                <option value="current">Текущий месяц</option>
                <option value="previous">Прошлый месяц</option>
                <option value="quarter">Этот квартал</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('bonuses')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'bonuses' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Gift className="h-4 w-4 mr-2" />
                Бонусы
              </button>
              <button
                onClick={() => setActiveTab('rating')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'rating' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Рейтинг
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'achievements' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Award className="h-4 w-4 mr-2" />
                Достижения
              </button>
            </div>
          </div>
        </div>

        {/* Общая статистика отдела */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Общая сумма бонусов</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(motivationData.departmentStats.totalBonuses)} ₽
                </p>
              </div>
              <Gift className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Средний бонус</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(motivationData.departmentStats.avgBonus)} ₽
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Лучший сотрудник</p>
                <p className="text-lg font-bold text-white truncate">
                  {motivationData.departmentStats.topPerformer?.name.split(' ')[1]}
                </p>
                <p className="text-gray-400 text-sm">
                  {formatCurrency(motivationData.departmentStats.topPerformer?.totalBonus)} ₽
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Выполнено планов</p>
                <p className="text-2xl font-bold text-white">
                  {motivationData.departmentStats.completedPlans}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Содержимое вкладок */}
        {activeTab === 'bonuses' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Детализация бонусов</h2>
            {motivationData.employees.map((employee) => (
              <div key={employee.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${employee.level.color} rounded-full flex items-center justify-center`}>
                      {getRankIcon(employee.rank)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{employee.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>Уровень: {employee.level.name}</span>
                        <span>•</span>
                        <span>Рейтинг: #{employee.rank}</span>
                        <span>•</span>
                        <span>Множитель: x{employee.level.multiplier}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(employee.totalBonus)} ₽
                    </div>
                    <div className="text-gray-400 text-sm">Общий бонус</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(employee.bonuses).map(([key, bonus]) => (
                    <div key={key} className="bg-gray-750 rounded-lg p-4">
                      <div className="text-white font-medium text-sm mb-2">{bonus.name}</div>
                      <div className="text-green-400 font-bold text-lg">{formatCurrency(bonus.amount)} ₽</div>
                      <div className="text-gray-400 text-xs mt-1">{bonus.description}</div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Цель: {formatCurrency(bonus.target)}</span>
                        <span>Факт: {formatCurrency(bonus.actual)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rating' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Рейтинг сотрудников</h2>
            {motivationData.employees.map((employee) => (
              <div key={employee.id} className="card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${employee.level.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                      #{employee.rank}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{employee.name}</h3>
                      <p className="text-gray-400">{employee.role}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-green-400">Бонус: {formatCurrency(employee.totalBonus)} ₽</span>
                        <span className="text-blue-400">Уровень: {employee.level.name}</span>
                        <span className="text-purple-400">Планов: {employee.salesData.completedPlans}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">
                      {employee.level.multiplier}x
                    </div>
                    <div className="text-gray-400 text-sm">Множитель</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <h2 className="text-2xl font-bold text-white col-span-full">Достижения сотрудников</h2>
            {motivationData.employees.map((employee) => (
              <div key={employee.id} className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{employee.name}</h3>
                <div className="space-y-3">
                  {employee.achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        achievement.unlocked
                          ? 'bg-green-500/20 border-green-500/50'
                          : 'bg-gray-700/50 border-gray-600/50 opacity-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <div className={`font-medium ${
                            achievement.unlocked ? 'text-white' : 'text-gray-400'
                          }`}>
                            {achievement.name}
                          </div>
                          <div className="text-sm text-gray-400">{achievement.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Motivation;