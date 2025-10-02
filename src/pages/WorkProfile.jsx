import React, { useState, useEffect } from 'react';
import { User, Settings, Calendar, Award, Mail, Phone, Edit, Save, Store, Lock, Bell, Download } from 'lucide-react';
import { dataService } from '../services/dataService';
import { useNotifications } from '../contexts/NotificationContext';
import Modal from '../components/ui/Modal';

const WorkProfile = ({ userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    phone: '', 
    email: '' 
  });
  
  // Состояния для модальных окон
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const { addNotification } = useNotifications();

  // Загрузка данных профиля и подписка на изменения
  useEffect(() => {
    loadProfileData();
    
    // Подписка на изменения данных
    const unsubscribe = dataService.subscribe(() => {
      console.log('WorkProfile: получено уведомление об изменении данных');
      loadProfileData();
    });
    
    // Отписка при размонтировании компонента
    return unsubscribe;
  }, [userData]);

  const loadProfileData = () => {
    if (userData?.employeeId) {
      const employee = dataService.getEmployeeById(userData.employeeId);
      console.log('WorkProfile: загрузка данных профиля:', employee);
      if (employee) {
        setProfileData(employee);
        setEditForm({
          name: employee.name,
          phone: employee.phone,
          email: employee.email || 'employee@epc.ru'
        });
      } else {
        // Если сотрудник не найден, используем данные из userData
        console.log('Сотрудник не найден, используем userData:', userData);
        setProfileData(userData);
        setEditForm({
          name: userData.name,
          phone: userData.phone,
          email: userData.email || 'employee@epc.ru'
        });
      }
    }
  };

  const handleSave = () => {
    if (!editForm.name.trim()) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Поле ФИО обязательно для заполнения'
      });
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editForm.email && !emailRegex.test(editForm.email)) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Введите корректный email адрес'
      });
      return;
    }

    console.log('Сохранение изменений профиля:', editForm);
    const success = dataService.updateEmployee(userData.employeeId, editForm);
    
    if (success) {
      addNotification({
        type: 'success',
        title: 'Профиль обновлен',
        message: 'Данные успешно сохранены'
      });
      setIsEditing(false);
      // loadProfileData() вызовется автоматически через подписку
    } else {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось сохранить данные'
      });
    }
  };

  // Функции для открытия модальных окон
  const handlePasswordChange = () => {
    setIsPasswordModalOpen(true);
  };

  const handleNotificationsSettings = () => {
    setIsNotificationsModalOpen(true);
  };

  const handleExportData = () => {
    setIsExportModalOpen(true);
  };

  // Функция для получения данных с fallback значениями
  const getProfileValue = (field, fallback) => {
    return profileData?.[field] || userData?.[field] || fallback;
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Профиль работы</h1>
            <p className="text-gray-400">Управление вашим рабочим профилем и настройками</p>
          </div>
          
          <button
            onClick={() => setIsEditing(true)}
            className="btn-primary flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Редактировать профиль
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация - увеличенная высота */}
          <div className="card p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 lg:col-span-2 min-h-[400px]">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {getProfileValue('name', 'Иванов Иван Иванович')}
                </h2>
                <p className="text-gray-400 capitalize text-lg">
                  {getProfileValue('role', 'Сотрудник')}
                </p>
                <p className="text-sm text-gray-500">
                  Табельный номер: {getProfileValue('employeeId', '333')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-750 rounded-lg border border-gray-600">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Должность</h3>
                <p className="text-white text-lg font-medium">
                  {getProfileValue('position', 'Продавец-консультант')}
                </p>
              </div>
              <div className="p-4 bg-gray-750 rounded-lg border border-gray-600">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Отдел</h3>
                <p className="text-white text-lg font-medium">
                  {getProfileValue('department', 'Продажи')}
                </p>
              </div>
              <div className="p-4 bg-gray-750 rounded-lg border border-gray-600">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Дата найма</h3>
                <p className="text-white text-lg font-medium">
                  {getProfileValue('hireDate', '15.01.2024')}
                </p>
              </div>
              <div className="p-4 bg-gray-750 rounded-lg border border-gray-600">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Статус</h3>
                <p className="text-green-400 text-lg font-medium">Активен</p>
              </div>
            </div>

            {/* Контакты в основной карточке */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Контактная информация</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-750 rounded-lg border border-gray-600">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-sm text-gray-400">Телефон</div>
                    <div className="text-white font-medium">
                      {getProfileValue('phone', '+7 (999) 123-45-67')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-750 rounded-lg border border-gray-600">
                  <Mail className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="text-sm text-gray-400">Email</div>
                    <div className="text-white font-medium">
                      {getProfileValue('email', 'employee@epc.ru')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-750 rounded-lg border border-gray-600">
                  <Mail className="h-5 w-5 text-orange-400" />
                  <div>
                    <div className="text-sm text-gray-400">Telegram</div>
                    <div className="text-white font-medium">
                      {getProfileValue('telegram', '@username')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-750 rounded-lg border border-gray-600">
                  <Calendar className="h-5 w-5 text-yellow-400" />
                  <div>
                    <div className="text-sm text-gray-400">Дата рождения</div>
                    <div className="text-white font-medium">
                      {getProfileValue('birthDate', '15.03.1990')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            <div className="card p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-400" />
                Быстрые действия
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={handlePasswordChange}
                  className="w-full p-3 bg-gray-750 hover:bg-gray-700 rounded-lg text-white text-left transition-colors border border-gray-600 hover:border-gray-500 flex items-center"
                >
                  <Lock className="h-4 w-4 mr-3 text-blue-400" />
                  Сменить пароль
                </button>
                <button 
                  onClick={handleNotificationsSettings}
                  className="w-full p-3 bg-gray-750 hover:bg-gray-700 rounded-lg text-white text-left transition-colors border border-gray-600 hover:border-gray-500 flex items-center"
                >
                  <Bell className="h-4 w-4 mr-3 text-green-400" />
                  Настройки уведомлений
                </button>
                <button 
                  onClick={handleExportData}
                  className="w-full p-3 bg-gray-750 hover:bg-gray-700 rounded-lg text-white text-left transition-colors border border-gray-600 hover:border-gray-500 flex items-center"
                >
                  <Download className="h-4 w-4 mr-3 text-orange-400" />
                  Экспорт данных
                </button>
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-400" />
                Статистика
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Рабочих дней:</span>
                  <span className="text-white font-bold text-lg">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Выполнено планов:</span>
                  <span className="text-white font-bold text-lg">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Рейтинг:</span>
                  <span className="text-yellow-400 font-bold text-lg">#3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Дополнительные разделы */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-400" />
              График работы
            </h3>
            <div className="space-y-3">
              {['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'].map(day => (
                <div key={day} className="flex justify-between items-center p-3 hover:bg-gray-750 rounded-lg transition-colors">
                  <span className="text-gray-300">{day}</span>
                  <span className="text-white font-medium">09:00 - 18:00</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Место работы</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Store className="h-5 w-5 text-purple-400" />
                <div>
                  <div className="text-gray-400 text-sm">Магазины:</div>
                  <div className="text-white font-medium">
                    {Array.isArray(getProfileValue('stores', ['ЕРС 2334'])) 
                      ? getProfileValue('stores', ['ЕРС 2334']).join(', ')
                      : 'ЕРС 2334'
                    }
                  </div>
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Адрес:</div>
                <p className="text-white">ТЦ "Мега", 2 этаж</p>
              </div>
            </div>
          </div>
        </div>

        {/* Модальное окно редактирования профиля */}
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title="Редактировать профиль"
          size="md"
        >
          <div className="space-y-6">
            {/* ФИО */}
            <div className="flex items-center justify-between space-x-4">
              <label className="form-label flex items-center text-lg font-medium text-white min-w-[120px]">
                <User className="h-5 w-5 mr-3 text-blue-400" />
                ФИО *
              </label>
              <div className="flex-1">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field text-lg bg-gray-750 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Иванов Иван Иванович"
                />
              </div>
            </div>

            {/* Телефон */}
            <div className="flex items-center justify-between space-x-4">
              <label className="form-label flex items-center text-lg font-medium text-white min-w-[120px]">
                <Phone className="h-5 w-5 mr-3 text-green-400" />
                Телефон
              </label>
              <div className="flex-1">
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field bg-gray-750 border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between space-x-4">
              <label className="form-label flex items-center text-lg font-medium text-white min-w-[120px]">
                <Mail className="h-5 w-5 mr-3 text-orange-400" />
                Email *
              </label>
              <div className="flex-1">
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field bg-gray-750 border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  placeholder="employee@epc.ru"
                />
                <div className="text-sm text-gray-400 mt-2">
                  Будет использоваться для уведомлений и входа в систему
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 btn-secondary py-3 rounded-xl"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="flex-1 btn-primary flex items-center justify-center py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Сохранить изменения
            </button>
          </div>
        </Modal>

        {/* Модальное окно смены пароля */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title="Сменить пароль"
          size="sm"
        >
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Скоро здесь появится</h3>
            <p className="text-gray-300 mb-6">Функция смены пароля находится в разработке</p>
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="w-full btn-primary py-3 rounded-xl"
            >
              Понятно
            </button>
          </div>
        </Modal>

        {/* Модальное окно настроек уведомлений */}
        <Modal
          isOpen={isNotificationsModalOpen}
          onClose={() => setIsNotificationsModalOpen(false)}
          title="Настройки уведомлений"
          size="sm"
        >
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Скоро здесь появится</h3>
            <p className="text-gray-300 mb-6">Настройка уведомлений находится в разработке</p>
            <button
              onClick={() => setIsNotificationsModalOpen(false)}
              className="w-full btn-primary py-3 rounded-xl"
            >
              Понятно
            </button>
          </div>
        </Modal>

        {/* Модальное окно экспорта данных */}
        <Modal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title="Экспорт данных"
          size="sm"
        >
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="h-8 w-8 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Скоро здесь появится</h3>
            <p className="text-gray-300 mb-6">Функция экспорта данных находится в разработке</p>
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="w-full btn-primary py-3 rounded-xl"
            >
              Понятно
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default WorkProfile;