import React, { useState } from 'react';
import { Shield, Database, Download, Upload, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { dataService } from '../services/dataService';
import { exportService } from '../services/exportService';
import { useNotifications } from '../contexts/NotificationContext';

const Admin = ({ userData }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState('');
  const { addNotification } = useNotifications();

  const storageInfo = dataService.getStorageInfo();

  const handleExportAll = () => {
    const allData = dataService.exportData();
    const exportData = [];

    // Экспорт данных о выручке
    Object.entries(allData.revenueData || {}).forEach(([date, entries]) => {
      entries.forEach(entry => {
        exportData.push({
          Тип: 'Выручка',
          Дата: date,
          'Табельный номер': entry.employeeId,
          Сотрудник: entry.employeeName,
          'Фокусные товары': entry.focus,
          СБП: entry.sbp,
          Наличные: entry.cash,
          'Время внесения': new Date(entry.timestamp).toLocaleString('ru-RU')
        });
      });
    });

    // Экспорт сотрудников
    (allData.employees || []).forEach(employee => {
      exportData.push({
        Тип: 'Сотрудник',
        'Табельный номер': employee.employeeId,
        ФИО: employee.name,
        Телефон: employee.phone,
        Telegram: employee.telegram,
        'Дата рождения': employee.birthDate,
        Должность: employee.role,
        Магазины: employee.stores.join(', ')
      });
    });

    // Экспорт планов
    Object.entries(allData.plans || {}).forEach(([date, plan]) => {
      exportData.push({
        Тип: 'План',
        Дата: date,
        Выручка: plan.revenue,
        'Фокусные товары': plan.focus,
        СБП: plan.sbp,
        'Обновлено': new Date(plan.updatedAt).toLocaleString('ru-RU')
      });
    });

    exportService.exportToExcel(exportData, 'eps-full-export');
    addNotification({
      type: 'success',
      title: 'Экспорт завершен',
      message: 'Все данные успешно экспортированы'
    });
  };

  const handleImport = () => {
    try {
      const parsedData = JSON.parse(importData);
      const success = dataService.importData(parsedData);
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Импорт завершен',
          message: 'Данные успешно импортированы'
        });
        setIsImporting(false);
        setImportData('');
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка импорта',
        message: 'Неверный формат данных'
      });
    }
  };

  const handleClearData = () => {
    if (window.confirm('ВНИМАНИЕ! Это действие удалит все данные. Продолжить?')) {
      const success = dataService.clearAllData();
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Данные очищены',
          message: 'Все данные были удалены'
        });
      }
    }
  };

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: Shield },
    { id: 'data', name: 'Управление данными', icon: Database }
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Сотрудники</h3>
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">{storageInfo.employeesCount}</div>
                <div className="text-sm text-gray-400">Зарегистрировано</div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Дни с данными</h3>
                  <Database className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">{storageInfo.revenueDays}</div>
                <div className="text-sm text-gray-400">Записей о выручке</div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Планы</h3>
                  <CheckCircle className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white">{storageInfo.plansCount}</div>
                <div className="text-sm text-gray-400">Установленных планов</div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Версия</h3>
                  <Shield className="h-5 w-5 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white">v{storageInfo.version}</div>
                <div className="text-sm text-gray-400">Системы</div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Информация о системе</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Последнее обновление:</span>
                    <span className="text-white">
                      {new Date(storageInfo.lastUpdated).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Статус данных:</span>
                    <span className="text-green-400">✓ Корректны</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Режим:</span>
                    <span className="text-blue-400">Production</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-gray-400">Поддержка офлайн:</span>
                    <span className="text-green-400">✓ Активна</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Экспорт данных</h3>
                <p className="text-gray-400 mb-4">
                  Скачайте полную копию всех данных системы в формате Excel.
                </p>
                <button
                  onClick={handleExportAll}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Экспортировать все данные
                </button>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Импорт данных</h3>
                <p className="text-gray-400 mb-4">
                  Загрузите ранее экспортированные данные в систему.
                </p>
                <button
                  onClick={() => setIsImporting(true)}
                  className="btn-secondary w-full flex items-center justify-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Импортировать данные
                </button>
              </div>
            </div>

            <div className="card p-6 border border-red-500/50">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Опасная зона</h3>
                  <p className="text-gray-400 mb-4">
                    Удаление всех данных системы. Это действие нельзя отменить.
                  </p>
                  <button
                    onClick={handleClearData}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Очистить все данные
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Администрирование</h1>
          <p className="text-gray-400">Управление системой и данными</p>
        </div>

        <div className="card p-6">
          <div className="border-b border-gray-700 mb-6">
            <nav className="flex space-x-8">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <TabContent />
        </div>

        {/* Модальное окно импорта */}
        {isImporting && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Импорт данных</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Данные в формате JSON</label>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      className="input-primary h-48 resize-none font-mono text-sm"
                      placeholder="Вставьте JSON данные..."
                    />
                  </div>
                  
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ Внимание: Импорт данных перезапишет существующие данные. 
                      Рекомендуется сделать экспорт перед импортом.
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setIsImporting(false)}
                    className="flex-1 btn-secondary"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!importData.trim()}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    Импортировать
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;