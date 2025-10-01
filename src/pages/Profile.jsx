import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Store, Shield, Save, Edit } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const Profile = ({ userData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    telegram: userData?.telegram || '',
    birthDate: userData?.birthDate || ''
  });
  const { addNotification } = useNotifications();

  const handleSave = () => {
    // В реальном приложении здесь будет сохранение в API
    addNotification({
      type: 'success',
      title: 'Профиль обновлен',
      message: 'Данные успешно сохранены'
    });
    setIsEditing(false);
  };

  const roleDisplayNames = {
    'Сотрудник': 'Сотрудник магазина',
    'ЗДМ': 'Заместитель директора магазина',
    'ДТК': 'Директор территории качества',
    'Админ': 'Администратор системы'
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Профиль</h1>
            <p className="text-gray-400">Управление вашими данными</p>
          </div>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="btn-primary flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Основная информация</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">ФИО</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="input-primary"
                    />
                  ) : (
                    <div className="flex items-center text-white">
                      <User className="h-5 w-5 mr-3 text-gray-400" />
                      {userData?.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Телефон</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="input-primary"
                    />
                  ) : (
                    <div className="flex items-center text-white">
                      <Phone className="h-5 w-5 mr-3 text-gray-400" />
                      {userData?.phone}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Telegram</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.telegram}
                      onChange={(e) => setFormData(prev => ({ ...prev, telegram: e.target.value }))}
                      className="input-primary"
                    />
                  ) : (
                    <div className="flex items-center text-white">
                      <Mail className="h-5 w-5 mr-3 text-gray-400" />
                      {userData?.telegram}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Дата рождения</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="input-primary"
                      placeholder="ДД.ММ.ГГГГ"
                    />
                  ) : (
                    <div className="flex items-center text-white">
                      <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                      {userData?.birthDate}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Боковая панель с информацией */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Информация о роли</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Роль:</span>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="text-white font-medium">
                      {roleDisplayNames[userData?.role] || userData?.role}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Табельный номер:</span>
                  <span className="text-white font-mono">{userData?.employeeId}</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Магазины</h3>
              
              <div className="space-y-2">
                {userData?.stores?.map((store, index) => (
                  <div key={index} className="flex items-center text-gray-300">
                    <Store className="h-4 w-4 mr-2 text-green-400" />
                    {store}
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Статистика</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">В системе с:</span>
                  <span className="text-white">
                    {new Date().toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Активность:</span>
                  <span className="text-green-400">Активен</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;