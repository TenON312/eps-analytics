import React, { useState, useEffect } from 'react';
import { Monitor, Zap, Wifi, WifiOff, RefreshCw, ArrowLeft, BarChart3, CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cashRegisterService } from '../services/cashRegisterService';
import { useNotifications } from '../contexts/NotificationContext';

const CashRegister = ({ userData }) => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  
  const [cashData, setCashData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // При монтировании пытаемся подключиться к кассе
    connectToCashRegister();
    
    return () => {
      // При размонтировании отключаемся
      cashRegisterService.disconnect();
    };
  }, []);

  const connectToCashRegister = async () => {
    setConnecting(true);
    try {
      const connected = await cashRegisterService.connect();
      if (connected) {
        addNotification({
          type: 'success',
          title: 'Касса подключена',
          message: 'Успешное подключение к кассовой системе'
        });
        loadCashData();
      } else {
        addNotification({
          type: 'error',
          title: 'Ошибка подключения',
          message: 'Не удалось подключиться к кассовой системе'
        });
      }
    } catch (error) {
      console.error('Ошибка подключения:', error);
      addNotification({
        type: 'error',
        title: 'Ошибка подключения',
        message: error.message
      });
    } finally {
      setConnecting(false);
    }
  };

  const loadCashData = async () => {
    setLoading(true);
    try {
      const data = await cashRegisterService.getCashRegisterData();
      setCashData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      addNotification({
        type: 'error',
        title: 'Ошибка загрузки',
        message: 'Не удалось загрузить данные из кассы'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = async () => {
    await loadCashData();
    addNotification({
      type: 'success',
      title: 'Данные обновлены',
      message: 'Актуальные данные загружены из кассы'
    });
  };

  const formatCurrency = (value) => {
    return value.toLocaleString('ru-RU');
  };

  const getStatusColor = () => {
    return cashRegisterService.connected ? 'text-green-400' : 'text-red-400';
  };

  const getStatusIcon = () => {
    return cashRegisterService.connected ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />;
  };

  if (loading && !cashData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Подключение к кассовой системе...</p>
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

        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Мониторинг касс</h1>
            <p className="text-gray-400">Реальное время данные из кассовой системы</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Статус подключения */}
            <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span>{cashRegisterService.connected ? 'Подключено' : 'Не подключено'}</span>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={loading || !cashRegisterService.connected}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </button>

            {!cashRegisterService.connected && (
              <button
                onClick={connectToCashRegister}
                disabled={connecting}
                className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Zap className="h-4 w-4 mr-2" />
                {connecting ? 'Подключение...' : 'Подключить'}
              </button>
            )}
          </div>
        </header>

        {lastUpdate && (
          <div className="text-sm text-gray-400 mb-6">
            Последнее обновление: {lastUpdate.toLocaleTimeString('ru-RU')}
          </div>
        )}

        {cashData ? (
          <div className="space-y-6">
            {/* Основная статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Общая выручка</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(cashData.totalRevenue)} ₽
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Количество чеков</p>
                    <p className="text-2xl font-bold text-white">
                      {cashData.totalTransactions}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Средний чек</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(cashData.averageReceipt)} ₽
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Статус</p>
                    <p className="text-2xl font-bold text-green-400">
                      Активна
                    </p>
                  </div>
                  <Monitor className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Методы оплаты */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Методы оплаты</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <span className="text-gray-300">Наличные</span>
                    </div>
                    <span className="text-white font-medium">
                      {formatCurrency(cashData.paymentMethods.cash)} ₽
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300">Карта</span>
                    </div>
                    <span className="text-white font-medium">
                      {formatCurrency(cashData.paymentMethods.card)} ₽
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-300">СБП</span>
                    </div>
                    <span className="text-white font-medium">
                      {formatCurrency(cashData.paymentMethods.sbp)} ₽
                    </span>
                  </div>
                </div>
              </div>

              {/* Топ товаров */}
              <div className="card p-6 md:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-4">Топ товаров</h3>
                <div className="space-y-2">
                  {cashData.topProducts.map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-750 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 w-6">#{index + 1}</span>
                        <span className="text-white">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{formatCurrency(product.amount)} ₽</div>
                        <div className="text-gray-400 text-sm">{product.quantity} шт</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Почасовая статистика */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Почасовая выручка</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {cashData.hourlyData.map((hourData, index) => (
                  <div key={index} className="text-center p-3 bg-gray-750 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">{hourData.hour}</div>
                    <div className="text-white font-medium">{formatCurrency(hourData.revenue)} ₽</div>
                    <div className="text-gray-400 text-xs">{hourData.transactions} чеков</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Monitor className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Касса не подключена</h3>
            <p className="text-gray-400 mb-4">
              Подключитесь к кассовой системе для получения данных в реальном времени
            </p>
            <button
              onClick={connectToCashRegister}
              disabled={connecting}
              className="btn-primary"
            >
              {connecting ? 'Подключение...' : 'Подключить кассу'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashRegister;