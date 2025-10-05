import React from 'react';
import { 
  BarChart3,
  Calendar,
  Users,
  Settings,
  Shield,
  TrendingUp,
  Bell,
  Store,
  User,
  PieChart,
  Database,
  Target,
  LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SidebarNavigation = ({ userData, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Основная навигация - единый список
  const navigationItems = [
      // Разделитель

      { name: 'Дашборд', href: '/dashboard', icon: BarChart3 },
      
      { name: 'График работы', href: '/schedule', icon: Calendar },
      { name: 'Сотрудники', href: '/team', icon: Users },
      { name: 'Профиль работы', href: '/work-profile', icon: Target },
      { name: 'Отчеты', href: '/reports', icon: Database },
      { type: 'divider' },

      { name: 'Аналитика', href: '/analytics', icon: PieChart },
      { name: 'Расширенная аналитика', href: '/advanced-analytics', icon: TrendingUp },
  ];

  // Админские пункты
  const adminItems = [
    { type: 'divider' },
    { name: 'Планирование', href: '/plans', icon: Settings },
    { name: 'Админ панель', href: '/admin', icon: Shield },
    { name: 'Заявки', href: '/requests', icon: Bell },
  ];

  // Добавляем админские разделы если нужно
  if (userData?.role === 'ЗДМ' || userData?.role === 'ДТК' || userData?.role === 'Админ') {
    navigationItems.push(...adminItems);
  }

  const isActive = (href) => location.pathname === href;

  return (
    <nav className="sidebar bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* ЗАГОЛОВОК ВОССТАНОВЛЕН */}
      <div className="p-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">EPC Аналитика</h1>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <div className="flex-grow overflow-y-auto py-4">
        <div className="space-y-3 px-3">
          {navigationItems.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div key={`divider-${index}`} className="border-t border-gray-700 my-4"></div>
              );
            }

            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center p-4 rounded-lg text-sm font-medium transition-all duration-200 h-12 justify-start ${
                  isActive(item.href)
                    ? 'bg-purple-600 text-white shadow-lg border border-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                style={{ textAlign: 'left' }}
              >
                <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${
                  isActive(item.href) ? 'text-white' : 'text-gray-400'
                }`} />
                <span className="truncate flex-1 text-left">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Нижняя часть - профиль пользователя и кнопка выхода */}
      <div className="border-t border-gray-800 p-4 flex-shrink-0 bg-gray-850 space-y-3">
        {/* Профиль пользователя */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate text-left">
              {userData?.name || 'Иванов И.И.'}
            </p>
            <p className="text-xs text-gray-400 truncate text-left">
              {userData?.role || 'Сотрудник'}
            </p>
            {/* Статус онлайн */}
            <div className="flex items-center mt-1 justify-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-400">Онлайн</span>
            </div>
          </div>
        </div>

        {/* Кнопка выхода */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-start p-4 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200 h-12"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Выйти</span>
        </button>
      </div>
    </nav>
  );
};

export default SidebarNavigation;