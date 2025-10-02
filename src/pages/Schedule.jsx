// src/pages/Schedule.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Users, Copy, Download, Upload, Save, X, MoreVertical } from 'lucide-react';
import { dataService } from '../services/dataService';
import { exportService } from '../services/exportService';
import { useNotifications } from '../contexts/NotificationContext';
import * as XLSX from 'xlsx';

const Schedule = ({ userData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState({});
  const [employees, setEmployees] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [copyMode, setCopyMode] = useState(false);
  const [sourceDate, setSourceDate] = useState('');
  const [targetDates, setTargetDates] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [quickEditMode, setQuickEditMode] = useState(false);
  const [quickEditData, setQuickEditData] = useState({
    startTime: '09:00',
    endTime: '18:00',
    type: 'work'
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

  const loadEmployees = () => {
    const employeeData = dataService.getEmployees();
    setEmployees(employeeData);
  };

  const loadSchedules = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const schedulesData = {};
    
    employees.forEach(employee => {
      const employeeSchedule = dataService.getEmployeeSchedule(employee.employeeId, month, year);
      schedulesData[employee.employeeId] = employeeSchedule;
    });
    
    setSchedules(schedulesData);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      loadSchedules();
    }
  }, [currentDate, employees]);

  const handleSaveSchedule = (date, employeeId, scheduleData) => {
    const success = dataService.saveScheduleEntry(date, employeeId, scheduleData);
    
    if (success) {
      addNotification({
        type: 'success',
        title: 'Смена сохранена',
        message: `Расписание для ${getEmployeeName(employeeId)} на ${formatDate(date)} обновлено`
      });
      setEditingCell(null);
      setQuickEditMode(false);
      loadSchedules();
    }
  };

  const handleDeleteSchedule = (date, employeeId) => {
    const allData = dataService.getData();
    if (!allData || !allData.schedules) return;

    if (allData.schedules[date]) {
      allData.schedules[date] = allData.schedules[date].filter(entry => entry.employeeId !== employeeId);
      const success = dataService.saveData(allData);
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Смена удалена',
          message: 'Смена успешно удалена из графика'
        });
        loadSchedules();
      }
    }
  };

  const handleExport = () => {
    const exportData = [];
    
    Object.entries(schedules).forEach(([employeeId, employeeSchedules]) => {
      const employee = employees.find(emp => emp.employeeId === employeeId);
      Object.entries(employeeSchedules).forEach(([date, schedule]) => {
        exportData.push({
          'Дата': date,
          'Табельный номер': employeeId,
          'Сотрудник': employee?.name || 'Неизвестный',
          'Начало смены': schedule.startTime,
          'Конец смены': schedule.endTime,
          'Тип смены': schedule.type,
          'Создано': new Date(schedule.createdAt).toLocaleDateString('ru-RU')
        });
      });
    });

    exportService.exportToExcel(exportData, `eps-schedule-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`);
    addNotification({
      type: 'success',
      title: 'Экспорт завершен',
      message: 'График работы успешно экспортирован'
    });
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const allData = dataService.getData();
        if (!allData) return;

        if (!allData.schedules) {
          allData.schedules = {};
        }

        let importedCount = 0;

        jsonData.forEach(item => {
          const date = item['Дата'] || item['Date'] || item['date'];
          const employeeId = item['Табельный номер'] || item['employeeId'] || item['Employee ID'];
          const startTime = item['Начало смены'] || item['Start Time'] || item['startTime'] || '09:00';
          const endTime = item['Конец смены'] || item['End Time'] || item['endTime'] || '18:00';
          const type = item['Тип смены'] || item['Shift Type'] || item['type'] || 'work';

          if (date && employeeId) {
            if (!allData.schedules[date]) {
              allData.schedules[date] = [];
            }

            const existingIndex = allData.schedules[date].findIndex(
              entry => entry.employeeId === employeeId
            );

            const scheduleData = {
              employeeId: employeeId,
              startTime: startTime,
              endTime: endTime,
              type: type,
              createdAt: new Date().toISOString()
            };

            if (existingIndex >= 0) {
              allData.schedules[date][existingIndex] = scheduleData;
            } else {
              allData.schedules[date].push(scheduleData);
            }
            importedCount++;
          }
        });

        const success = dataService.saveData(allData);
        
        if (success) {
          addNotification({
            type: 'success',
            title: 'Импорт завершен',
            message: `Импортировано ${importedCount} записей графика`
          });
          setIsImporting(false);
          setSelectedFile(null);
          loadSchedules();
        }
      } catch (error) {
        console.error('❌ Ошибка импорта:', error);
        addNotification({
          type: 'error',
          title: 'Ошибка импорта',
          message: 'Неверный формат файла. Убедитесь, что файл в формате Excel или CSV'
        });
      }
    };

    reader.onerror = function() {
      addNotification({
        type: 'error',
        title: 'Ошибка чтения файла',
        message: 'Не удалось прочитать файл'
      });
    };

    reader.readAsArrayBuffer(file);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleCopySchedule = () => {
    if (!sourceDate) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Выберите исходную дату'
      });
      return;
    }

    if (targetDates.length === 0) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Выберите целевые даты'
      });
      return;
    }

    // Получаем расписание на исходную дату
    const sourceSchedules = dataService.getScheduleForDate(sourceDate);
    
    // Копируем расписание на целевые даты
    let copiedCount = 0;
    targetDates.forEach(targetDate => {
      sourceSchedules.forEach(schedule => {
        const success = dataService.saveScheduleEntry(
          targetDate, 
          schedule.employeeId, 
          {
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            type: schedule.type
          }
        );
        if (success) copiedCount++;
      });
    });

    addNotification({
      type: 'success',
      title: 'График скопирован',
      message: `Расписание скопировано на ${copiedCount} дат`
    });

    setCopyMode(false);
    setSourceDate('');
    setTargetDates([]);
    loadSchedules();
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.employeeId === employeeId);
    return employee ? employee.name : `Сотрудник ${employeeId}`;
  };

  const getEmployeeRole = (employeeId) => {
    const employee = employees.find(emp => emp.employeeId === employeeId);
    return employee ? employee.role : 'Сотрудник';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getShiftDisplay = (schedule) => {
    if (!schedule) return null;
    
    return `${schedule.startTime} - ${schedule.endTime}`;
  };

  const getShiftTypeColor = (type) => {
    const colors = {
      work: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      overtime: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      holiday: 'bg-green-500/20 text-green-400 border-green-500/50',
      sick: 'bg-red-500/20 text-red-400 border-red-500/50',
      vacation: 'bg-purple-500/20 text-purple-400 border-purple-500/50'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  };

  const getShiftTypeName = (type) => {
    const names = {
      work: 'Работа',
      overtime: 'Сверхурочно',
      holiday: 'Выходной',
      sick: 'Больничный',
      vacation: 'Отпуск'
    };
    return names[type] || type;
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  const handleCellClick = (date, employeeId) => {
    const schedule = schedules[employeeId]?.[date];
    setEditingCell({ date, employeeId, schedule });
    if (schedule) {
      setQuickEditData({
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        type: schedule.type
      });
    }
    setQuickEditMode(true);
  };

  const handleQuickSave = () => {
    if (editingCell) {
      handleSaveSchedule(editingCell.date, editingCell.employeeId, quickEditData);
    }
  };

  const handleQuickDelete = () => {
    if (editingCell) {
      handleDeleteSchedule(editingCell.date, editingCell.employeeId);
    }
  };

  const applyToWeek = (employeeId) => {
    if (!editingCell) return;

    const startDate = new Date(editingCell.date);
    const weekDates = [];
    
    // Находим понедельник текущей недели
    const dayOfWeek = startDate.getDay();
    const monday = new Date(startDate);
    monday.setDate(startDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    // Генерируем даты на всю неделю
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(monday);
      weekDate.setDate(monday.getDate() + i);
      weekDates.push(weekDate.toISOString().split('T')[0]);
    }

    // Применяем расписание на всю неделю
    weekDates.forEach(date => {
      dataService.saveScheduleEntry(date, employeeId, quickEditData);
    });

    addNotification({
      type: 'success',
      title: 'Расписание применено',
      message: 'Расписание применено на всю неделю'
    });
    
    setQuickEditMode(false);
    setEditingCell(null);
    loadSchedules();
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок и управление */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">График работы</h1>
            <p className="text-gray-400">Табличное представление расписания сотрудников</p>
          </div>
          
          <div className="flex items-center space-x-3">
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
            
            <button
              onClick={() => setCopyMode(true)}
              className="btn-secondary flex items-center"
            >
              <Copy className="h-4 w-4 mr-2" />
              Копировать
            </button>
          </div>
        </div>

        {/* Основная таблица */}
        <div className="card p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {/* Заголовок с сотрудниками */}
                  <th className="text-left p-4 border-r border-gray-700 bg-gray-800 sticky left-0 z-10 min-w-[200px]">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400 font-semibold">Сотрудник</span>
                    </div>
                  </th>
                  
                  {/* Дни месяца */}
                  {days.map(day => {
                    const dateStr = day.toISOString().split('T')[0];
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    
                    return (
                      <th 
                        key={dateStr}
                        className={`p-3 text-center border-b border-gray-700 min-w-[120px] ${
                          isToday 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : isWeekend
                            ? 'bg-gray-800 text-gray-400'
                            : 'bg-gray-750 text-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-normal">
                            {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                          </span>
                          <span className="text-sm font-semibold">
                            {day.getDate()}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              
              <tbody>
                {employees.map((employee, rowIndex) => (
                  <tr 
                    key={employee.id}
                    className={rowIndex % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800/30'}
                  >
                    {/* Ячейка с сотрудником */}
                    <td className="p-4 border-r border-gray-700 bg-gray-800 sticky left-0 z-10 min-w-[200px]">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-white text-sm">
                            {employee.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {employee.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Ячейки с расписанием */}
                    {days.map(day => {
                      const dateStr = day.toISOString().split('T')[0];
                      const schedule = schedules[employee.employeeId]?.[dateStr];
                      const isToday = dateStr === new Date().toISOString().split('T')[0];
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      
                      return (
                        <td 
                          key={dateStr}
                          onClick={() => handleCellClick(dateStr, employee.employeeId)}
                          className={`p-2 border border-gray-700 cursor-pointer transition-all hover:bg-gray-700/50 min-w-[120px] ${
                            isToday 
                              ? 'bg-blue-500/10' 
                              : isWeekend
                              ? 'bg-gray-800/30'
                              : 'bg-gray-750/30'
                          } ${
                            editingCell?.date === dateStr && editingCell?.employeeId === employee.employeeId
                              ? 'ring-2 ring-blue-500'
                              : ''
                          }`}
                        >
                          {schedule ? (
                            <div className={`text-center p-2 rounded border ${getShiftTypeColor(schedule.type)}`}>
                              <div className="text-xs font-medium">
                                {getShiftDisplay(schedule)}
                              </div>
                              <div className="text-xs opacity-80 mt-1">
                                {getShiftTypeName(schedule.type)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center p-3">
                              <div className="text-gray-500 text-xs">
                                <Plus className="h-4 w-4 mx-auto mb-1" />
                                Добавить
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Легенда */}
        <div className="card p-4 mt-6">
          <h3 className="text-sm font-semibold text-white mb-3">Легенда смен</h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/50 rounded"></div>
              <span className="text-xs text-gray-400">Рабочая смена</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-500/20 border border-orange-500/50 rounded"></div>
              <span className="text-xs text-gray-400">Сверхурочная</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500/20 border border-green-500/50 rounded"></div>
              <span className="text-xs text-gray-400">Выходной</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500/20 border border-red-500/50 rounded"></div>
              <span className="text-xs text-gray-400">Больничный</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-500/20 border border-purple-500/50 rounded"></div>
              <span className="text-xs text-gray-400">Отпуск</span>
            </div>
          </div>
        </div>

        {/* Быстрое редактирование */}
        {quickEditMode && editingCell && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {schedules[editingCell.employeeId]?.[editingCell.date] ? 'Редактировать смену' : 'Добавить смену'}
                  </h3>
                  <button
                    onClick={() => setQuickEditMode(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Сотрудник</div>
                    <div className="text-white font-medium">
                      {getEmployeeName(editingCell.employeeId)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Дата</div>
                    <div className="text-white">
                      {new Date(editingCell.date).toLocaleDateString('ru-RU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Начало смены</label>
                      <input
                        type="time"
                        value={quickEditData.startTime}
                        onChange={(e) => setQuickEditData(prev => ({ ...prev, startTime: e.target.value }))}
                        className="input-primary"
                      />
                    </div>
                    <div>
                      <label className="form-label">Конец смены</label>
                      <input
                        type="time"
                        value={quickEditData.endTime}
                        onChange={(e) => setQuickEditData(prev => ({ ...prev, endTime: e.target.value }))}
                        className="input-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Тип смены</label>
                    <select
                      value={quickEditData.type}
                      onChange={(e) => setQuickEditData(prev => ({ ...prev, type: e.target.value }))}
                      className="input-primary"
                    >
                      <option value="work">Рабочая смена</option>
                      <option value="overtime">Сверхурочная</option>
                      <option value="holiday">Выходной</option>
                      <option value="sick">Больничный</option>
                      <option value="vacation">Отпуск</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  {schedules[editingCell.employeeId]?.[editingCell.date] && (
                    <button
                      onClick={handleQuickDelete}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </button>
                  )}
                  <button
                    onClick={() => applyToWeek(editingCell.employeeId)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    На неделю
                  </button>
                  <button
                    onClick={handleQuickSave}
                    className="flex-1 btn-primary flex items-center justify-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно импорта */}
        {isImporting && (
          <div className="modal-overlay">
            <div className="modal-content max-w-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Импорт графика работы</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Выберите файл Excel или CSV</label>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleImport}
                      className="input-primary"
                    />
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-400 text-sm mb-2">
                      📋 Формат файла должен содержать столбцы:
                    </p>
                    <ul className="text-blue-400 text-sm list-disc list-inside space-y-1">
                      <li><strong>Дата</strong> (в формате ГГГГ-ММ-ДД)</li>
                      <li><strong>Табельный номер</strong></li>
                      <li><strong>Начало смены</strong> (ЧЧ:ММ)</li>
                      <li><strong>Конец смены</strong> (ЧЧ:ММ)</li>
                      <li><strong>Тип смены</strong> (work, overtime, holiday, sick, vacation)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setIsImporting(false)}
                    className="flex-1 btn-secondary"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно копирования графика */}
        {copyMode && (
          <div className="modal-overlay">
            <div className="modal-content max-w-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Копировать график</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="form-label">Исходная дата</label>
                    <input
                      type="date"
                      value={sourceDate}
                      onChange={(e) => setSourceDate(e.target.value)}
                      className="input-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label mb-3 block">Целевые даты</label>
                    <div className="grid grid-cols-7 gap-2">
                      {days.map((date, index) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const isSelected = targetDates.includes(dateStr);
                        
                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => {
                              if (targetDates.includes(dateStr)) {
                                setTargetDates(prev => prev.filter(d => d !== dateStr));
                              } else {
                                setTargetDates(prev => [...prev, dateStr]);
                              }
                            }}
                            className={`p-2 rounded-lg border-2 text-center text-sm transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <div>{date.toLocaleDateString('ru-RU', { weekday: 'short' })}</div>
                            <div className="font-medium">{date.getDate()}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-400 text-sm">
                      ⚡ Быстрый выбор: 
                      <button 
                        onClick={() => setTargetDates(days.map(d => d.toISOString().split('T')[0]))}
                        className="ml-2 underline hover:text-blue-300"
                      >
                        Весь месяц
                      </button>
                      <button 
                        onClick={() => setTargetDates([])}
                        className="ml-2 underline hover:text-blue-300"
                      >
                        Очистить
                      </button>
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setCopyMode(false);
                      setSourceDate('');
                      setTargetDates([]);
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleCopySchedule}
                    className="flex-1 btn-primary flex items-center justify-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Копировать график
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

export default Schedule;