import React, { useState, useEffect } from 'react';
import { Save, Calculator, RotateCcw, ArrowLeft, TrendingUp, CreditCard, Wallet } from 'lucide-react';
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
      <div className="max-w-2xl mx-auto">
        {/* Кнопка назад */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Назад к дашборду
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Внесение данных</h1>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 inline-block text-transparent bg-clip-text">
            <p className="text-xl font-semibold">
              {new Date().toLocaleDateString('ru-RU', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Сводка по сегодняшним данным */}
        <div className="card p-6 mb-8 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
            Сегодня уже внесено:
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-750 rounded-xl p-4 border border-gray-600">
              <div className="text-sm text-gray-400 mb-1">Фокусные</div>
              <div className="text-white font-bold text-xl">{formatCurrency(todayData.focus)} ₽</div>
            </div>
            <div className="bg-gray-750 rounded-xl p-4 border border-gray-600">
              <div className="text-sm text-gray-400 mb-1">СБП</div>
              <div className="text-white font-bold text-xl">{formatCurrency(todayData.sbp)} ₽</div>
            </div>
            <div className="bg-gray-750 rounded-xl p-4 border border-gray-600">
              <div className="text-sm text-gray-400 mb-1">Наличные</div>
              <div className="text-white font-bold text-xl">{formatCurrency(todayData.cash)} ₽</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium">Общая сумма:</span>
              <span className="text-2xl font-bold text-white bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                {formatCurrency(todayData.focus + todayData.sbp + todayData.cash)} ₽
              </span>
            </div>
          </div>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6 animate-fade-in">
            <p className="text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
          {/* Фокусные товары */}
          <div className="form-group">
            <div className="flex items-center justify-between space-x-4">
              <label className="form-label flex items-center text-lg font-medium text-white min-w-[200px]">
                <TrendingUp className="h-5 w-5 mr-3 text-purple-400" />
                Фокусные товары
              </label>
              <div className="flex-1 max-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    value={formData.focus}
                    onChange={(e) => handleInputChange('focus', e.target.value)}
                    className="input-field text-lg font-mono text-right pr-10 bg-gray-750 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    ₽
                  </span>
                </div>
                {formData.focus && (
                  <div className="mt-2 text-sm text-gray-400 text-right">
                    {formatCurrency(formData.focus)} ₽
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* СБП */}
          <div className="form-group">
            <div className="flex items-center justify-between space-x-4">
              <label className="form-label flex items-center text-lg font-medium text-white min-w-[200px]">
                <CreditCard className="h-5 w-5 mr-3 text-blue-400" />
                СБП
              </label>
              <div className="flex-1 max-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    value={formData.sbp}
                    onChange={(e) => handleInputChange('sbp', e.target.value)}
                    className="input-field text-lg font-mono text-right pr-10 bg-gray-750 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    ₽
                  </span>
                </div>
                {formData.sbp && (
                  <div className="mt-2 text-sm text-gray-400 text-right">
                    {formatCurrency(formData.sbp)} ₽
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Наличные */}
          <div className="form-group">
            <div className="flex items-center justify-between space-x-4">
              <label className="form-label flex items-center text-lg font-medium text-white min-w-[200px]">
                <Wallet className="h-5 w-5 mr-3 text-green-400" />
                Наличные
              </label>
              <div className="flex-1 max-w-[200px]">
                <div className="relative">
                  <input
                    type="text"
                    value={formData.cash}
                    onChange={(e) => handleInputChange('cash', e.target.value)}
                    className="input-field text-lg font-mono text-right pr-10 bg-gray-750 border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                    ₽
                  </span>
                </div>
                {formData.cash && (
                  <div className="mt-2 text-sm text-gray-400 text-right">
                    {formatCurrency(formData.cash)} ₽
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Итоговая сумма */}
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30 mt-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-lg font-medium">Будет добавлено:</span>
              <span className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                {formatCurrency(calculateTotal())} ₽
              </span>
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <Calculator className="h-4 w-4 mr-2" />
              Фокусные + СБП + Наличные
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="flex-1 btn-secondary flex items-center justify-center py-3 rounded-xl border border-gray-600 hover:border-gray-500 transition-all"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Сбросить
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || calculateTotal() === 0}
              className="flex-1 btn-primary flex items-center justify-center py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            <div className="text-center text-sm text-green-400 animate-fade-in flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Данные сохранены {lastSaved.toLocaleTimeString('ru-RU')}
            </div>
          )}
        </form>

        {/* Подсказка */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Данные могут вносить все сотрудники. Итоговая сумма рассчитывается автоматически.</p>
          <p className="mt-1">Работает в офлайн-режиме.</p>
        </div>
      </div>
    </div>
  );
};

export default DataEntry;