// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { BarChart3, Package, CreditCard, Calendar, PlusCircle, Users, RefreshCw, Bell, TrendingUp, Download, Trophy, Target, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProgressChart from '../components/charts/ProgressChart';
import { dashboardService } from '../services/dataService';
import { useNotifications } from '../contexts/NotificationContext';
import { exportService } from '../services/exportService';
import { notificationService } from '../services/notificationService';
import { motivationService } from '../services/motivationService';

const Dashboard = ({ userData }) => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [todayStats, setTodayStats] = useState({ total: 0, entries: [] });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [recentAchievements, setRecentAchievements] = useState([]);

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    setError(null);
    
    try {
      const data = dashboardService.getDashboardData();
      const stats = dashboardService.getTodayStats();
      
      if (data && typeof data === 'object') {
        setDashboardData(data);
      } else {
        setDashboardData({
          revenue: { plan: 150000, fact: 0, title: 'Выручка' },
          focus: { plan: 50000, fact: 0, title: 'Фокусные товары' },
          sbp: { plan: 30000, fact: 0, title: 'СБП' }
        });
      }
      
      if (stats && typeof stats === 'object') {
        setTodayStats(stats);
      } else {
        setTodayStats({ total: 0, entries: [] });
      }
      
      if (data) {
        checkPlanCompletion(data);
      }
      
      loadMotivationData();
      
    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
      setError('Не удалось загрузить данные. Попробуйте обновить страницу.');
      
      setDashboardData({
        revenue: { plan: 150000, fact: 0, title: 'Выручка' },
        focus: { plan: 50000, fact: 0, title: 'Фокусные товары' },
        sbp: { plan: 30000, fact: 0, title: 'СБП' }
      });
      setTodayStats({ total: 0, entries: [] });
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadMotivationData = () => {
    try {
      if (userData) {
        const leaderboardData = motivationService.getLeaderboard(5);
        const userStatsData = motivationService.getEmployeeStats(userData.employeeId);
        const achievementsData = motivationService.getRecentAchievements(3);
        
        setLeaderboard(leaderboardData);
        setUserStats(userStatsData);
        setRecentAchievements(achievementsData);
      }
    } catch (error) {
      console.warn('Мотивационные данные недоступны:', error);
    }
  };

  const checkPlanCompletion = (data) => {
    if (!data || typeof data !== 'object') return;

    const today = new Date().toISOString().split('T')[0];
    const lastCheck = localStorage.getItem(`lastPlanCheck-${today}`) || '';
    
    const now = new Date().toISOString();
    if (lastCheck && (new Date(now) - new Date(lastCheck)) < 30 * 60 * 1000) {
      return;
    }

    const { revenue, focus, sbp } = data;

    if (revenue && revenue.fact >= revenue.plan && revenue.plan > 0) {
      if (!lastCheck.includes('revenue')) {
        motivationService.recordAchievement(
          userData?.employeeId,
          'revenue',
          revenue.fact,
          revenue.plan,
          today
        );
        
        addNotification({
          type: 'plan',
          title: '🎉 План по выручке выполнен!',
          message: `Факт: ${revenue.fact.toLocaleString('ru-RU')} ₽ из ${revenue.plan.toLocaleString('ru-RU')} ₽`
        });
        localStorage.setItem(`lastPlanCheck-${today}`, lastCheck + 'revenue,');
      }
    }

    if (focus && focus.fact >= focus.plan && focus.plan > 0) {
      if (!lastCheck.includes('focus')) {
        motivationService.recordAchievement(
          userData?.employeeId,
          'focus',
          focus.fact,
          focus.plan,
          today
        );
        
        addNotification({
          type: 'plan',
          title: '🎉 План по фокусным товарам выполнен!',
          message: `Факт: ${focus.fact.toLocaleString('ru-RU')} ₽ из ${focus.plan.toLocaleString('ru-RU')} ₽`
        });
        localStorage.setItem(`lastPlanCheck-${today}`, lastCheck + 'focus,');
      }
    }

    if (sbp && sbp.fact >= sbp.plan && sbp.plan > 0) {
      if (!lastCheck.includes('sbp')) {
        motivationService.recordAchievement(
          userData?.employeeId,
          'sbp',
          sbp.fact,
          sbp.plan,
          today
        );
        
        addNotification({
          type: 'plan',
          title: '🎉 План по СБП выполнен!',
          message: `Факт: ${sbp.fact.toLocaleString('ru-RU')} ₽ из ${sbp.plan.toLocaleString('ru-RU')} ₽`
        });
        localStorage.setItem(`lastPlanCheck-${today}`, lastCheck + 'sbp,');
      }
    }
  };

  const handleExport = () => {
    if (!dashboardData) {
      addNotification({
        type: 'error',
        title: 'Ошибка экспорта',
        message: 'Нет данных для экспорта'
      });
      return;
    }

    const success = exportService.exportDashboardData(dashboardData, todayStats);
    
    if (success) {
      addNotification({
        type: 'success',
        title: 'Экспорт завершен',
        message: 'Данные успешно экспортированы'
      });
    } else {
      addNotification({
        type: 'warning',
        title: 'Экспорт в CSV',
        message: 'Данные экспортированы в CSV (установите xlsx для Excel)'
      });
    }
  };

  useEffect(() => {
    loadDashboardData();
    
    const interval = setInterval(() => {
      loadDashboardData();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    {
      id: 'data-entry',
      label: 'Внести данные',
      description: 'Добавить показатели за сегодня',
      icon: PlusCircle,
      color: 'blue',
      onClick: () => navigate('/data-entry')
    },
    {
      id: 'schedule',
      label: 'График работы',
      description: 'Посмотреть расписание',
      icon: Calendar,
      color: 'green',
      onClick: () => navigate('/schedule')
    },
    {
      id: 'team',
      label: 'Сотрудники',
      description: 'Информация о коллегах',
      icon: Users,
      color: 'purple',
      onClick: () => navigate('/team')
    }
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'text-blue-400',
      green: 'text-green-400',
      purple: 'text-purple-400'
    };
    return colors[color] || 'text-blue-400';
  };

  const renderEntry = (entry, index) => {
    try {
      if (!entry || typeof entry !== 'object') {
        return (
          <div key={index} className="p-3 bg-yellow-900/20 rounded-lg text-yellow-400">
            Некорректные данные записи
          </div>
        );
      }

      const employeeName = typeof entry.employeeName === 'string' 
        ? entry.employeeName 
        : `Сотрудник ${entry.employeeId || 'неизвестен'}`;
      
      const focus = parseInt(entry.focus) || 0;
      const sbp = parseInt(entry.sbp) || 0;
      const cash = parseInt(entry.cash) || 0;
      const total = focus + sbp + cash;
      
      let timestamp = 'неизвестно';
      try {
        if (entry.timestamp) {
          timestamp = new Date(entry.timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (e) {
        console.warn('Ошибка форматирования времени:', e);
      }

      return (
        <div key={index} className="flex justify-between items-center p-3 bg-gray-750 rounded-lg">
          <span className="text-gray-300 truncate max-w-[120px]">{employeeName}</span>
          <span className="text-white font-medium flex-shrink-0 mx-2">
            {total.toLocaleString('ru-RU')} ₽
          </span>
          <span className="text-gray-400 text-sm flex-shrink-0">{timestamp}</span>
        </div>
      );
    } catch (error) {
      console.error('Ошибка отображения записи:', entry, error);
      return (
        <div key={index} className="p-3 bg-red-900/20 rounded-lg text-red-400">
          Ошибка отображения данных
        </div>
      );
    }
  };

  const MotivationSection = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Мой прогресс</h3>
          <Trophy className="h-5 w-5 text-yellow-400" />
        </div>
        {userStats ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Всего баллов:</span>
              <span className="text-2xl font-bold text-yellow-400">
                {userStats.totalPoints}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Баллов за месяц:</span>
              <span className="text-xl font-semibold text-green-400">
                {userStats.monthlyPoints}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Достижений:</span>
              <span className="text-lg text-blue-400">
                {userStats.totalAchievements}
              </span>
            </div>
            {userStats.monthlyRank > 0 && (
              <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                <span className="text-gray-400">Место в рейтинге:</span>
                <span className="text-lg font-semibold text-purple-400">
                  #{userStats.monthlyRank}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Target className="h-12 w-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">Начните работать с планами для получения баллов</p>
            <button
              onClick={() => navigate('/data-entry')}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
            >
              Внести первые данные
            </button>
          </div>
        )}
      </div>

      <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Топ сотрудников</h3>
          <Crown className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="space-y-3">
          {leaderboard.length > 0 ? (
            leaderboard.map((employee, index) => {
              const isCurrentUser = employee.employeeId === userData?.employeeId;
              return (
                <div 
                  key={employee.employeeId} 
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    isCurrentUser 
                      ? 'bg-blue-500/20 border border-blue-500/50' 
                      : 'bg-gray-750 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 shadow-lg' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <span className={`font-medium ${isCurrentUser ? 'text-blue-400' : 'text-gray-300'}`}>
                        {isCurrentUser ? 'Вы' : `Сотрудник ${employee.employeeId}`}
                      </span>
                      {isCurrentUser && (
                        <div className="text-xs text-blue-400">Это вы!</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-yellow-400 font-semibold block">
                      {employee.monthlyPoints} баллов
                    </span>
                    <span className="text-xs text-gray-400">
                      {employee.totalAchievements} достижений
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-4">
              <Users className="h-12 w-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Рейтинг формируется</p>
              <p className="text-gray-500 text-sm">Выполняйте планы для поднятия в рейтинге</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const RecentAchievements = () => (
    <div className="card p-6 mt-6 bg-gray-800 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Последние достижения</h3>
        <Trophy className="h-5 w-5 text-yellow-400" />
      </div>
      
      {recentAchievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentAchievements.map((achievement, index) => (
            <div 
              key={achievement.id} 
              className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                achievement.type === 'revenue' ? 'border-blue-500/50 bg-blue-500/10' :
                achievement.type === 'focus' ? 'border-green-500/50 bg-green-500/10' :
                'border-purple-500/50 bg-purple-500/10'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  achievement.type === 'revenue' ? 'bg-blue-500/20' :
                  achievement.type === 'focus' ? 'bg-green-500/20' :
                  'bg-purple-500/20'
                }`}>
                  {achievement.type === 'revenue' && <TrendingUp className="h-5 w-5 text-blue-400" />}
                  {achievement.type === 'focus' && <Target className="h-5 w-5 text-green-400" />}
                  {achievement.type === 'sbp' && <BarChart3 className="h-5 w-5 text-purple-400" />}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${
                    achievement.type === 'revenue' ? 'text-blue-400' :
                    achievement.type === 'focus' ? 'text-green-400' :
                    'text-purple-400'
                  }`}>
                    {achievement.type === 'revenue' ? 'Выручка' :
                     achievement.type === 'focus' ? 'Фокусные' : 'СБП'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(achievement.date).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Факт:</span>
                  <span className="text-white font-medium">
                    {achievement.fact.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">План:</span>
                  <span className="text-white">
                    {achievement.plan.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Выполнение:</span>
                  <span className={`font-semibold ${
                    achievement.percentage >= 100 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {achievement.percentage}%
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-600">
                  <span className="text-gray-400">Баллы:</span>
                  <span className="text-yellow-400 font-bold">
                    +{achievement.points}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Пока нет достижений</p>
          <p className="text-gray-500 text-sm mt-1">
            Выполняйте планы, чтобы получать достижения и баллы
          </p>
        </div>
      )}
    </div>
  );

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка данных...</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Повторить загрузку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Дашборд</h1>
              <p className="text-gray-400">
                {new Date().toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm border border-gray-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </button>
              <button
                onClick={loadDashboardData}
                disabled={isRefreshing}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 text-sm border border-gray-600"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Обновить
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <p className="text-yellow-400">{error}</p>
          </div>
        )}

        {/* 🔥 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Карточки прогресса горизонтально */}
        <div className="dashboard-progress-cards">
          {['revenue', 'focus', 'sbp'].map((type, index) => {
            const data = dashboardData[type];
            const icons = [BarChart3, Package, CreditCard];
            const colors = ['text-blue-400', 'text-green-400', 'text-purple-400'];
            const Icon = icons[index];
            
            return (
              <div key={type} className="card bg-gray-800 rounded-xl border border-gray-700 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{data.title}</h3>
                  <Icon className={`h-5 w-5 ${colors[index]}`} />
                </div>
                <div className="flex-grow flex flex-col justify-center">
                  <ProgressChart data={data} />
                </div>
                <div className="mt-4 flex justify-between items-center text-sm pt-3 border-t border-gray-600">
                  <span className="text-gray-400">Осталось:</span>
                  <span className="text-white font-medium">
                    {Math.max(0, (data.plan || 0) - (data.fact || 0)).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Быстрые действия */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="card p-6 text-left hover:bg-gray-750 transition-all duration-300 bg-gray-800 rounded-xl border border-gray-700 flex flex-col justify-center"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{action.label}</h3>
                    <p className="text-gray-400 text-sm">{action.description}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${getColorClass(action.color)} transition-transform`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Дополнительные карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Прогресс дня</h3>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div className="space-y-3">
              {['revenue', 'focus', 'sbp'].map((type) => {
                const data = dashboardData[type];
                const percentage = data.plan ? Math.round(((data.fact || 0) / data.plan) * 100) : 0;
                return (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-gray-400">{data.title}:</span>
                    <span className="text-white font-medium">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Сводка</h3>
              <BarChart3 className="h-5 w-5 text-green-400" />
            </div>
            <div className="space-y-3">
              {['revenue', 'focus', 'sbp'].map((type) => {
                const data = dashboardData[type];
                return (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-gray-400">{data.title}:</span>
                    <span className="text-white font-medium">{(data.fact || 0).toLocaleString('ru-RU')} ₽</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Сегодняшние данные */}
        <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Сегодняшние данные</h3>
          
          {todayStats.entries && todayStats.entries.length > 0 ? (
            <>
              <div className="space-y-3">
                {todayStats.entries.map((entry, index) => renderEntry(entry, index))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Общая сумма за сегодня:</span>
                  <span className="text-xl font-bold text-white">
                    {(todayStats.total || 0).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Данных за сегодня еще нет</p>
              <button
                onClick={() => navigate('/data-entry')}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Внести первые данные
              </button>
            </div>
          )}
        </div>

        {/* Мотивационная секция */}
        <MotivationSection />

        {/* Последние достижения */}
        <RecentAchievements />
      </div>
    </div>
  );
};

export default Dashboard;