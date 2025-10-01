// src/pages/WorkProfile.jsx
import React from 'react';
import { User, Settings, Calendar, Award } from 'lucide-react';

const WorkProfile = ({ userData }) => {
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Профиль работы</h1>
          <p className="text-gray-400">Управление вашим рабочим профилем и настройками</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700 lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{userData?.name || 'Иванов Иван Иванович'}</h2>
                <p className="text-gray-400 capitalize">{userData?.role || 'Сотрудник'}</p>
                <p className="text-sm text-gray-500">ID: {userData?.employeeId || '333'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-750 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Должность</h3>
                <p className="text-white">{userData?.position || 'Продавец-консультант'}</p>
              </div>
              <div className="p-4 bg-gray-750 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Отдел</h3>
                <p className="text-white">{userData?.department || 'Продажи'}</p>
              </div>
              <div className="p-4 bg-gray-750 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Дата найма</h3>
                <p className="text-white">{userData?.hireDate || '15.01.2024'}</p>
              </div>
              <div className="p-4 bg-gray-750 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Статус</h3>
                <p className="text-green-400">Активен</p>
              </div>
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-400" />
                Быстрые действия
              </h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gray-750 hover:bg-gray-700 rounded-lg text-white text-left transition-colors">
                  Сменить пароль
                </button>
                <button className="w-full p-3 bg-gray-750 hover:bg-gray-700 rounded-lg text-white text-left transition-colors">
                  Настройки уведомлений
                </button>
                <button className="w-full p-3 bg-gray-750 hover:bg-gray-700 rounded-lg text-white text-left transition-colors">
                  Экспорт данных
                </button>
              </div>
            </div>

            <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-400" />
                Статистика
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Рабочих дней:</span>
                  <span className="text-white">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Выполнено планов:</span>
                  <span className="text-white">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Рейтинг:</span>
                  <span className="text-yellow-400">#3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Дополнительные разделы */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-400" />
              График работы
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between p-2 hover:bg-gray-750 rounded">
                <span className="text-gray-300">Понедельник</span>
                <span className="text-white">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between p-2 hover:bg-gray-750 rounded">
                <span className="text-gray-300">Вторник</span>
                <span className="text-white">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between p-2 hover:bg-gray-750 rounded">
                <span className="text-gray-300">Среда</span>
                <span className="text-white">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between p-2 hover:bg-gray-750 rounded">
                <span className="text-gray-300">Четверг</span>
                <span className="text-white">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between p-2 hover:bg-gray-750 rounded">
                <span className="text-gray-300">Пятница</span>
                <span className="text-white">09:00 - 18:00</span>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Контакты</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Email:</span>
                <p className="text-white">employee@epc.ru</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Телефон:</span>
                <p className="text-white">+7 (999) 123-45-67</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Место работы:</span>
                <p className="text-white">ТЦ "Мега", 2 этаж</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkProfile;