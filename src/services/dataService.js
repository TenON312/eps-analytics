// src/services/dataService.js
class DataService {
  constructor() {
    this.storageKey = 'eps-analytics-data';
    this.listeners = []; // Массив функций-подписчиков на изменения данных
    this.init();
  }

  /**
   * Подписка на изменения данных
   * @param {function} listener - функция, которая будет вызываться при изменениях
   * @returns {function} функция для отписки
   */
  subscribe(listener) {
    this.listeners.push(listener);
    // Возвращаем функцию для отписки
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Уведомление всех подписчиков об изменениях
   */
  notifyListeners() {
    // Создаем копию массива listeners для безопасной итерации
    const currentListeners = [...this.listeners];
    currentListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Ошибка в listener:', error);
      }
    });
  }

  /**
   * Получение всех данных из localStorage
   */
  getData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Ошибка чтения данных:', error);
      return null;
    }
  }

  /**
   * Сохранение данных в localStorage с уведомлением подписчиков
   */
  saveData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      
      // УВЕДОМЛЯЕМ ПОДПИСЧИКОВ ПОСЛЕ СОХРАНЕНИЯ
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error('❌ Ошибка сохранения данных:', error);
      return false;
    }
  }

  /**
   * Инициализация начальных данных
   */
  init() {
    if (!this.getData()) {
      const initialData = {
        employees: [
          {
            id: '1',
            name: 'Иванов Иван Иванович',
            employeeId: '12345',
            phone: '+7 (999) 123-45-67',
            email: 'ivanov@epc.ru',
            telegram: '@ivanov',
            birthDate: '15.03.1990',
            stores: ['ЕРС 2334'],
            role: 'Сотрудник',
            position: 'Продавец-консультант',
            department: 'Продажи',
            hireDate: '15.01.2024',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Петрова Анна Сергеевна',
            employeeId: '12346',
            phone: '+7 (999) 123-45-68',
            email: 'petrova@epc.ru',
            telegram: '@petrova',
            birthDate: '20.07.1985',
            stores: ['ЕРС 2334'],
            role: 'ЗДМ',
            position: 'Заместитель директора магазина',
            department: 'Управление',
            hireDate: '20.01.2024',
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Сидоров Алексей Владимирович',
            employeeId: '12347',
            phone: '+7 (999) 123-45-69',
            email: 'sidorov@epc.ru',
            telegram: '@sidorov',
            birthDate: '10.11.1992',
            stores: ['ЕРС 2312'],
            role: 'Админ',
            position: 'Администратор системы',
            department: 'IT',
            hireDate: '10.01.2024',
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Козлова Мария Петровна',
            employeeId: '12348',
            phone: '+7 (999) 123-45-70',
            email: 'kozlova@epc.ru',
            telegram: '@kozlova',
            birthDate: '05.05.1988',
            stores: ['ЕРС 2312'],
            role: 'ДТК',
            position: 'Директор территории качества',
            department: 'Управление',
            hireDate: '05.01.2024',
            createdAt: new Date().toISOString()
          }
        ],
        revenueData: {
          '2024-09-27': [
            {
              employeeId: '12345',
              employeeName: 'Иванов Иван Иванович',
              focus: '5000',
              sbp: '3000',
              cash: '2000',
              timestamp: new Date().toISOString()
            },
            {
              employeeId: '12346',
              employeeName: 'Петрова Анна Сергеевна',
              focus: '3000',
              sbp: '4000',
              cash: '1000',
              timestamp: new Date().toISOString()
            }
          ]
        },
        plans: {
          '2024-09-27': {
            revenue: 150000,
            focus: 50000,
            sbp: 30000,
            updatedAt: new Date().toISOString()
          }
        },
        schedules: {
          '2024-09-27': [
            {
              employeeId: '12345',
              startTime: '09:00',
              endTime: '18:00',
              type: 'work',
              createdAt: new Date().toISOString()
            }
          ]
        },
        version: '1.0.0',
        lastUpdated: new Date().toISOString()
      };
      this.saveData(initialData);
    } else {
      this.repairData();
    }
  }

  /**
   * Восстановление и ремонт структуры данных
   */
  repairData() {
    const allData = this.getData();
    if (!allData) return;

    let needsRepair = false;

    // Восстановление revenueData
    if (!allData.revenueData || typeof allData.revenueData !== 'object') {
      allData.revenueData = {};
      needsRepair = true;
    }

    Object.keys(allData.revenueData).forEach(date => {
      if (!Array.isArray(allData.revenueData[date])) {
        allData.revenueData[date] = [];
        needsRepair = true;
      }
    });

    // Восстановление employees
    if (!Array.isArray(allData.employees)) {
      allData.employees = [];
      needsRepair = true;
    } else {
      allData.employees = allData.employees.map(emp => ({
        id: String(emp.id || Date.now().toString()),
        name: String(emp.name || 'Неизвестный сотрудник'),
        employeeId: String(emp.employeeId || '00000'),
        phone: String(emp.phone || 'Не указан'),
        email: String(emp.email || 'Не указан'),
        telegram: String(emp.telegram || 'Не указан'),
        birthDate: String(emp.birthDate || 'Не указана'),
        stores: Array.isArray(emp.stores) ? emp.stores : ['ЕРС 2334'],
        role: String(emp.role || 'Сотрудник'),
        position: String(emp.position || 'Продавец-консультант'),
        department: String(emp.department || 'Продажи'),
        hireDate: String(emp.hireDate || '15.01.2024'),
        createdAt: emp.createdAt || new Date().toISOString()
      }));
    }

    if (needsRepair) {
      console.warn('🔧 Данные были восстановлены');
      this.saveData(allData);
    }

    return allData;
  }

  /**
   * Получение текущей даты в формате YYYY-MM-DD
   */
  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Очистка числовых значений
   */
  sanitizeNumber(value) {
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
      const num = value.replace(/[^\d]/g, '');
      return num || '0';
    }
    return '0';
  }

  // ========== МЕТОДЫ ДЛЯ РАБОТЫ С СОТРУДНИКАМИ ==========

  /**
   * Получение всех сотрудников
   */
  getEmployees() {
    const allData = this.getData();
    return allData ? allData.employees : [];
  }

  /**
   * Поиск сотрудника по табельному номеру
   */
  getEmployeeById(employeeId) {
    const allData = this.getData();
    if (!allData) return null;
    return allData.employees.find(emp => emp.employeeId === employeeId);
  }

  /**
   * Обновление данных сотрудника
   */
  updateEmployee(employeeId, updatedData) {
    const allData = this.getData();
    if (!allData) {
      console.error('❌ Нет данных для обновления');
      return false;
    }

    const employeeIndex = allData.employees.findIndex(emp => emp.employeeId === employeeId);
    if (employeeIndex === -1) {
      console.error('❌ Сотрудник не найден:', employeeId);
      return false;
    }

    // СОЗДАЕМ НОВЫЙ МАССИВ СОТРУДНИКОВ (важно для React)
    const updatedEmployees = [...allData.employees];
    
    // СОЗДАЕМ НОВЫЙ ОБЪЕКТ СОТРУДНИКА
    updatedEmployees[employeeIndex] = {
      ...updatedEmployees[employeeIndex],
      ...updatedData
    };

    // ИСПРАВЛЕНИЕ: Сохраняем правильную структуру данных
    const success = this.saveData({
      ...allData,
      employees: updatedEmployees
    });

    console.log('🔄 Обновление сотрудника:', {
      employeeId,
      updatedData,
      result: updatedEmployees[employeeIndex]
    });

    return success;
  }

  /**
   * Добавление нового сотрудника
   */
  addEmployee(employeeData) {
    const allData = this.getData();
    if (!allData) return false;

    const newEmployee = {
      id: Date.now().toString(),
      name: String(employeeData.name || 'Новый сотрудник'),
      employeeId: String(employeeData.employeeId || Date.now().toString()),
      phone: String(employeeData.phone || 'Не указан'),
      email: String(employeeData.email || 'Не указан'),
      telegram: String(employeeData.telegram || 'Не указан'),
      birthDate: String(employeeData.birthDate || 'Не указана'),
      stores: Array.isArray(employeeData.stores) ? employeeData.stores : ['ЕРС 2334'],
      role: String(employeeData.role || 'Сотрудник'),
      position: String(employeeData.position || 'Продавец-консультант'),
      department: String(employeeData.department || 'Продажи'),
      hireDate: String(employeeData.hireDate || '15.01.2024'),
      createdAt: new Date().toISOString()
    };

    // СОЗДАЕМ НОВЫЙ МАССИВ
    const newData = {
      ...allData,
      employees: [...allData.employees, newEmployee]
    };

    return this.saveData(newData);
  }

  /**
   * Удаление сотрудника
   */
  deleteEmployee(employeeId) {
    const allData = this.getData();
    if (!allData) return false;

    // СОЗДАЕМ НОВЫЙ МАССИВ БЕЗ УДАЛЕННОГО СОТРУДНИКА
    const newData = {
      ...allData,
      employees: allData.employees.filter(emp => emp.id !== employeeId)
    };

    return this.saveData(newData);
  }

  // ========== МЕТОДЫ ДЛЯ РАБОТЫ С ВЫРУЧКОЙ ==========

  /**
   * Сохранение записи о выручке
   */
  saveRevenueEntry(date, employeeId, employeeName, data) {
    try {
      const allData = this.getData();
      if (!allData) {
        console.error('❌ Нет данных для сохранения');
        return false;
      }

      const entryDate = date || this.getCurrentDate();
      const safeEmployeeId = String(employeeId || 'unknown');
      const safeEmployeeName = String(employeeName || `Сотрудник ${safeEmployeeId}`);
      
      const safeData = {
        focus: this.sanitizeNumber(data?.focus),
        sbp: this.sanitizeNumber(data?.sbp),
        cash: this.sanitizeNumber(data?.cash)
      };

      console.log('🔄 Сохранение данных выручки:', { 
        date: entryDate, 
        employeeId: safeEmployeeId, 
        employeeName: safeEmployeeName,
        data: safeData 
      });

      // СОЗДАЕМ НОВЫЕ СТРУКТУРЫ ДАННЫХ
      const newRevenueData = { ...allData.revenueData };
      if (!newRevenueData[entryDate]) {
        newRevenueData[entryDate] = [];
      }
      
      const newDateEntries = [...newRevenueData[entryDate]];
      const existingIndex = newDateEntries.findIndex(
        entry => entry.employeeId === safeEmployeeId
      );
      
      const entryData = {
        employeeId: safeEmployeeId,
        employeeName: safeEmployeeName,
        focus: safeData.focus,
        sbp: safeData.sbp,
        cash: safeData.cash,
        timestamp: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        newDateEntries[existingIndex] = entryData;
      } else {
        newDateEntries.push(entryData);
      }
      
      newRevenueData[entryDate] = newDateEntries;
      
      const newData = {
        ...allData,
        revenueData: newRevenueData
      };
      
      const success = this.saveData(newData);
      if (success) {
        console.log('✓ Данные выручки успешно сохранены');
      } else {
        console.error('❌ Ошибка сохранения данных выручки');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Критическая ошибка в saveRevenueEntry:', error);
      return false;
    }
  }

  /**
   * Получение дневной выручки
   */
  getDailyRevenue(date) {
    const allData = this.getData();
    if (!allData) return { focus: 0, sbp: 0, cash: 0 };

    const entryDate = date || this.getCurrentDate();
    const dailyData = allData.revenueData[entryDate] || [];
    
    return dailyData.reduce((total, entry) => ({
      focus: total.focus + (parseInt(entry.focus) || 0),
      sbp: total.sbp + (parseInt(entry.sbp) || 0),
      cash: total.cash + (parseInt(entry.cash) || 0)
    }), { focus: 0, sbp: 0, cash: 0 });
  }

  /**
   * Получение записей о выручке за день
   */
  getRevenueEntries(date) {
    const allData = this.getData();
    if (!allData) return [];

    const entryDate = date || this.getCurrentDate();
    return allData.revenueData[entryDate] || [];
  }

  // ========== МЕТОДЫ ДЛЯ РАБОТЫ С ПЛАНАМИ ==========

  /**
   * Сохранение дневного плана
   */
  saveDailyPlan(date, planData) {
    const allData = this.getData();
    if (!allData) return false;

    const planDate = date || this.getCurrentDate();
    
    const newData = {
      ...allData,
      plans: {
        ...allData.plans,
        [planDate]: {
          revenue: parseInt(planData.revenue) || 0,
          focus: parseInt(planData.focus) || 0,
          sbp: parseInt(planData.sbp) || 0,
          updatedAt: new Date().toISOString()
        }
      }
    };
    
    return this.saveData(newData);
  }

  /**
   * Получение дневного плана
   */
  getDailyPlan(date) {
    const allData = this.getData();
    if (!allData) return null;

    const planDate = date || this.getCurrentDate();
    return allData.plans[planDate] || null;
  }

  getPlansForMonth(year, month) {
    const allData = this.getData();
    if (!allData || !allData.plans) return {};

    const plansInMonth = {};
    Object.keys(allData.plans).forEach(dateStr => {
      const date = new Date(dateStr);
      if (date.getFullYear() === year && (date.getMonth() + 1) === month) {
        plansInMonth[dateStr] = allData.plans[dateStr];
      }
    });

    return plansInMonth;
  }
  // ========== МЕТОДЫ ДЛЯ РАБОТЫ С РАСПИСАНИЕМ ==========

  /**
   * Сохранение записи расписания
   */
  saveScheduleEntry(date, employeeId, scheduleData) {
    const allData = this.getData();
    if (!allData) return false;

    const scheduleDate = date || this.getCurrentDate();
    
    // СОЗДАЕМ НОВЫЕ СТРУКТУРЫ ДАННЫХ
    const newSchedules = { ...(allData.schedules || {}) };
    if (!newSchedules[scheduleDate]) {
      newSchedules[scheduleDate] = [];
    }

    const newDateSchedules = [...newSchedules[scheduleDate]];
    const existingIndex = newDateSchedules.findIndex(
      entry => entry.employeeId === employeeId
    );

    const entryData = {
      employeeId: String(employeeId),
      startTime: String(scheduleData.startTime || '09:00'),
      endTime: String(scheduleData.endTime || '18:00'),
      type: String(scheduleData.type || 'work'),
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      newDateSchedules[existingIndex] = entryData;
    } else {
      newDateSchedules.push(entryData);
    }

    newSchedules[scheduleDate] = newDateSchedules;

    const newData = {
      ...allData,
      schedules: newSchedules
    };

    return this.saveData(newData);
  }

  /**
   * Получение расписания на дату
   */
  getScheduleForDate(date) {
    const allData = this.getData();
    if (!allData || !allData.schedules) return [];
    return allData.schedules[date] || [];
  }

  // ========== СЛУЖЕБНЫЕ МЕТОДЫ ==========

  /**
   * Экспорт всех данных
   */
  exportData() {
    return this.getData();
  }

  /**
   * Импорт данных
   */
  importData(newData) {
    try {
      const success = this.saveData(newData);
      if (success) {
        console.log('✓ Данные успешно импортированы');
      }
      return success;
    } catch (error) {
      console.error('❌ Ошибка импорта данных:', error);
      return false;
    }
  }

  /**
   * Очистка всех данных
   */
  clearAllData() {
    try {
      localStorage.removeItem(this.storageKey);
      this.init();
      return true;
    } catch (error) {
      console.error('❌ Ошибка очистки данных:', error);
      return false;
    }
  }

  /**
   * Получение информации о хранилище
   */
  getStorageInfo() {
    const data = this.getData();
    return {
      employeesCount: data?.employees?.length || 0,
      revenueDays: Object.keys(data?.revenueData || {}).length,
      plansCount: Object.keys(data?.plans || {}).length,
      schedulesCount: Object.keys(data?.schedules || {}).length,
      version: data?.version || 'unknown',
      lastUpdated: data?.lastUpdated || 'unknown'
    };
  }
  getEmployeeSchedule(employeeId, month, year) {
    const allData = this.getData();
    if (!allData || !allData.schedules) return {};

    const employeeSchedules = {};
    Object.keys(allData.schedules).forEach(dateStr => {
      const date = new Date(dateStr);
      if (date.getFullYear() === year && (date.getMonth() + 1) === month) {
        const schedule = allData.schedules[dateStr].find(s => s.employeeId === employeeId);
        if (schedule) {
          employeeSchedules[dateStr] = schedule;
        }
      }
    });

    return employeeSchedules;
}
}

// Создаем и экспортируем экземпляр сервиса
export const dataService = new DataService();

// Экспортируем dashboardService как именованный экспорт
export const dashboardService = {
  getDashboardData: (date = new Date().toISOString().split('T')[0]) => {
    const dailyRevenue = dataService.getDailyRevenue(date);
    const plan = dataService.getDailyPlan(date) || {
      revenue: 150000,
      focus: 50000,
      sbp: 30000
    };

    const totalRevenue = dailyRevenue.focus + dailyRevenue.sbp + dailyRevenue.cash;
    
    return {
      revenue: { 
        plan: plan.revenue, 
        fact: totalRevenue,
        title: 'Выручка'
      },
      focus: { 
        plan: plan.focus, 
        fact: dailyRevenue.focus,
        title: 'Фокусные товары'
      },
      sbp: { 
        plan: plan.sbp, 
        fact: dailyRevenue.sbp,
        title: 'СБП'
      },
      rawData: dailyRevenue
    };
  },

  getTodayStats: () => {
    const today = new Date().toISOString().split('T')[0];
    const data = dataService.getDailyRevenue(today);
    const entries = dataService.getRevenueEntries(today);
    
    return {
      total: data.focus + data.sbp + data.cash,
      entries: entries || []
    };
  }
};