// src/services/exportService.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

class ExportService {
  constructor() {
    this.version = '2.0.0';
  }

  // Основной метод экспорта в Excel с поддержкой нескольких листов
  exportToExcel(sheets, filename = 'eps-export') {
    try {
      // Создаем рабочую книгу
      const totalRecords = sheets.reduce((sum, sheet) => sum + (sheet.data?.length || 0), 0);
      if (totalRecords === 0) {
        console.warn('⚠️ Попытка экспорта пустых данных');
        return false;
      }

      console.log('📤 Начало экспорта:', sheets.length, 'листов,', totalRecords, 'записей');

      const wb = XLSX.utils.book_new();

      // Добавляем каждый лист
      sheets.forEach((sheet, index) => {
        if (sheet.data && sheet.data.length > 0) {
          const ws = XLSX.utils.json_to_sheet(sheet.data);
          const sheetName = sheet.name || `Лист${index + 1}`;
          XLSX.utils.book_append_sheet(wb, ws, sheetName);
          console.log(`✅ Добавлен лист "${sheetName}" с ${sheet.data.length} записями`);
        }

      });
      if (wb.SheetNames.length === 0) {
        console.error('❌ В книге нет листов для экспорта');
        return false;
      }

      // Добавляем лист с метаданными
      const metadata = [{
        'Система': 'ЕРС Аналитика',
        'Версия экспорта': this.version,
        'Дата экспорта': new Date().toLocaleString('ru-RU'),
        'Пользователь': 'Система',
        'Количество листов': sheets.length,
        'Общее количество записей': sheets.reduce((sum, sheet) => sum + (sheet.data?.length || 0), 0)
      }];
      
      const metadataWs = XLSX.utils.json_to_sheet(metadata);
      XLSX.utils.book_append_sheet(wb, metadataWs, 'Метаданные');

      // Генерируем и скачиваем файл
      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `${filename}-${dateStr}.xlsx`);
      
      console.log(`✅ Экспорт завершен: ${sheets.length} листов, ${sheets.reduce((sum, sheet) => sum + (sheet.data?.length || 0), 0)} записей`);
      return true;
    } catch (error) {
      console.error('❌ Ошибка экспорта в Excel:', error);
      this.fallbackExport(sheets, filename);
      return false;
    }
  }

  // Упрощенный экспорт для единого массива данных
  exportData(data, sheetName = 'Данные', filename = 'eps-export') {
    const sheets = [{
      name: sheetName,
      data: Array.isArray(data) ? data : []
    }];
    return this.exportToExcel(sheets, filename);
  }

  // Экспорт для графика работы
  exportScheduleData(data, filename = 'eps-schedule') {
    return this.exportData(data, 'График работы', filename);
  }

  // Запасной вариант экспорта в CSV
  fallbackExport(sheets, filename) {
    if (!sheets || sheets.length === 0) return;
    
    // Используем первый лист для CSV экспорта
    const data = sheets[0]?.data || [];
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Экранируем значения с запятыми
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  }

  // Экспорт данных дашборда
  exportDashboardData(dashboardData, todayStats) {
    const sheets = [
      {
        name: 'Ключевые показатели',
        data: [
          {
            'Показатель': 'Выручка',
            'План (руб)': dashboardData?.revenue?.plan || 0,
            'Факт (руб)': dashboardData?.revenue?.fact || 0,
            'Выполнение (%)': dashboardData?.revenue?.plan ? 
              Math.round(((dashboardData.revenue.fact || 0) / dashboardData.revenue.plan) * 100) : 0,
            'Остаток (руб)': Math.max(0, (dashboardData?.revenue?.plan || 0) - (dashboardData?.revenue?.fact || 0))
          },
          {
            'Показатель': 'Фокусные товары',
            'План (руб)': dashboardData?.focus?.plan || 0,
            'Факт (руб)': dashboardData?.focus?.fact || 0,
            'Выполнение (%)': dashboardData?.focus?.plan ? 
              Math.round(((dashboardData.focus.fact || 0) / dashboardData.focus.plan) * 100) : 0,
            'Остаток (руб)': Math.max(0, (dashboardData?.focus?.plan || 0) - (dashboardData?.focus?.fact || 0))
          },
          {
            'Показатель': 'СБП',
            'План (руб)': dashboardData?.sbp?.plan || 0,
            'Факт (руб)': dashboardData?.sbp?.fact || 0,
            'Выполнение (%)': dashboardData?.sbp?.plan ? 
              Math.round(((dashboardData.sbp.fact || 0) / dashboardData.sbp.plan) * 100) : 0,
            'Остаток (руб)': Math.max(0, (dashboardData?.sbp?.plan || 0) - (dashboardData?.sbp?.fact || 0))
          }
        ]
      },
      {
        name: 'Сегодняшние данные',
        data: [
          {
            'Показатель': 'Общая выручка за сегодня',
            'Сумма (руб)': todayStats?.total || 0,
            'Количество записей': todayStats?.entries?.length || 0,
            'Средний чек': todayStats?.entries?.length > 0 ? 
              Math.round((todayStats.total || 0) / todayStats.entries.length) : 0
          }
        ]
      }
    ];

    // Добавляем детализацию по записям, если есть
    if (todayStats?.entries && todayStats.entries.length > 0) {
      sheets.push({
        name: 'Детализация записей',
        data: todayStats.entries.map((entry, index) => ({
          '№': index + 1,
          'Сотрудник': entry.employeeName || 'Неизвестно',
          'Табельный номер': entry.employeeId || 'Неизвестно',
          'Фокусные товары (руб)': parseInt(entry.focus) || 0,
          'СБП (руб)': parseInt(entry.sbp) || 0,
          'Наличные (руб)': parseInt(entry.cash) || 0,
          'Общая сумма (руб)': (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0),
          'Время внесения': entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString('ru-RU') : 'Неизвестно'
        }))
      });
    }

    return this.exportToExcel(sheets, 'eps-dashboard');
  }

  // Экспорт данных по выручке
  exportRevenueData(revenueEntries, dateRange = null) {
    const sheets = [
      {
        name: 'Данные по выручке',
        data: revenueEntries.map(entry => ({
          'Дата': entry.date,
          'Сотрудник': entry.employeeName,
          'Табельный номер': entry.employeeId,
          'Фокусные товары (руб)': parseInt(entry.focus) || 0,
          'СБП (руб)': parseInt(entry.sbp) || 0,
          'Наличные (руб)': parseInt(entry.cash) || 0,
          'Общая сумма (руб)': (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0),
          'Время внесения': entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString('ru-RU') : 'Неизвестно',
          'День недели': entry.date ? new Date(entry.date).toLocaleDateString('ru-RU', { weekday: 'long' }) : 'Неизвестно'
        }))
      }
    ];

    // Добавляем сводку по дням
    const dailySummary = {};
    revenueEntries.forEach(entry => {
      if (!entry.date) return;
      
      if (!dailySummary[entry.date]) {
        dailySummary[entry.date] = {
          date: entry.date,
          total: 0,
          focus: 0,
          sbp: 0,
          cash: 0,
          entries: 0
        };
      }
      dailySummary[entry.date].total += (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0);
      dailySummary[entry.date].focus += parseInt(entry.focus) || 0;
      dailySummary[entry.date].sbp += parseInt(entry.sbp) || 0;
      dailySummary[entry.date].cash += parseInt(entry.cash) || 0;
      dailySummary[entry.date].entries++;
    });

    sheets.push({
      name: 'Сводка по дням',
      data: Object.values(dailySummary)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(day => ({
          'Дата': day.date,
          'День недели': day.date ? new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'long' }) : 'Неизвестно',
          'Общая выручка (руб)': day.total,
          'Фокусные товары (руб)': day.focus,
          'СБП (руб)': day.sbp,
          'Наличные (руб)': day.cash,
          'Количество записей': day.entries,
          'Средний чек (руб)': day.entries > 0 ? Math.round(day.total / day.entries) : 0
        }))
    });

    // Добавляем сводку по сотрудникам
    const employeeSummary = {};
    revenueEntries.forEach(entry => {
      if (!entry.employeeId) return;
      
      if (!employeeSummary[entry.employeeId]) {
        employeeSummary[entry.employeeId] = {
          employeeId: entry.employeeId,
          employeeName: entry.employeeName,
          total: 0,
          focus: 0,
          sbp: 0,
          cash: 0,
          entries: 0,
          firstEntry: entry.date,
          lastEntry: entry.date
        };
      }
      employeeSummary[entry.employeeId].total += (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0);
      employeeSummary[entry.employeeId].focus += parseInt(entry.focus) || 0;
      employeeSummary[entry.employeeId].sbp += parseInt(entry.sbp) || 0;
      employeeSummary[entry.employeeId].cash += parseInt(entry.cash) || 0;
      employeeSummary[entry.employeeId].entries++;
      
      if (entry.date) {
        if (new Date(entry.date) < new Date(employeeSummary[entry.employeeId].firstEntry)) {
          employeeSummary[entry.employeeId].firstEntry = entry.date;
        }
        if (new Date(entry.date) > new Date(employeeSummary[entry.employeeId].lastEntry)) {
          employeeSummary[entry.employeeId].lastEntry = entry.date;
        }
      }
    });

    sheets.push({
      name: 'Сводка по сотрудникам',
      data: Object.values(employeeSummary)
        .sort((a, b) => b.total - a.total)
        .map(emp => ({
          'Сотрудник': emp.employeeName,
          'Табельный номер': emp.employeeId,
          'Общая выручка (руб)': emp.total,
          'Фокусные товары (руб)': emp.focus,
          'СБП (руб)': emp.sbp,
          'Наличные (руб)': emp.cash,
          'Количество записей': emp.entries,
          'Средний чек (руб)': emp.entries > 0 ? Math.round(emp.total / emp.entries) : 0,
          'Первый внос': emp.firstEntry,
          'Последний внос': emp.lastEntry,
          'Доля фокусных (%)': emp.total > 0 ? Math.round((emp.focus / emp.total) * 100) : 0,
          'Доля СБП (%)': emp.total > 0 ? Math.round((emp.sbp / emp.total) * 100) : 0
        }))
    });

    const filename = dateRange ? 
      `eps-revenue-${dateRange.start}-to-${dateRange.end}` : 
      'eps-revenue';

    return this.exportToExcel(sheets, filename);
  }

  // Экспорт расширенной аналитики
  exportAdvancedAnalytics(analyticsData) {
    const { summary = {}, employeeStats = [], storeStats = [], dateRange = {} } = analyticsData;
    
    const sheets = [
      {
        name: 'Ключевые показатели',
        data: [
          {
            'Показатель': 'Общая выручка',
            'Значение': summary.totalRevenue || 0,
            'Единица измерения': 'руб',
            'Описание': 'Суммарная выручка за период'
          },
          {
            'Показатель': 'Фокусные товары',
            'Значение': summary.totalFocus || 0,
            'Единица измерения': 'руб',
            'Описание': 'Выручка с фокусных товаров'
          },
          {
            'Показатель': 'СБП',
            'Значение': summary.totalSBP || 0,
            'Единица измерения': 'руб',
            'Описание': 'Выручка по системе быстрых платежей'
          },
          {
            'Показатель': 'Наличные',
            'Значение': summary.totalCash || 0,
            'Единица измерения': 'руб',
            'Описание': 'Выручка наличными'
          },
          {
            'Показатель': 'Средняя выручка в день',
            'Значение': Math.round(summary.averagePerDay || 0),
            'Единица измерения': 'руб/день',
            'Описание': 'Среднедневная выручка'
          },
          {
            'Показатель': 'Выполнение плана',
            'Значение': Math.round(summary.averagePlanCompletion || 0),
            'Единица измерения': '%',
            'Описание': 'Средний процент выполнения планов'
          },
          {
            'Показатель': 'Дней с данными',
            'Значение': summary.daysWithData || 0,
            'Единица измерения': 'дней',
            'Описание': 'Количество дней с внесенными данными'
          },
          {
            'Показатель': 'Всего записей',
            'Значение': summary.entryCount || 0,
            'Единица измерения': 'записей',
            'Описание': 'Общее количество записей о выручке'
          }
        ]
      }
    ];

    // Добавляем топ сотрудников, если есть
    if (employeeStats.length > 0) {
      sheets.push({
        name: 'Топ сотрудников',
        data: employeeStats.map((employee, index) => ({
          'Место': index + 1,
          'Сотрудник': employee.name,
          'Табельный номер': employee.id,
          'Общая выручка (руб)': employee.total,
          'Фокусные товары (руб)': employee.focus,
          'СБП (руб)': employee.sbp,
          'Наличные (руб)': employee.cash,
          'Количество записей': employee.entries,
          'Средний чек (руб)': employee.entries > 0 ? Math.round(employee.total / employee.entries) : 0,
          'Доля от общей выручки (%)': summary.totalRevenue > 0 ? 
            Math.round((employee.total / summary.totalRevenue) * 100) : 0,
          'Магазины': Array.isArray(employee.stores) ? employee.stores.join(', ') : ''
        }))
      });
    }

    // Добавляем статистику по магазинам, если есть
    if (storeStats && storeStats.length > 0) {
      sheets.push({
        name: 'Статистика по магазинам',
        data: storeStats.map(store => ({
          'Магазин': store.store,
          'Общая выручка (руб)': store.total,
          'Фокусные товары (руб)': store.focus,
          'СБП (руб)': store.sbp,
          'Наличные (руб)': store.cash,
          'Количество сотрудников': store.employeeCount,
          'Средняя выручка на сотрудника (руб)': Math.round(store.averagePerEmployee || 0),
          'Доля от общей выручки (%)': summary.totalRevenue > 0 ? 
            Math.round((store.total / summary.totalRevenue) * 100) : 0
        }))
      });
    }

    const filename = `eps-advanced-analytics-${dateRange.start || 'start'}-to-${dateRange.end || 'end'}`;
    return this.exportToExcel(sheets, filename);
  }

  // Экспорт кастомного отчета
  exportCustomReport(reportData, reportConfig) {
    const sheets = [];

    // Основные данные отчета
    if (reportData.main && Array.isArray(reportData.main)) {
      sheets.push({
        name: reportConfig.name || 'Кастомный отчет',
        data: reportData.main
      });
    }

    // Сводные данные, если есть
    if (reportData.summary && Array.isArray(reportData.summary)) {
      sheets.push({
        name: 'Сводка',
        data: reportData.summary
      });
    }

    // Детализация, если есть
    if (reportData.details && Array.isArray(reportData.details)) {
      sheets.push({
        name: 'Детализация',
        data: reportData.details
      });
    }

    // Метрики и KPI
    if (reportData.metrics && Array.isArray(reportData.metrics)) {
      sheets.push({
        name: 'Ключевые метрики',
        data: reportData.metrics.map(metric => ({
          'Метрика': metric.name,
          'Значение': metric.value,
          'Единица измерения': metric.unit || '',
          'Изменение': metric.change || '',
          'Тренд': metric.trend || ''
        }))
      });
    }

    const filename = `eps-custom-report-${reportConfig.name || 'report'}`;
    return this.exportToExcel(sheets, filename);
  }

  // Экспорт всех данных системы
  exportAllData() {
    try {
      const allData = JSON.parse(localStorage.getItem('eps-analytics-data') || '{}');
      
      const sheets = [];

      // Сотрудники
      if (allData.employees && Array.isArray(allData.employees)) {
        sheets.push({
          name: 'Сотрудники',
          data: allData.employees.map(emp => ({
            'ID': emp.id,
            'Табельный номер': emp.employeeId,
            'ФИО': emp.name,
            'Телефон': emp.phone,
            'Telegram': emp.telegram,
            'Дата рождения': emp.birthDate,
            'Должность': emp.role,
            'Магазины': Array.isArray(emp.stores) ? emp.stores.join(', ') : '',
            'Дата создания': emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('ru-RU') : 'Неизвестно'
          }))
        });
      }

      // Данные по выручке
      const revenueData = [];
      if (allData.revenueData && typeof allData.revenueData === 'object') {
        Object.entries(allData.revenueData).forEach(([date, entries]) => {
          if (Array.isArray(entries)) {
            entries.forEach(entry => {
              revenueData.push({
                'Дата': date,
                'Табельный номер': entry.employeeId,
                'Сотрудник': entry.employeeName,
                'Фокусные товары': entry.focus,
                'СБП': entry.sbp,
                'Наличные': entry.cash,
                'Общая сумма': (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0),
                'Время внесения': entry.timestamp ? new Date(entry.timestamp).toLocaleString('ru-RU') : 'Неизвестно'
              });
            });
          }
        });
      }

      if (revenueData.length > 0) {
        sheets.push({
          name: 'Данные выручки',
          data: revenueData
        });
      }

      return this.exportToExcel(sheets, 'eps-full-backup');
    } catch (error) {
      console.error('Ошибка экспорта всех данных:', error);
      return false;
    }
  }

  // Экспорт мотивационных данных
  exportMotivationData() {
    try {
      const motivationData = JSON.parse(localStorage.getItem('eps-motivation-data') || '{}');
      
      const sheets = [];

      // Достижения сотрудников
      if (motivationData.achievements && Array.isArray(motivationData.achievements)) {
        sheets.push({
          name: 'Достижения',
          data: motivationData.achievements.map(achievement => ({
            'ID достижения': achievement.id,
            'Табельный номер': achievement.employeeId,
            'Тип достижения': achievement.type,
            'Факт (руб)': achievement.fact,
            'План (руб)': achievement.plan,
            'Выполнение (%)': achievement.percentage,
            'Начислено баллов': achievement.points,
            'Дата достижения': achievement.date,
            'Время записи': achievement.timestamp ? new Date(achievement.timestamp).toLocaleString('ru-RU') : 'Неизвестно'
          }))
        });
      }

      // Статистика сотрудников
      if (motivationData.employees && typeof motivationData.employees === 'object') {
        const employeesData = Object.entries(motivationData.employees).map(([employeeId, stats]) => ({
          'Табельный номер': employeeId,
          'Всего баллов': stats.totalPoints,
          'Баллов за месяц': stats.monthlyPoints,
          'Всего достижений': stats.totalAchievements
        }));

        if (employeesData.length > 0) {
          sheets.push({
            name: 'Статистика баллов',
            data: employeesData
          });
        }
      }

      return this.exportToExcel(sheets, 'eps-motivation-data');
    } catch (error) {
      console.error('Ошибка экспорта мотивационных данных:', error);
      return false;
    }
  }

  // Генерация шаблона для импорта
  generateTemplate(templateType) {
    const templates = {
      employees: [
        {
          'Табельный номер': '12345',
          'ФИО': 'Иванов Иван Иванович',
          'Телефон': '+7 (999) 123-45-67',
          'Telegram': '@ivanov',
          'Дата рождения': '15.03.1990',
          'Должность': 'Сотрудник',
          'Магазины': 'ЕРС 2334'
        }
      ],
      plans: [
        {
          'Дата': '2024-10-01',
          'Выручка (план)': 150000,
          'Фокусные товары (план)': 50000,
          'СБП (план)': 30000
        }
      ],
      revenue: [
        {
          'Дата': '2024-10-01',
          'Табельный номер': '12345',
          'Фокусные товары': 5000,
          'СБП': 3000,
          'Наличные': 2000
        }
      ],
      schedule: [
        {
          'Дата': '2024-10-01',
          'Табельный номер': '12345',
          'Начало смены': '09:00',
          'Конец смены': '18:00',
          'Тип смены': 'work'
        }
      ]
    };

    const template = templates[templateType] || [];
    const sheets = [{
      name: 'Шаблон',
      data: template
    }];

    return this.exportToExcel(sheets, `eps-${templateType}-template`);
  }

  // Утилиты для форматирования
  formatCurrency(value) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(value || 0);
  }

  formatDate(date) {
    return date ? new Date(date).toLocaleDateString('ru-RU') : 'Неизвестно';
  }

  formatDateTime(date) {
    return date ? new Date(date).toLocaleString('ru-RU') : 'Неизвестно';
  }

  // Получение статистики экспорта
  getExportStats() {
    return {
      version: this.version,
      lastExport: localStorage.getItem('eps-last-export') || 'Никогда',
      totalExports: parseInt(localStorage.getItem('eps-total-exports') || '0'),
      supportedFormats: ['xlsx', 'csv (fallback)'],
      features: [
        'Многостраничный экспорт',
        'Поддержка Excel и CSV',
        'Автоматическое форматирование',
        'Шаблоны для импорта',
        'Резервное копирование'
      ]
    };
  }
}

// Создаем и экспортируем экземпляр сервиса
export const exportService = new ExportService();

// Экспортируем класс для тестирования
export { ExportService };