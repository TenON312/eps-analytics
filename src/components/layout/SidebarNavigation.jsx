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
  PieChart,
  Database,
  Target,
  LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SidebarNavigation = ({ userData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Основная навигация
  const navigationItems = [
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

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти из системы?')) {
      logout();
    }
  };

  return (
    <nav className="sidebar bg-gray-900 border-r border-gray-800 flex flex-col h-full relative">
      {/* Заголовок */}
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

      {/* Основная навигация */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-2 px-3">
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
                className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-all duration-200 h-12 ${
                  isActive(item.href)
                    ? 'bg-purple-600 text-white shadow-lg border border-purple-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${
                  isActive(item.href) ? 'text-white' : 'text-gray-400'
                }`} />
                <span className="truncate text-left">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Кнопка выхода - ФИКСИРОВАННАЯ и ГАРАНТИРОВАННО ВИДИМАЯ */}
      <div className="p-4 border-t border-gray-800 bg-gray-800 flex-shrink-0" style={{ position: 'sticky', bottom: 0, zIndex: 1000 }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center p-4 rounded-lg text-base font-semibold text-white bg-red-600 hover:bg-red-700 transition-all duration-200 h-14 border-2 border-red-500 shadow-lg hover:shadow-red-500/30"
          style={{
            backgroundColor: '#dc2626',
            minHeight: '56px'
          }}
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Выйти из системы</span>
        </button>
      </div>
    </nav>
  );
};

export default SidebarNavigation;