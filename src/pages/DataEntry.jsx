import React, { useState, useEffect } from 'react';
import { Save, Calculator, RotateCcw, ArrowLeft } from 'lucide-react';
import { dataService } from '../services/dataService';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import { offlineService } from '../services/offlineService';
import { notificationService } from '../services/notificationService';

const DataEntry = ({ userData }) => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState({
    focus: '',
    sbp: '',
    cash: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [todayData, setTodayData] = useState({ focus: 0, sbp: 0, cash: 0 });
  const [error, setError] = useState('');

  // Загружаем сегодняшние данные при монтировании компонента
  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = dataService.getDailyRevenue(today);
      setTodayData(data || { focus: 0, sbp: 0, cash: 0 });
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      setTodayData({ focus: 0, sbp: 0, cash: 0 });
    }
  };

  const handleInputChange = (field, value) => {
    // Разрешаем только цифры
    const numericValue = value.replace(/[^\d]/g, '');
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
    setError(''); // Очищаем ошибку при изменении данных
  };

  const calculateTotal = () => {
    const focus = parseInt(formData.focus) || 0;
    const sbp = parseInt(formData.sbp) || 0;
    const cash = parseInt(formData.cash) || 0;
    return focus + sbp + cash;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (calculateTotal() === 0) {
      setError('Введите данные хотя бы в одно поле');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const today = new Date().toISOString().split('T')[0];
      const employeeId = userData?.employeeId || 'unknown';
      const employeeName = userData?.name || 'Неизвестный сотрудник';
      
      const revenueData = {
        focus: formData.focus || '0',
        sbp: formData.sbp || '0',
        cash: formData.cash || '0'
      };

      console.log('Сохранение данных:', { today, employeeId, employeeName, revenueData });

      // Используем офлайн-сервис для выполнения
      const success = await offlineService.executeWithOfflineSupport(
        'saveRevenueEntry',
        async () => {
          return dataService.saveRevenueEntry(today, employeeId, employeeName, revenueData);
        },
        { today, employeeId, employeeName, revenueData }
      );

      if (success) {
        addNotification({
          type: 'success',
          title: 'Данные сохранены!',
          message: `Успешно внесено ${calculateTotal().toLocaleString('ru-RU')} ₽`
        });
        
        notificationService.showDataSaved(calculateTotal());
        
        setLastSaved(new Date());
        loadTodayData();
        setFormData({ focus: '', sbp: '', cash: '' });
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      
      if (error.message.includes('офлайн') || error.message.includes('отложено')) {
        addNotification({
          type: 'warning',
          title: 'Данные сохранены локально',
          message: 'Синхронизация произойдет при восстановлении связи'
        });
        // Очищаем форму даже в офлайн-режиме
        setLastSaved(new Date());
        loadTodayData();
        setFormData({ focus: '', sbp: '', cash: '' });
      } else {
        setError('Произошла ошибка при сохранении');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ focus: '', sbp: '', cash: '' });
    setError('');
  };

  const formatCurrency = (value) => {
    return parseInt(value || 0).toLocaleString('ru-RU');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Кнопка назад */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к дашборду
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Внесение данных</h1>
          <p className="text-gray-400">
            {new Date().toLocaleDateString('ru-RU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Сводка по сегодняшним данным */}
        <div className="card p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Сегодня уже внесено:</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm text-gray-400">Фокусные</div>
              <div className="text-white font-medium">{formatCurrency(todayData.focus)} ₽</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">СБП</div>
              <div className="text-white font-medium">{formatCurrency(todayData.sbp)} ₽</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Наличные</div>
              <div className="text-white font-medium">{formatCurrency(todayData.cash)} ₽</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Общая сумма:</span>
              <span className="text-xl font-bold text-white">
                {formatCurrency(todayData.focus + todayData.sbp + todayData.cash)} ₽
              </span>
            </div>
          </div>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          {/* Фокусные товары */}
          <div className="form-group">
            <label className="form-label">
              💰 Фокусные товары (рубли)
            </label>
            <input
              type="text"
              value={formData.focus}
              onChange={(e) => handleInputChange('focus', e.target.value)}
              className="input-primary text-lg font-mono"
              placeholder="0"
            />
            {formData.focus && (
              <div className="mt-2 text-sm text-gray-400">
                {formatCurrency(formData.focus)} ₽
              </div>
            )}
          </div>

          {/* СБП */}
          <div className="form-group">
            <label className="form-label">
              📱 СБП (рубли)
            </label>
            <input
              type="text"
              value={formData.sbp}
              onChange={(e) => handleInputChange('sbp', e.target.value)}
              className="input-primary text-lg font-mono"
              placeholder="0"
            />
            {formData.sbp && (
              <div className="mt-2 text-sm text-gray-400">
                {formatCurrency(formData.sbp)} ₽
              </div>
            )}
          </div>

          {/* Наличные */}
          <div className="form-group">
            <label className="form-label">
              💵 Наличные (рубли)
            </label>
            <input
              type="text"
              value={formData.cash}
              onChange={(e) => handleInputChange('cash', e.target.value)}
              className="input-primary text-lg font-mono"
              placeholder="0"
            />
            {formData.cash && (
              <div className="mt-2 text-sm text-gray-400">
                {formatCurrency(formData.cash)} ₽
              </div>
            )}
          </div>

          {/* Итоговая сумма */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 border border-gray-600">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Будет добавлено:</span>
              <span className="text-2xl font-bold text-white">
                {formatCurrency(calculateTotal())} ₽
              </span>
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-400">
              <Calculator className="h-4 w-4 mr-1" />
              Фокусные + СБП + Наличные
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="flex-1 btn-secondary flex items-center justify-center"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Сбросить
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || calculateTotal() === 0}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </>
              )}
            </button>
          </div>

          {lastSaved && (
            <div className="text-center text-sm text-green-400 animate-fade-in">
              ✓ Данные сохранены {lastSaved.toLocaleTimeString('ru-RU')}
            </div>
          )}
        </form>

        {/* Подсказка */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Данные могут вносить все сотрудники. Итоговая сумма рассчитывается автоматически.</p>
          <p className="mt-1">Работает в офлайн-режиме.</p>
        </div>
      </div>
    </div>
  );
};

export default DataEntry;