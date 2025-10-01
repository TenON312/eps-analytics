// src/services/dataService.js
class DataService {
  constructor() {
    this.storageKey = 'eps-analytics-data';
    this.init();
  }

  init() {
    if (!this.getData()) {
      const initialData = {
        employees: [
          {
            id: '1',
            name: 'Иванов Иван Иванович',
            employeeId: '12345',
            phone: '+7 (999) 123-45-67',
            telegram: '@ivanov',
            birthDate: '15.03.1990',
            stores: ['ЕРС 2334'],
            role: 'Сотрудник',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Петрова Анна Сергеевна',
            employeeId: '12346',
            phone: '+7 (999) 123-45-68',
            telegram: '@petrova',
            birthDate: '20.07.1985',
            stores: ['ЕРС 2334'],
            role: 'ЗДМ',
            createdAt: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Сидоров Алексей Владимирович',
            employeeId: '12347',
            phone: '+7 (999) 123-45-69',
            telegram: '@sidorov',
            birthDate: '10.11.1992',
            stores: ['ЕРС 2312'],
            role: 'Админ',
            createdAt: new Date().toISOString()
          },
          {
            id: '4',
            name: 'Козлова Мария Петровна',
            employeeId: '12348',
            phone: '+7 (999) 123-45-70',
            telegram: '@kozlova',
            birthDate: '05.05.1988',
            stores: ['ЕРС 2312'],
            role: 'ДТК',
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

  getData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Ошибка чтения данных:', error);
      this.backupCorruptedData();
      return null;
    }
  }

  saveData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('❌ Ошибка сохранения данных:', error);
      return false;
    }
  }

  backupCorruptedData() {
    try {
      const corrupted = localStorage.getItem(this.storageKey);
      if (corrupted) {
        localStorage.setItem(`${this.storageKey}-backup-${Date.now()}`, corrupted);
        localStorage.removeItem(this.storageKey);
      }
    } catch (error) {
      console.error('❌ Ошибка резервного копирования:', error);
    }
  }

  repairData() {
    const allData = this.getData();
    if (!allData) return;

    let needsRepair = false;

    if (!allData.revenueData || typeof allData.revenueData !== 'object') {
      allData.revenueData = {};
      needsRepair = true;
    }

    Object.keys(allData.revenueData).forEach(date => {
      if (!Array.isArray(allData.revenueData[date])) {
        allData.revenueData[date] = [];
        needsRepair = true;
      } else {
        allData.revenueData[date] = allData.revenueData[date].map(entry => {
          if (!entry || typeof entry !== 'object') {
            needsRepair = true;
            return null;
          }

          const repairedEntry = {
            employeeId: String(entry.employeeId || 'unknown'),
            employeeName: String(entry.employeeName || 'Неизвестный сотрудник'),
            focus: this.sanitizeNumber(entry.focus),
            sbp: this.sanitizeNumber(entry.sbp),
            cash: this.sanitizeNumber(entry.cash),
            timestamp: entry.timestamp || new Date().toISOString()
          };

          if (JSON.stringify(entry) !== JSON.stringify(repairedEntry)) {
            needsRepair = true;
          }

          return repairedEntry;
        }).filter(entry => entry !== null);
      }
    });

    if (!allData.plans || typeof allData.plans !== 'object') {
      allData.plans = {};
      needsRepair = true;
    }

    if (!Array.isArray(allData.employees)) {
      allData.employees = [];
      needsRepair = true;
    } else {
      allData.employees = allData.employees.map(emp => ({
        id: String(emp.id || Date.now().toString()),
        name: String(emp.name || 'Неизвестный сотрудник'),
        employeeId: String(emp.employeeId || '00000'),
        phone: String(emp.phone || 'Не указан'),
        telegram: String(emp.telegram || 'Не указан'),
        birthDate: String(emp.birthDate || 'Не указана'),
        stores: Array.isArray(emp.stores) ? emp.stores : ['ЕРС 2334'],
        role: String(emp.role || 'Сотрудник'),
        createdAt: emp.createdAt || new Date().toISOString()
      }));
    }

    if (needsRepair) {
      console.warn('🔧 Данные были восстановлены');
      this.saveData(allData);
    }

    return allData;
  }

  sanitizeNumber(value) {
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
      const num = value.replace(/[^\d]/g, '');
      return num || '0';
    }
    return '0';
  }

  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

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

      console.log('🔄 Сохранение данных:', { 
        date: entryDate, 
        employeeId: safeEmployeeId, 
        employeeName: safeEmployeeName,
        data: safeData 
      });

      if (!allData.revenueData[entryDate]) {
        allData.revenueData[entryDate] = [];
      }
      
      const existingIndex = allData.revenueData[entryDate].findIndex(
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
        allData.revenueData[entryDate][existingIndex] = entryData;
        console.log('✓ Обновлена существующая запись');
      } else {
        allData.revenueData[entryDate].push(entryData);
        console.log('✓ Добавлена новая запись');
      }
      
      const success = this.saveData(allData);
      if (success) {
        console.log('✓ Данные успешно сохранены в localStorage');
      } else {
        console.error('❌ Ошибка сохранения в localStorage');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Критическая ошибка в saveRevenueEntry:', error);
      return false;
    }
  }

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

  getRevenueEntries(date) {
    const allData = this.getData();
    if (!allData) return [];

    const entryDate = date || this.getCurrentDate();
    return allData.revenueData[entryDate] || [];
  }

  addEmployee(employeeData) {
    const allData = this.getData();
    if (!allData) return false;

    const newEmployee = {
      id: Date.now().toString(),
      name: String(employeeData.name || 'Новый сотрудник'),
      employeeId: String(employeeData.employeeId || Date.now().toString()),
      phone: String(employeeData.phone || 'Не указан'),
      telegram: String(employeeData.telegram || 'Не указан'),
      birthDate: String(employeeData.birthDate || 'Не указана'),
      stores: Array.isArray(employeeData.stores) ? employeeData.stores : ['ЕРС 2334'],
      role: String(employeeData.role || 'Сотрудник'),
      createdAt: new Date().toISOString()
    };

    allData.employees.push(newEmployee);
    return this.saveData(allData);
  }

  getEmployees() {
    const allData = this.getData();
    return allData ? allData.employees : [];
  }

  getEmployeeById(employeeId) {
    const allData = this.getData();
    if (!allData) return null;
    return allData.employees.find(emp => emp.employeeId === employeeId);
  }

  saveDailyPlan(date, planData) {
    const allData = this.getData();
    if (!allData) return false;

    const planDate = date || this.getCurrentDate();
    
    allData.plans[planDate] = {
      revenue: parseInt(planData.revenue) || 0,
      focus: parseInt(planData.focus) || 0,
      sbp: parseInt(planData.sbp) || 0,
      updatedAt: new Date().toISOString()
    };
    
    return this.saveData(allData);
  }

  getDailyPlan(date) {
    const allData = this.getData();
    if (!allData) return null;

    const planDate = date || this.getCurrentDate();
    return allData.plans[planDate] || null;
  }

  getPlansForMonth(year, month) {
    const allData = this.getData();
    if (!allData) return {};

    const monthPlans = {};
    const daysInMonth = new Date(year, month, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      monthPlans[date] = allData.plans[date] || null;
    }
    
    return monthPlans;
  }

  saveScheduleEntry(date, employeeId, scheduleData) {
    const allData = this.getData();
    if (!allData) return false;

    if (!allData.schedules) {
      allData.schedules = {};
    }

    const scheduleDate = date || this.getCurrentDate();
    
    if (!allData.schedules[scheduleDate]) {
      allData.schedules[scheduleDate] = [];
    }

    const existingIndex = allData.schedules[scheduleDate].findIndex(
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
      allData.schedules[scheduleDate][existingIndex] = entryData;
    } else {
      allData.schedules[scheduleDate].push(entryData);
    }

    return this.saveData(allData);
  }

  getScheduleForDate(date) {
    const allData = this.getData();
    if (!allData || !allData.schedules) return [];
    return allData.schedules[date] || [];
  }

  getEmployeeSchedule(employeeId, month, year) {
    const allData = this.getData();
    if (!allData || !allData.schedules) return {};

    const schedule = {};
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dailySchedule = allData.schedules[date] || [];
      const employeeSchedule = dailySchedule.find(entry => entry.employeeId === employeeId);
      
      if (employeeSchedule) {
        schedule[date] = employeeSchedule;
      }
    }

    return schedule;
  }

  copySchedule(sourceDate, targetDates) {
    const allData = this.getData();
    if (!allData || !allData.schedules) return false;

    const sourceSchedules = allData.schedules[sourceDate] || [];
    
    targetDates.forEach(targetDate => {
      if (!allData.schedules[targetDate]) {
        allData.schedules[targetDate] = [];
      }
      
      // Удаляем существующие записи на целевую дату
      allData.schedules[targetDate] = [];
      
      // Копируем расписание
      sourceSchedules.forEach(schedule => {
        allData.schedules[targetDate].push({
          ...schedule,
          createdAt: new Date().toISOString()
        });
      });
    });

    return this.saveData(allData);
  }

  exportData() {
    return this.getData();
  }

  importData(newData) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(newData));
      this.repairData();
      return true;
    } catch (error) {
      console.error('❌ Ошибка импорта данных:', error);
      return false;
    }
  }

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
}

// Создаем экземпляр сервиса
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