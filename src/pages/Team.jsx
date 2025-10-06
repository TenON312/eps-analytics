import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, Mail, Phone, Calendar, Store, Shield, Edit, Trash2, Download, Upload, User, Save } from 'lucide-react';
import { dataService } from '../services/dataService';
import { exportService } from '../services/exportService';
import { useNotifications } from '../contexts/NotificationContext';
import Modal from '../components/ui/Modal';
import EmployeeForm from '../components/EmployeeForm';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { employeesData } from '../data/employees';

// Список доступных магазинов (вынесен из компонента для предотвращения пересоздания)
const availableStores = [
  'ЕРС 2334',
  'ЕРС 2312', 
];

const Team = ({ userData }) => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
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

  // Оптимизированная функция toggleStore с useCallback
  const toggleStore = useCallback((store) => {
    setEmployeeForm(prev => {
      const currentStores = [...prev.stores];
      if (currentStores.includes(store)) {
        return { ...prev, stores: currentStores.filter(s => s !== store) };
      } else {
        return { ...prev, stores: [...currentStores, store] };
      }
    });
  }, []);

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

    exportService.exportToExcel([{ name: 'Сотрудники', data: exportData }], 'eps-employees');
    addNotification({
      type: 'success',
      title: 'Экспорт завершен',
      message: 'Данные сотрудников успешно экспортированы'
    });
  };

  // Новая функция для обработки загрузки файлов
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        let parsedData = [];

        if (file.name.endsWith('.csv')) {
          // Обработка CSV файлов
          const results = Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              if (result.errors.length > 0) {
                throw new Error(`Ошибка парсинга CSV: ${result.errors[0].message}`);
              }
              return result.data;
            }
          });
          parsedData = results.data;
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Обработка Excel файлов
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet);
        } else {
          throw new Error('Неподдерживаемый формат файла. Используйте CSV или Excel.');
        }

        if (!parsedData || parsedData.length === 0) {
          throw new Error('Файл не содержит данных или имеет неправильный формат');
        }

        // Импорт данных
        handleImport(parsedData);
        
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Ошибка чтения файла',
          message: error.message
        });
      }
    };

    // Чтение файла в правильном формате
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }

    // Сброс значения input для возможности повторной загрузки того же файла
    event.target.value = '';
  };

  // Обновленная функция импорта для работы с массивами объектов
  const handleImport = (parsedData) => {
    try {
      if (!Array.isArray(parsedData)) {
        throw new Error('Данные должны быть массивом');
      }

      const allData = dataService.getData();
      if (!allData) return;

      let addedCount = 0;
      let updatedCount = 0;

      parsedData.forEach(newEmployee => {
        // Нормализация данных из файла
        const normalizedEmployee = {
          name: newEmployee.name || newEmployee['ФИО'] || newEmployee['ФИО сотрудника'] || 'Новый сотрудник',
          employeeId: newEmployee.employeeId || newEmployee['Табельный номер'] || newEmployee['Табельный'] || Date.now().toString(),
          phone: newEmployee.phone || newEmployee['Телефон'] || newEmployee['Номер телефона'] || 'Не указан',
          email: newEmployee.email || newEmployee['Email'] || newEmployee['Почта'] || 'Не указан',
          telegram: newEmployee.telegram || newEmployee['Telegram'] || newEmployee['Телеграм'] || 'Не указан',
          birthDate: newEmployee.birthDate || newEmployee['Дата рождения'] || newEmployee['ДР'] || 'Не указана',
          role: newEmployee.role || newEmployee['Должность'] || newEmployee['Роль'] || 'Сотрудник',
          stores: Array.isArray(newEmployee.stores) ? newEmployee.stores : 
                  (newEmployee.stores ? newEmployee.stores.split(',').map(s => s.trim()) : 
                  (newEmployee['Магазины'] ? newEmployee['Магазины'].split(',').map(s => s.trim()) : ['ЕРС 2334']))
        };

        const existsIndex = allData.employees.findIndex(emp => 
          emp.employeeId === normalizedEmployee.employeeId
        );

        if (existsIndex >= 0) {
          // Обновление существующего сотрудника
          allData.employees[existsIndex] = {
            ...allData.employees[existsIndex],
            ...normalizedEmployee
          };
          updatedCount++;
        } else {
          // Добавление нового сотрудника
          allData.employees.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...normalizedEmployee,
            position: newEmployee.position || newEmployee['Позиция'] || 'Продавец-консультант',
            department: newEmployee.department || newEmployee['Отдел'] || 'Продажи',
            hireDate: newEmployee.hireDate || newEmployee['Дата найма'] || '15.01.2024',
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
          message: `Добавлено ${addedCount} сотрудников, обновлено ${updatedCount} сотрудников`
        });
        setIsImportModalOpen(false);
        // loadEmployees() вызовется автоматически через подписку
      } else {
        addNotification({
          type: 'error',
          title: 'Ошибка импорта',
          message: 'Не удалось сохранить импортированные данные'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка импорта',
        message: error.message
      });
    }
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
          <EmployeeForm
            employeeForm={employeeForm}
            onFormChange={setEmployeeForm}
            showStoresDropdown={showStoresDropdown}
            onToggleStoresDropdown={() => setShowStoresDropdown(!showStoresDropdown)}
            availableStores={availableStores}
            onToggleStore={toggleStore}
          />
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
          <EmployeeForm
            employeeForm={employeeForm}
            onFormChange={setEmployeeForm}
            showStoresDropdown={showStoresDropdown}
            onToggleStoresDropdown={() => setShowStoresDropdown(!showStoresDropdown)}
            availableStores={availableStores}
            onToggleStore={toggleStore}
          />
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
                Загрузите файл (CSV или Excel)
              </label>
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="input-field bg-gray-750 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Поддерживаемые форматы:</h4>
              <ul className="text-blue-300 text-sm list-disc list-inside space-y-1">
                <li>CSV файлы (.csv)</li>
                <li>Excel файлы (.xlsx, .xls)</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Ожидаемые поля в файле:</h4>
              <ul className="text-green-300 text-sm list-disc list-inside space-y-1">
                <li><strong>Обязательные:</strong> name (ФИО), employeeId (Табельный номер)</li>
                <li><strong>Дополнительные:</strong> phone, email, telegram, birthDate, role, stores</li>
                <li><strong>Магазины:</strong> через запятую, например: "ЕРС 2334, ЕРС 2312"</li>
              </ul>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                <strong>Примечание:</strong> Если сотрудник с таким табельным номером уже существует, 
                его данные будут обновлены. Новые сотрудники будут добавлены в систему.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={closeModals}
              className="flex-1 btn-secondary py-3 rounded-xl"
            >
              Закрыть
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Team;