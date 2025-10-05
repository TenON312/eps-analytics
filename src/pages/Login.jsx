import React, { useState } from 'react';
import { LogIn, Store, User } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Тестовые данные сотрудников (временные)
  const mockEmployees = {
    '12345': {
      name: 'Иванов Иван Иванович',
      employeeId: '12345',
      phone: '+7 (999) 123-45-67',
      telegram: '@ivanov',
      birthDate: '15.03.1990',
      stores: ['ЕРС 2334'],
      role: 'Сотрудник'
    },
    '12346': {
      name: 'Петрова Анна Сергеевна',
      employeeId: '12346',
      phone: '+7 (999) 123-45-68',
      telegram: '@petrova',
      birthDate: '20.07.1985',
      stores: ['ЕРС 2334'],
      role: 'ЗДМ'
    },
    '12347': {
      name: 'Федоров Александр',
      employeeId: '12347',
      phone: '+7 (999) 123-45-69',
      telegram: '@sidorov',
      birthDate: '10.11.1992',
      stores: ['ЕРС 2312'],
      role: 'Админ'
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      setError('Введите табельный номер');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Имитация проверки аутентификации
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const employeeData = mockEmployees[employeeId];
      if (employeeData) {
        onLogin(employeeData);
      } else {
        // Если сотрудник не найден, создаем временного
        onLogin({
          name: `Сотрудник ${employeeId}`,
          employeeId: employeeId,
          phone: 'Не указан',
          telegram: 'Не указан',
          birthDate: 'Не указана',
          stores: ['ЕРС 2334'],
          role: 'Сотрудник'
        });
      }
    } catch (err) {
      setError('Ошибка входа. Проверьте табельный номер');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Заголовок */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Store className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-3xl font-bold text-white">ЕРС Аналитика</h2>
          <p className="mt-2 text-gray-400">Вход в систему</p>
        </div>

        {/* Форма входа */}
        <form onSubmit={handleLogin} className="mt-8 space-y-6 card p-8">
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-300 mb-2">
              Табельный номер
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите ваш табельный номер"
              />
            </div>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Вход...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Войти в систему
              </>
            )}
          </button>
        </form>

        {/* Информация для тестирования */}
        <div className="text-center text-gray-500 text-sm">
          <p>Тестовые номера: 12345, 12346, 12347</p>
        </div>
      </div>
    </div>
  );
};

export default Login;