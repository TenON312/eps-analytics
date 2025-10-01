// src/pages/PlanManagement.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Target, Calendar, TrendingUp, Save, ChevronLeft, ChevronRight, Download, Upload, FileUp } from 'lucide-react';
import { dataService } from '../services/dataService';
import { exportService } from '../services/exportService';
import { useNotifications } from '../contexts/NotificationContext';

const PlanManagement = ({ userData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plans, setPlans] = useState({});
  const [editingDate, setEditingDate] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [editForm, setEditForm] = useState({
    revenue: '',
    focus: '',
    sbp: ''
  });
  const { addNotification } = useNotifications();

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const loadPlans = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const plansData = dataService.getPlansForMonth(year, month);
    setPlans(plansData);
  };

  useEffect(() => {
    loadPlans();
  }, [currentDate]);

  const handleSavePlan = (date) => {
    const planData = {
      revenue: parseInt(editForm.revenue) || 0,
      focus: parseInt(editForm.focus) || 0,
      sbp: parseInt(editForm.sbp) || 0
    };

    const success = dataService.saveDailyPlan(date, planData);
    
    if (success) {
      addNotification({
        type: 'success',
        title: 'План сохранен',
        message: `План на ${date} успешно обновлен`
      });
      setEditingDate(null);
      loadPlans();
    }
  };

  const handleEditClick = (date, currentPlan) => {
    setEditingDate(date);
    setEditForm({
      revenue: currentPlan?.revenue?.toString() || '',
      focus: currentPlan?.focus?.toString() || '',
      sbp: currentPlan?.sbp?.toString() || ''
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleExport = () => {
    const exportData = Object.entries(plans).map(([date, plan]) => ({
      'Дата': date,
      'Выручка (план)': plan?.revenue || 0,
      'Фокусные товары (план)': plan?.focus || 0,
      'СБП (план)': plan?.sbp || 0,
      'Общий план': (plan?.revenue || 0) + (plan?.focus || 0) + (plan?.sbp || 0)
    }));

    exportService.exportToExcel(exportData, `eps-plans-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`);
    addNotification({
      type: 'success',
      title: 'Экспорт завершен',
      message: 'Планы успешно экспортированы в Excel'
    });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadPlan = () => {
    if (!selectedFile) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Выберите файл для загрузки'
      });
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('📊 Импортированные данные:', jsonData);

        const allData = dataService.getData();
        if (!allData) return;

        let importedCount = 0;
        let skippedCount = 0;

        jsonData.forEach(row => {
          const date = row['Дата'] || row['Date'] || row['date'];
          const revenue = row['Выручка (план)'] || row['Выручка'] || row['Revenue'] || row['revenue'];
          const focus = row['Фокусные товары (план)'] || row['Фокусные'] || row['Focus'] || row['focus'];
          const sbp = row['СБП (план)'] || row['СБП'] || row['SBP'] || row['sbp'];

          if (date) {
            let formattedDate = date;
            if (typeof date === 'number') {
              formattedDate = XLSX.SSF.format('yyyy-mm-dd', date);
            } else if (date.includes('/') || date.includes('.')) {
              const parts = date.split(/[./-]/);
              if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                formattedDate = `${year}-${month}-${day}`;
              }
            }

            allData.plans[formattedDate] = {
              revenue: parseInt(revenue) || 0,
              focus: parseInt(focus) || 0,
              sbp: parseInt(sbp) || 0,
              updatedAt: new Date().toISOString()
            };
            importedCount++;
          } else {
            skippedCount++;
          }
        });

        const success = dataService.saveData(allData);
        
        if (success) {
          addNotification({
            type: 'success',
            title: 'Импорт завершен',
            message: `Импортировано ${importedCount} планов${skippedCount > 0 ? `, пропущено ${skippedCount} записей` : ''}`
          });
          setIsImporting(false);
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          loadPlans();
        }
      } catch (error) {
        console.error('❌ Ошибка импорта:', error);
        addNotification({
          type: 'error',
          title: 'Ошибка импорта',
          message: 'Неверный формат файла. Убедитесь, что файл в формате Excel или CSV'
        });
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = function() {
      addNotification({
        type: 'error',
        title: 'Ошибка чтения файла',
        message: 'Не удалось прочитать файл'
      });
      setIsUploading(false);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Дата': '2024-10-01',
        'Выручка (план)': 150000,
        'Фокусные товары (план)': 50000,
        'СБП (план)': 30000
      },
      {
        'Дата': '2024-10-02', 
        'Выручка (план)': 160000,
        'Фокусные товары (план)': 55000,
        'СБП (план)': 35000
      }
    ];

    exportService.exportToExcel(templateData, 'eps-plans-template');
    addNotification({
      type: 'success',
      title: 'Шаблон скачан',
      message: 'Шаблон для импорта планов скачан'
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Планирование</h1>
            <p className="text-gray-400">Управление планами продаж</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              </button>
              <span className="text-xl font-semibold text-white min-w-[200px] text-center">
                {monthName}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <button
              onClick={handleExport}
              className="btn-secondary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </button>

            <button
              onClick={() => setIsImporting(true)}
              className="btn-secondary flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Импорт
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Выручка</h3>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {Object.values(plans).reduce((sum, plan) => sum + (plan?.revenue || 0), 0).toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-sm text-gray-400">Общий план на месяц</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Фокусные товары</h3>
              <Target className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {Object.values(plans).reduce((sum, plan) => sum + (plan?.focus || 0), 0).toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-sm text-gray-400">Общий план на месяц</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">СБП</h3>
              <Target className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {Object.values(plans).reduce((sum, plan) => sum + (plan?.sbp || 0), 0).toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-sm text-gray-400">Общий план на месяц</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Дней с планами</h3>
              <Calendar className="h-5 w-5 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {Object.values(plans).filter(plan => plan !== null).length}
            </div>
            <div className="text-sm text-gray-400">из {days.length} дней</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="grid grid-cols-7 gap-4">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-400 py-2">
                {day}
              </div>
            ))}
            
            {days.map(day => {
              const dateStr = day.toISOString().split('T')[0];
              const plan = plans[dateStr];
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const isEditing = editingDate === dateStr;
              
              return (
                <div
                  key={dateStr}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isToday 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-700 bg-gray-800 hover:bg-gray-750'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>
                      {day.getDate()}
                    </span>
                    <button
                      onClick={() => handleEditClick(dateStr, plan)}
                      className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                    >
                      <Target className="h-3 w-3" />
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Выручка"
                        value={editForm.revenue}
                        onChange={(e) => setEditForm(prev => ({ ...prev, revenue: e.target.value }))}
                        className="w-full p-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
                      />
                      <input
                        type="text"
                        placeholder="Фокусные"
                        value={editForm.focus}
                        onChange={(e) => setEditForm(prev => ({ ...prev, focus: e.target.value }))}
                        className="w-full p-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
                      />
                      <input
                        type="text"
                        placeholder="СБП"
                        value={editForm.sbp}
                        onChange={(e) => setEditForm(prev => ({ ...prev, sbp: e.target.value }))}
                        className="w-full p-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleSavePlan(dateStr)}
                          className="flex-1 p-1 bg-green-600 hover:bg-green-700 rounded text-xs text-white"
                        >
                          <Save className="h-3 w-3 mx-auto" />
                        </button>
                        <button
                          onClick={() => setEditingDate(null)}
                          className="flex-1 p-1 bg-gray-600 hover:bg-gray-700 rounded text-xs text-white"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ) : plan ? (
                    <div className="space-y-1 text-xs">
                      <div className="text-green-400">В: {plan.revenue?.toLocaleString('ru-RU')}</div>
                      <div className="text-blue-400">Ф: {plan.focus?.toLocaleString('ru-RU')}</div>
                      <div className="text-purple-400">С: {plan.sbp?.toLocaleString('ru-RU')}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 text-center">—</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Модальное окно импорта */}
        {isImporting && (
          <div className="modal-overlay">
            <div className="modal-content max-w-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Импорт планов из Excel/CSV</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Выберите файл Excel или CSV</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileSelect}
                      className="input-primary"
                    />
                    {selectedFile && (
                      <div className="mt-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                        <p className="text-green-400 text-sm">
                          📎 Выбран файл: <strong>{selectedFile.name}</strong>
                        </p>
                        <p className="text-green-400 text-xs mt-1">
                          Размер: {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-400 text-sm mb-2">
                      📋 Формат файла должен содержать столбцы:
                    </p>
                    <ul className="text-blue-400 text-sm list-disc list-inside space-y-1">
                      <li><strong>Дата</strong> (в формате ГГГГ-ММ-ДД)</li>
                      <li><strong>Выручка (план)</strong> (число)</li>
                      <li><strong>Фокусные товары (план)</strong> (число)</li>
                      <li><strong>СБП (план)</strong> (число)</li>
                    </ul>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-400 text-sm mb-2">
                      💡 Советы по импорту:
                    </p>
                    <ul className="text-green-400 text-sm list-disc list-inside space-y-1">
                      <li>Поддерживаются файлы Excel (.xlsx, .xls) и CSV</li>
                      <li>Можно использовать экспортированный шаблон</li>
                      <li>Даты должны быть в формате ГГГГ-ММ-ДД</li>
                      <li>Существующие планы будут перезаписаны</li>
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={downloadTemplate}
                      className="flex-1 btn-secondary flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Скачать шаблон
                    </button>
                    <button
                      onClick={handleUploadPlan}
                      disabled={!selectedFile || isUploading}
                      className="flex-1 btn-primary flex items-center justify-center disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Загрузка...
                        </>
                      ) : (
                        <>
                          <FileUp className="h-4 w-4 mr-2" />
                          Загрузить план
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setIsImporting(false);
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Отмена
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

export default PlanManagement;