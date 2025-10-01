import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, Calendar, Store, Shield, Edit, Trash2, Download, Upload, User } from 'lucide-react';
import { dataService } from '../services/dataService';
import { exportService } from '../services/exportService';
import { useNotifications } from '../contexts/NotificationContext';

const Team = ({ userData }) => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState('');
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    employeeId: '',
    phone: '',
    telegram: '',
    birthDate: '',
    stores: ['ЕРС 2334'],
    role: 'Сотрудник'
  });
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    const employeeData = dataService.getEmployees();
    setEmployees(employeeData);
  };

  const handleAddEmployee = () => {
    if (!employeeForm.name || !employeeForm.employeeId) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Заполните обязательные поля'
      });
      return;
    }

    const success = dataService.addEmployee(employeeForm);
    
    if (success) {
      addNotification({
        type: 'success',
        title: 'Сотрудник добавлен',
        message: `${employeeForm.name} успешно добавлен в систему`
      });
      setIsAdding(false);
      resetForm();
      loadEmployees();
    }
  };

  const handleEditEmployee = (employee) => {
    setIsEditing(employee.id);
    setEmployeeForm({
      name: employee.name,
      employeeId: employee.employeeId,
      phone: employee.phone,
      telegram: employee.telegram,
      birthDate: employee.birthDate,
      stores: employee.stores,
      role: employee.role
    });
  };

  const handleUpdateEmployee = () => {
    if (!employeeForm.name || !employeeForm.employeeId) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Заполните обязательные поля'
      });
      return;
    }

    const allData = dataService.getData();
    if (!allData) return;

    const employeeIndex = allData.employees.findIndex(emp => emp.id === isEditing);
    if (employeeIndex === -1) return;

    allData.employees[employeeIndex] = {
      ...allData.employees[employeeIndex],
      ...employeeForm
    };

    const success = dataService.saveData(allData);
    
    if (success) {
      addNotification({
        type: 'success',
        title: 'Данные обновлены',
        message: `Данные сотрудника ${employeeForm.name} успешно обновлены`
      });
      setIsEditing(null);
      resetForm();
      loadEmployees();
    }
  };

  const handleDeleteEmployee = (employeeId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      const allData = dataService.getData();
      if (!allData) return;

      allData.employees = allData.employees.filter(emp => emp.id !== employeeId);
      
      const success = dataService.saveData(allData);
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Сотрудник удален',
          message: 'Сотрудник успешно удален из системы'
        });
        loadEmployees();
      }
    }
  };

  const resetForm = () => {
    setEmployeeForm({
      name: '',
      employeeId: '',
      phone: '',
      telegram: '',
      birthDate: '',
      stores: ['ЕРС 2334'],
      role: 'Сотрудник'
    });
  };

  const handleExport = () => {
    const exportData = employees.map(employee => ({
      'Табельный номер': employee.employeeId,
      'ФИО': employee.name,
      'Телефон': employee.phone,
      'Telegram': employee.telegram,
      'Дата рождения': employee.birthDate,
      'Должность': employee.role,
      'Магазины': employee.stores.join(', '),
      'Дата создания': new Date(employee.createdAt).toLocaleDateString('ru-RU')
    }));

    exportService.exportToExcel(exportData, 'eps-employees');
    addNotification({
      type: 'success',
      title: 'Экспорт завершен',
      message: 'Данные сотрудников успешно экспортированы'
    });
  };

  const handleImport = () => {
    try {
      const parsedData = JSON.parse(importData);
      
      if (!Array.isArray(parsedData)) {
        throw new Error('Данные должны быть массивом');
      }

      const allData = dataService.getData();
      if (!allData) return;

      // Добавляем новых сотрудников
      parsedData.forEach(newEmployee => {
        const exists = allData.employees.some(emp => emp.employeeId === newEmployee.employeeId);
        if (!exists) {
          allData.employees.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: newEmployee.name || 'Новый сотрудник',
            employeeId: newEmployee.employeeId || Date.now().toString(),
            phone: newEmployee.phone || 'Не указан',
            telegram: newEmployee.telegram || 'Не указан',
            birthDate: newEmployee.birthDate || 'Не указана',
            stores: Array.isArray(newEmployee.stores) ? newEmployee.stores : ['ЕРС 2334'],
            role: newEmployee.role || 'Сотрудник',
            createdAt: new Date().toISOString()
          });
        }
      });

      const success = dataService.saveData(allData);
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Импорт завершен',
          message: `Добавлено ${parsedData.length} сотрудников`
        });
        setIsImporting(false);
        setImportData('');
        loadEmployees();
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка импорта',
        message: 'Неверный формат данных. Используйте JSON массив.'
      });
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.includes(searchTerm) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    const colors = {
      'Сотрудник': 'bg-blue-500/20 text-blue-400',
      'ЗДМ': 'bg-green-500/20 text-green-400',
      'ДТК': 'bg-purple-500/20 text-purple-400',
      'Админ': 'bg-red-500/20 text-red-400'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Сотрудники</h1>
            <p className="text-gray-400">Управление персоналом магазина</p>
          </div>
          
          <div className="flex items-center space-x-3">
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
              onClick={() => setIsAdding(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить сотрудника
            </button>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по имени, табельному номеру или должности..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-primary pl-10"
              />
            </div>
            <div className="text-gray-400">
              Найдено: {filteredEmployees.length} сотрудников
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="card p-6 hover:bg-gray-750 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{employee.name}</h3>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(employee.role)}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {employee.role}
                  </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleEditEmployee(employee)}
                    className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-300">
                  <span className="w-20 text-gray-400">Табельный:</span>
                  <span className="font-mono">{employee.employeeId}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-300">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {employee.phone}
                </div>
                
                <div className="flex items-center text-sm text-gray-300">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {employee.telegram}
                </div>
                
                <div className="flex items-center text-sm text-gray-300">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {employee.birthDate}
                </div>
                
                <div className="flex items-center text-sm text-gray-300">
                  <Store className="h-4 w-4 mr-2 text-gray-400" />
                  {employee.stores.join(', ')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Модальное окно добавления/редактирования сотрудника */}
        {(isAdding || isEditing) && (
          <div className="modal-overlay">
            <div className="modal-content max-w-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  {isEditing ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">ФИО *</label>
                    <input
                      type="text"
                      value={employeeForm.name}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input-primary"
                      placeholder="Иванов Иван Иванович"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Табельный номер *</label>
                    <input
                      type="text"
                      value={employeeForm.employeeId}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="input-primary"
                      placeholder="12345"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Телефон</label>
                      <input
                        type="tel"
                        value={employeeForm.phone}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="input-primary"
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                    <div>
                      <label className="form-label">Telegram</label>
                      <input
                        type="text"
                        value={employeeForm.telegram}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, telegram: e.target.value }))}
                        className="input-primary"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Дата рождения</label>
                    <input
                      type="text"
                      value={employeeForm.birthDate}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="input-primary"
                      placeholder="ДД.ММ.ГГГГ"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Должность</label>
                    <select
                      value={employeeForm.role}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, role: e.target.value }))}
                      className="input-primary"
                    >
                      <option value="Сотрудник">Сотрудник</option>
                      <option value="ЗДМ">ЗДМ</option>
                      <option value="ДТК">ДТК</option>
                      <option value="Админ">Админ</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Магазины (через запятую)</label>
                    <input
                      type="text"
                      value={employeeForm.stores.join(', ')}
                      onChange={(e) => setEmployeeForm(prev => ({ 
                        ...prev, 
                        stores: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                      }))}
                      className="input-primary"
                      placeholder="ЕРС 2334, ЕРС 2312"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      if (isEditing) {
                        setIsEditing(null);
                      } else {
                        setIsAdding(false);
                      }
                      resetForm();
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={isEditing ? handleUpdateEmployee : handleAddEmployee}
                    className="flex-1 btn-primary"
                  >
                    {isEditing ? 'Обновить' : 'Добавить'}
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
                <h3 className="text-xl font-bold text-white mb-4">Импорт сотрудников</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Данные в формате JSON</label>
                    <textarea
                      value={importData}
                      onChange={(e) => setImportData(e.target.value)}
                      className="input-primary h-48 resize-none font-mono text-sm"
                      placeholder={`[
  {
    "name": "Иванов Иван",
    "employeeId": "12349",
    "phone": "+7 (999) 123-45-67",
    "telegram": "@ivanov",
    "birthDate": "15.03.1990",
    "role": "Сотрудник",
    "stores": ["ЕРС 2334"]
  }
]`}
                    />
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-400 text-sm">
                      Формат данных: JSON массив объектов с полями: name, employeeId, phone, telegram, birthDate, role, stores
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

export default Team;