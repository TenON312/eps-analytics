import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, Calendar, Store, Shield, Edit, Trash2, Download, Upload, User, Save, ChevronDown } from 'lucide-react';
import { dataService } from '../services/dataService';
import { exportService } from '../services/exportService';
import { useNotifications } from '../contexts/NotificationContext';
import Modal from '../components/ui/Modal';

const Team = ({ userData }) => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    employeeId: '',
    phone: '',
    email: '',
    telegram: '',
    birthDate: '',
    stores: ['ЕРС 2334'],
    role: 'Сотрудник'
  });
  const [showStoresDropdown, setShowStoresDropdown] = useState(false);
  const { addNotification } = useNotifications();

  // Список доступных магазинов
  const availableStores = [
    'ЕРС 2334',
    'ЕРС 2312', 
    'ЕРС 2456',
    'ЕРС 2501',
    'ЕРС 2678',
    'ЕРС 2890',
    'ЕРС 3123',
    'ЕРС 3345'
  ];

  // Загрузка сотрудников и подписка на изменения данных
  useEffect(() => {
    loadEmployees();
    
    // Подписка на изменения данных
    const unsubscribe = dataService.subscribe(() => {
      console.log('Team: получено уведомление об изменении данных');
      loadEmployees();
    });
    
    // Отписка при размонтировании компонента
    return unsubscribe;
  }, []);

  const loadEmployees = () => {
    const employeeData = dataService.getEmployees();
    console.log('Team: загрузка сотрудников:', employeeData?.length || 0);
    setEmployees(employeeData || []);
  };

  const openAddModal = () => {
    setEmployeeForm({
      name: '',
      employeeId: '',
      phone: '',
      email: '',
      telegram: '',
      birthDate: '',
      stores: ['ЕРС 2334'],
      role: 'Сотрудник'
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (employee) => {
    setCurrentEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      employeeId: employee.employeeId,
      phone: employee.phone,
      email: employee.email || '',
      telegram: employee.telegram,
      birthDate: employee.birthDate,
      stores: employee.stores,
      role: employee.role
    });
    setIsEditModalOpen(true);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsImportModalOpen(false);
    setCurrentEmployee(null);
    setShowStoresDropdown(false);
  };

  const handleAddEmployee = () => {
    if (!employeeForm.name.trim() || !employeeForm.employeeId.trim()) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Заполните обязательные поля: ФИО и Табельный номер'
      });
      return;
    }

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (employeeForm.email && !emailRegex.test(employeeForm.email)) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Введите корректный email адрес'
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
      closeModals();
      // loadEmployees() вызовется автоматически через подписку
    } else {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось добавить сотрудника'
      });
    }
  };

  const handleUpdateEmployee = () => {
    if (!employeeForm.name.trim() || !employeeForm.employeeId.trim()) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Заполните обязательные поля: ФИО и Табельный номер'
      });
      return;
    }

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (employeeForm.email && !emailRegex.test(employeeForm.email)) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Введите корректный email адрес'
      });
      return;
    }

    const success = dataService.updateEmployee(currentEmployee.employeeId, employeeForm);
    
    if (success) {
      addNotification({
        type: 'success',
        title: 'Данные обновлены',
        message: `Данные сотрудника ${employeeForm.name} успешно обновлены`
      });
      closeModals();
      // loadEmployees() вызовется автоматически через подписку
    } else {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось обновить данные сотрудника'
      });
    }
  };

  const handleDeleteEmployee = (employeeId, employeeName) => {
    if (window.confirm(`Вы уверены, что хотите удалить сотрудника ${employeeName}?`)) {
      const success = dataService.deleteEmployee(employeeId);
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Сотрудник удален',
          message: 'Сотрудник успешно удален из системы'
        });
        // loadEmployees() вызовется автоматически через подписку
      } else {
        addNotification({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось удалить сотрудника'
        });
      }
    }
  };

  const handleExport = () => {
    const exportData = employees.map(employee => ({
      'Табельный номер': employee.employeeId,
      'ФИО': employee.name,
      'Телефон': employee.phone,
      'Email': employee.email,
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

      let addedCount = 0;
      parsedData.forEach(newEmployee => {
        const exists = allData.employees.some(emp => emp.employeeId === newEmployee.employeeId);
        if (!exists) {
          allData.employees.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: newEmployee.name || 'Новый сотрудник',
            employeeId: newEmployee.employeeId || Date.now().toString(),
            phone: newEmployee.phone || 'Не указан',
            email: newEmployee.email || 'Не указан',
            telegram: newEmployee.telegram || 'Не указан',
            birthDate: newEmployee.birthDate || 'Не указана',
            stores: Array.isArray(newEmployee.stores) ? newEmployee.stores : ['ЕРС 2334'],
            role: newEmployee.role || 'Сотрудник',
            position: newEmployee.position || 'Продавец-консультант',
            department: newEmployee.department || 'Продажи',
            hireDate: newEmployee.hireDate || '15.01.2024',
            createdAt: new Date().toISOString()
          });
          addedCount++;
        }
      });

      const success = dataService.saveData(allData);
      
      if (success) {
        addNotification({
          type: 'success',
          title: 'Импорт завершен',
          message: `Добавлено ${addedCount} сотрудников`
        });
        setIsImportModalOpen(false);
        setImportData('');
        // loadEmployees() вызовется автоматически через подписку
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка импорта',
        message: 'Неверный формат данных. Используйте JSON массив.'
      });
    }
  };

  const toggleStore = (store) => {
    setEmployeeForm(prev => {
      const currentStores = [...prev.stores];
      if (currentStores.includes(store)) {
        return { ...prev, stores: currentStores.filter(s => s !== store) };
      } else {
        return { ...prev, stores: [...currentStores, store] };
      }
    });
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.includes(searchTerm) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.stores.some(store => store.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRoleColor = (role) => {
    const colors = {
      'Сотрудник': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'ЗДМ': 'bg-green-500/20 text-green-400 border-green-500/30',
      'ДТК': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Админ': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const EmployeeFormFields = () => (
    <div className="space-y-6">
      {/* ФИО */}
      <div className="flex items-center justify-between space-x-4">
        <label className="form-label flex items-center text-lg font-medium text-white min-w-[200px]">
          <User className="h-5 w-5 mr-3 text-blue-400" />
          ФИО *
        </label>
        <div className="flex-1">
          <input
            type="text"
            value={employeeForm.name}
            onChange={(e) => setEmployeeForm(prev => ({ ...prev, name: e.target.value }))}
            className="input-field text-lg bg-gray-750 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Иванов Иван Иванович"
          />
        </div>
      </div>

      {/* Табельный номер */}
      <div className="flex items-center justify-between space-x-4">
        <label className="form-label flex items-center text-lg font-medium text-white min-w-[200px]">
          <Shield className="h-5 w-5 mr-3 text-purple-400" />
          Табельный номер *
        </label>
        <div className="flex-1">
          <input
            type="text"
            value={employeeForm.employeeId}
            onChange={(e) => setEmployeeForm(prev => ({ ...prev, employeeId: e.target.value }))}
            className="input-field text-lg font-mono bg-gray-750 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            placeholder="12345"
          />
        </div>
      </div>

      {/* Телефон и Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between space-x-4">
          <label className="form-label flex items-center text-lg font-medium text-white min-w-[120px]">
            <Phone className="h-5 w-5 mr-3 text-green-400" />
            Телефон
          </label>
          <div className="flex-1">
            <input
              type="tel"
              value={employeeForm.phone}
              onChange={(e) => setEmployeeForm(prev => ({ ...prev, phone: e.target.value }))}
              className="input-field bg-gray-750 border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="+7 (999) 123-45-67"
            />
          </div>
        </div>

        <div className="flex items-center justify-between space-x-4">
          <label className="form-label flex items-center text-lg font-medium text-white min-w-[120px]">
            <Mail className="h-5 w-5 mr-3 text-orange-400" />
            Email
          </label>
          <div className="flex-1">
            <input
              type="email"
              value={employeeForm.email}
              onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
              className="input-field bg-gray-750 border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="employee@epc.ru"
            />
          </div>
        </div>
      </div>

      {/* Telegram и Дата рождения */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between space-x-4">
          <label className="form-label flex items-center text-lg font-medium text-white min-w-[120px]">
            <Mail className="h-5 w-5 mr-3 text-blue-400" />
            Telegram
          </label>
          <div className="flex-1">
            <input
              type="text"
              value={employeeForm.telegram}
              onChange={(e) => setEmployeeForm(prev => ({ ...prev, telegram: e.target.value }))}
              className="input-field bg-gray-750 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="@username"
            />
          </div>
        </div>

        <div className="flex items-center justify-between space-x-4">
          <label className="form-label flex items-center text-lg font-medium text-white min-w-[120px]">
            <Calendar className="h-5 w-5 mr-3 text-yellow-400" />
            Дата рождения
          </label>
          <div className="flex-1">
            <div className="flex space-x-3">
              <input
                type="date"
                value={employeeForm.birthDate}
                onChange={(e) => setEmployeeForm(prev => ({ ...prev, birthDate: e.target.value }))}
                className="input-field bg-gray-750 border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 flex-1"
              />
              <input
                type="text"
                value={employeeForm.birthDate}
                onChange={(e) => setEmployeeForm(prev => ({ ...prev, birthDate: e.target.value }))}
                className="input-field bg-gray-750 border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 flex-1"
                placeholder="ДД.ММ.ГГГГ или выберите дату"
              />
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Можно ввести дату вручную или выбрать из календаря
            </div>
          </div>
        </div>
      </div>

      {/* Должность */}
      <div className="flex items-center justify-between space-x-4">
        <label className="form-label flex items-center text-lg font-medium text-white min-w-[200px]">
          <Shield className="h-5 w-5 mr-3 text-red-400" />
          Должность
        </label>
        <div className="flex-1">
          <select
            value={employeeForm.role}
            onChange={(e) => setEmployeeForm(prev => ({ ...prev, role: e.target.value }))}
            className="input-field bg-gray-750 border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          >
            <option value="Сотрудник">Сотрудник</option>
            <option value="ЗДМ">ЗДМ</option>
            <option value="ДТК">ДТК</option>
            <option value="Админ">Админ</option>
          </select>
        </div>
      </div>

      {/* Магазины */}
      <div className="flex items-start justify-between space-x-4">
        <label className="form-label flex items-center text-lg font-medium text-white min-w-[200px]">
          <Store className="h-5 w-5 mr-3 text-emerald-400" />
          Магазины
        </label>
        <div className="flex-1 relative">
          <div 
            className="input-field bg-gray-750 border-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer flex justify-between items-center"
            onClick={() => setShowStoresDropdown(!showStoresDropdown)}
          >
            <span className={employeeForm.stores.length === 0 ? 'text-gray-500' : 'text-white'}>
              {employeeForm.stores.length === 0 ? 'Выберите магазины' : employeeForm.stores.join(', ')}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showStoresDropdown ? 'rotate-180' : ''}`} />
          </div>
          
          {showStoresDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-750 border border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {availableStores.map(store => (
                <label 
                  key={store}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={employeeForm.stores.includes(store)}
                    onChange={() => toggleStore(store)}
                    className="rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-800"
                  />
                  <span className="text-white text-sm flex-1">{store}</span>
                </label>
              ))}
            </div>
          )}
          
          <div className="text-sm text-gray-400 mt-2">
            Выбрано: {employeeForm.stores.length} магазинов
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок и кнопки управления */}
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
              onClick={() => setIsImportModalOpen(true)}
              className="btn-secondary flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Импорт
            </button>
            <button
              onClick={openAddModal}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить сотрудника
            </button>
          </div>
        </div>

        {/* Поиск */}
        <div className="card p-6 mb-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по имени, табельному номеру, должности или магазину..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 bg-gray-750 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <div className="text-gray-400 whitespace-nowrap">
              Найдено: <span className="text-white font-semibold">{filteredEmployees.length}</span> сотрудников
            </div>
          </div>
        </div>

        {/* Результаты поиска */}
        {searchTerm && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-400 text-sm">
                Результаты поиска по запросу: <strong>"{searchTerm}"</strong>
              </span>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Очистить поиск
              </button>
            </div>
          </div>
        )}

        {/* Сетка сотрудников */}
        {filteredEmployees.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'Сотрудники не найдены' : 'Нет сотрудников'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? 'Попробуйте изменить условия поиска' 
                : 'Добавьте первого сотрудника чтобы начать работу'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={openAddModal}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить сотрудника
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map(employee => (
              <div key={employee.id} className="card p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{employee.name}</h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(employee.role)}`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {employee.role}
                    </div>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openEditModal(employee)}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors hover:bg-gray-700 rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors hover:bg-gray-700 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Табельный:</span>
                    <span className="text-white font-mono font-medium">{employee.employeeId}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    {employee.phone}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    {employee.email || 'Не указан'}
                  </div>

                  <div className="flex items-center text-sm text-gray-300">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    {employee.telegram}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    {employee.birthDate}
                  </div>
                  
                  <div className="flex items-start text-sm text-gray-300">
                    <Store className="h-4 w-4 mr-3 text-gray-400 mt-0.5" />
                    <span className="flex-1">
                      {employee.stores.map(store => (
                        <span key={store} className="inline-block bg-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">
                          {store}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно добавления сотрудника */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={closeModals}
          title="Добавить сотрудника"
          size="lg"
        >
          <EmployeeFormFields />
          <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={closeModals}
              className="flex-1 btn-secondary py-3 rounded-xl"
            >
              Отмена
            </button>
            <button
              onClick={handleAddEmployee}
              className="flex-1 btn-primary flex items-center justify-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить сотрудника
            </button>
          </div>
        </Modal>

        {/* Модальное окно редактирования сотрудника */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          title="Редактировать сотрудника"
          size="lg"
        >
          <EmployeeFormFields />
          <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={closeModals}
              className="flex-1 btn-secondary py-3 rounded-xl"
            >
              Отмена
            </button>
            <button
              onClick={handleUpdateEmployee}
              className="flex-1 btn-primary flex items-center justify-center py-3 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Сохранить изменения
            </button>
          </div>
        </Modal>

        {/* Модальное окно импорта */}
        <Modal
          isOpen={isImportModalOpen}
          onClose={closeModals}
          title="Импорт сотрудников"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="form-label text-lg font-medium text-white mb-3">
                Данные в формате JSON
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="input-field h-48 resize-none font-mono text-sm bg-gray-750 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                placeholder={`[
  {
    "name": "Иванов Иван",
    "employeeId": "12349",
    "phone": "+7 (999) 123-45-67",
    "email": "ivanov@epc.ru",
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
                Формат данных: JSON массив объектов с полями: name, employeeId, phone, email, telegram, birthDate, role, stores
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={closeModals}
              className="flex-1 btn-secondary py-3 rounded-xl"
            >
              Отмена
            </button>
            <button
              onClick={handleImport}
              disabled={!importData.trim()}
              className="flex-1 btn-primary flex items-center justify-center py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Импортировать
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Team;