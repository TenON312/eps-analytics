// src/services/exportService.js
class ExportService {
  constructor() {
    this.version = '2.0.0';
  }

  // Основной метод экспорта в Excel с поддержкой нескольких листов
  exportToExcel(sheets, filename = 'eps-export') {
    try {
      // Проверяем, установлена ли библиотека xlsx
      if (typeof XLSX === 'undefined') {
        console.warn('Библиотека XLSX не установлена. Установите: npm install xlsx');
        this.fallbackExport(sheets, filename);
        return false;
      }

      // Создаем рабочую книгу
      const wb = XLSX.utils.book_new();
      
      // Добавляем каждый лист
      sheets.forEach((sheet, index) => {
        const ws = XLSX.utils.json_to_sheet(sheet.data || []);
        const sheetName = sheet.name || `Лист${index + 1}`;
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

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
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Экспорт данных дашборда
  exportDashboardData(dashboardData, todayStats) {
    const sheets = [
      {
        name: 'Ключевые показатели',
        data: [
          {
            'Показатель': 'Выручка',
            'План (руб)': dashboardData.revenue?.plan || 0,
            'Факт (руб)': dashboardData.revenue?.fact || 0,
            'Выполнение (%)': dashboardData.revenue?.plan ? 
              Math.round((dashboardData.revenue.fact / dashboardData.revenue.plan) * 100) : 0,
            'Остаток (руб)': Math.max(0, (dashboardData.revenue?.plan || 0) - (dashboardData.revenue?.fact || 0))
          },
          {
            'Показатель': 'Фокусные товары',
            'План (руб)': dashboardData.focus?.plan || 0,
            'Факт (руб)': dashboardData.focus?.fact || 0,
            'Выполнение (%)': dashboardData.focus?.plan ? 
              Math.round((dashboardData.focus.fact / dashboardData.focus.plan) * 100) : 0,
            'Остаток (руб)': Math.max(0, (dashboardData.focus?.plan || 0) - (dashboardData.focus?.fact || 0))
          },
          {
            'Показатель': 'СБП',
            'План (руб)': dashboardData.sbp?.plan || 0,
            'Факт (руб)': dashboardData.sbp?.fact || 0,
            'Выполнение (%)': dashboardData.sbp?.plan ? 
              Math.round((dashboardData.sbp.fact / dashboardData.sbp.plan) * 100) : 0,
            'Остаток (руб)': Math.max(0, (dashboardData.sbp?.plan || 0) - (dashboardData.sbp?.fact || 0))
          }
        ]
      },
      {
        name: 'Сегодняшние данные',
        data: [
          {
            'Показатель': 'Общая выручка за сегодня',
            'Сумма (руб)': todayStats.total || 0,
            'Количество записей': todayStats.entries?.length || 0,
            'Средний чек': todayStats.entries?.length > 0 ? 
              Math.round(todayStats.total / todayStats.entries.length) : 0
          }
        ]
      }
    ];

    // Добавляем детализацию по записям, если есть
    if (todayStats.entries && todayStats.entries.length > 0) {
      sheets.push({
        name: 'Детализация записей',
        data: todayStats.entries.map((entry, index) => ({
          '№': index + 1,
          'Сотрудник': entry.employeeName,
          'Табельный номер': entry.employeeId,
          'Фокусные товары (руб)': parseInt(entry.focus) || 0,
          'СБП (руб)': parseInt(entry.sbp) || 0,
          'Наличные (руб)': parseInt(entry.cash) || 0,
          'Общая сумма (руб)': (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0),
          'Время внесения': new Date(entry.timestamp).toLocaleTimeString('ru-RU')
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
          'Время внесения': new Date(entry.timestamp).toLocaleTimeString('ru-RU'),
          'День недели': new Date(entry.date).toLocaleDateString('ru-RU', { weekday: 'long' })
        }))
      }
    ];

    // Добавляем сводку по дням
    const dailySummary = {};
    revenueEntries.forEach(entry => {
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
          'День недели': new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'long' }),
          'Общая выручка (руб)': day.total,
          'Фокусные товары (руб)': day.focus,
          'СБП (руб)': day.sbp,
          'Наличные (руб)': day.cash,
          'Количество записей': day.entries,
          'Средний чек (руб)': Math.round(day.total / day.entries)
        }))
    });

    // Добавляем сводку по сотрудникам
    const employeeSummary = {};
    revenueEntries.forEach(entry => {
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
      
      if (new Date(entry.date) < new Date(employeeSummary[entry.employeeId].firstEntry)) {
        employeeSummary[entry.employeeId].firstEntry = entry.date;
      }
      if (new Date(entry.date) > new Date(employeeSummary[entry.employeeId].lastEntry)) {
        employeeSummary[entry.employeeId].lastEntry = entry.date;
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
          'Средний чек (руб)': Math.round(emp.total / emp.entries),
          'Первый внос': emp.firstEntry,
          'Последний внос': emp.lastEntry,
          'Доля фокусных (%)': Math.round((emp.focus / emp.total) * 100) || 0,
          'Доля СБП (%)': Math.round((emp.sbp / emp.total) * 100) || 0
        }))
    });

    const filename = dateRange ? 
      `eps-revenue-${dateRange.start}-to-${dateRange.end}` : 
      'eps-revenue';

    return this.exportToExcel(sheets, filename);
  }

  // Экспорт расширенной аналитики
  exportAdvancedAnalytics(analyticsData) {
    const { summary, employeeStats, storeStats, dateRange } = analyticsData;
    
    const sheets = [
      {
        name: 'Ключевые показатели',
        data: [
          {
            'Показатель': 'Общая выручка',
            'Значение': summary.totalRevenue,
            'Единица измерения': 'руб',
            'Описание': 'Суммарная выручка за период'
          },
          {
            'Показатель': 'Фокусные товары',
            'Значение': summary.totalFocus,
            'Единица измерения': 'руб',
            'Описание': 'Выручка с фокусных товаров'
          },
          {
            'Показатель': 'СБП',
            'Значение': summary.totalSBP,
            'Единица измерения': 'руб',
            'Описание': 'Выручка по системе быстрых платежей'
          },
          {
            'Показатель': 'Наличные',
            'Значение': summary.totalCash,
            'Единица измерения': 'руб',
            'Описание': 'Выручка наличными'
          },
          {
            'Показатель': 'Средняя выручка в день',
            'Значение': Math.round(summary.averagePerDay),
            'Единица измерения': 'руб/день',
            'Описание': 'Среднедневная выручка'
          },
          {
            'Показатель': 'Выполнение плана',
            'Значение': Math.round(summary.averagePlanCompletion),
            'Единица измерения': '%',
            'Описание': 'Средний процент выполнения планов'
          },
          {
            'Показатель': 'Дней с данными',
            'Значение': summary.daysWithData,
            'Единица измерения': 'дней',
            'Описание': 'Количество дней с внесенными данными'
          },
          {
            'Показатель': 'Всего записей',
            'Значение': summary.entryCount,
            'Единица измерения': 'записей',
            'Описание': 'Общее количество записей о выручке'
          }
        ]
      },
      {
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
          'Средний чек (руб)': Math.round(employee.total / employee.entries),
          'Доля от общей выручки (%)': summary.totalRevenue > 0 ? 
            Math.round((employee.total / summary.totalRevenue) * 100) : 0,
          'Магазины': employee.stores.join(', ')
        }))
      }
    ];

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
          'Средняя выручка на сотрудника (руб)': Math.round(store.averagePerEmployee),
          'Доля от общей выручки (%)': summary.totalRevenue > 0 ? 
            Math.round((store.total / summary.totalRevenue) * 100) : 0
        }))
      });
    }

    // Добавляем тренды и анализ
    sheets.push({
      name: 'Анализ эффективности',
      data: [
        {
          'Метрика': 'Эффективность сотрудников',
          'Значение': employeeStats.length > 0 ? Math.round(employeeStats[0].total / (employeeStats[employeeStats.length - 1]?.total || 1)) : 0,
          'Описание': 'Соотношение выручки лучшего и худшего сотрудника'
        },
        {
          'Метрика': 'Распределение выручки',
          'Значение': Math.round((summary.totalFocus / summary.totalRevenue) * 100) || 0,
          'Описание': 'Доля фокусных товаров в общей выручке (%)'
        },
        {
          'Метрика': 'Проникновение СБП',
          'Значение': Math.round((summary.totalSBP / summary.totalRevenue) * 100) || 0,
          'Описание': 'Доля СБП в общей выручке (%)'
        },
        {
          'Метрика': 'Стабильность работы',
          'Значение': Math.round((summary.daysWithData / ((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60 * 24) + 1)) * 100),
          'Описание': 'Процент дней с внесенными данными'
        }
      ]
    });

    const filename = `eps-advanced-analytics-${dateRange.start}-to-${dateRange.end}`;
    return this.exportToExcel(sheets, filename);
  }

  // Экспорт кастомного отчета
  exportCustomReport(reportData, reportConfig) {
    const sheets = [];

    // Основные данные отчета
    sheets.push({
      name: reportConfig.name || 'Кастомный отчет',
      data: reportData.main || []
    });

    // Сводные данные, если есть
    if (reportData.summary) {
      sheets.push({
        name: 'Сводка',
        data: reportData.summary
      });
    }

    // Детализация, если есть
    if (reportData.details) {
      sheets.push({
        name: 'Детализация',
        data: reportData.details
      });
    }

    // Метрики и KPI
    if (reportData.metrics) {
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
    const allData = JSON.parse(localStorage.getItem('eps-analytics-data') || '{}');
    
    const sheets = [];

    // Сотрудники
    if (allData.employees && allData.employees.length > 0) {
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
          'Магазины': emp.stores.join(', '),
          'Дата создания': new Date(emp.createdAt).toLocaleDateString('ru-RU')
        }))
      });
    }

    // Данные по выручке
    const revenueData = [];
    Object.entries(allData.revenueData || {}).forEach(([date, entries]) => {
      entries.forEach(entry => {
        revenueData.push({
          'Дата': date,
          'Табельный номер': entry.employeeId,
          'Сотрудник': entry.employeeName,
          'Фокусные товары': entry.focus,
          'СБП': entry.sbp,
          'Наличные': entry.cash,
          'Общая сумма': (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0),
          'Время внесения': new Date(entry.timestamp).toLocaleString('ru-RU')
        });
      });
    });

    if (revenueData.length > 0) {
      sheets.push({
        name: 'Данные выручки',
        data: revenueData
      });
    }

    // Планы
    const plansData = [];
    Object.entries(allData.plans || {}).forEach(([date, plan]) => {
      plansData.push({
        'Дата': date,
        'План по выручке': plan.revenue,
        'План по фокусным': plan.focus,
        'План по СБП': plan.sbp,
        'Общий план': plan.revenue + plan.focus + plan.sbp,
        'Дата обновления': new Date(plan.updatedAt).toLocaleString('ru-RU')
      });
    });

    if (plansData.length > 0) {
      sheets.push({
        name: 'Планы',
        data: plansData
      });
    }

    // График работы
    const scheduleData = [];
    Object.entries(allData.schedules || {}).forEach(([date, schedules]) => {
      schedules.forEach(schedule => {
        const employee = allData.employees.find(emp => emp.employeeId === schedule.employeeId);
        scheduleData.push({
          'Дата': date,
          'Табельный номер': schedule.employeeId,
          'Сотрудник': employee?.name || 'Неизвестно',
          'Начало смены': schedule.startTime,
          'Конец смены': schedule.endTime,
          'Тип смены': schedule.type,
          'Дата создания': new Date(schedule.createdAt).toLocaleString('ru-RU')
        });
      });
    });

    if (scheduleData.length > 0) {
      sheets.push({
        name: 'График работы',
        data: scheduleData
      });
    }

    // Системная информация
    sheets.push({
      name: 'Системная информация',
      data: [
        {
          'Версия данных': allData.version || '1.0.0',
          'Последнее обновление': new Date(allData.lastUpdated).toLocaleString('ru-RU'),
          'Количество сотрудников': allData.employees?.length || 0,
          'Количество дней с данными': Object.keys(allData.revenueData || {}).length,
          'Количество планов': Object.keys(allData.plans || {}).length,
          'Количество записей в графике': Object.keys(allData.schedules || {}).length
        }
      ]
    });

    return this.exportToExcel(sheets, 'eps-full-backup');
  }

  // Экспорт мотивационных данных
  exportMotivationData() {
    try {
      const motivationData = JSON.parse(localStorage.getItem('eps-motivation-data') || '{}');
      
      const sheets = [];

      // Достижения сотрудников
      if (motivationData.achievements && motivationData.achievements.length > 0) {
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
            'Время записи': new Date(achievement.timestamp).toLocaleString('ru-RU')
          }))
        });
      }

      // Статистика сотрудников
      if (motivationData.employees) {
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

      // Настройки системы
      sheets.push({
        name: 'Настройки мотивации',
        data: [
          {
            'Параметр': 'Баллов за выполнение плана',
            'Значение': motivationData.settings?.pointsPerPlan || 10
          },
          {
            'Параметр': 'Бонус за перевыполнение',
            'Значение': motivationData.settings?.bonusForOverachievement || 5
          },
          {
            'Параметр': 'Месячный бонус',
            'Значение': motivationData.settings?.monthlyBonus || 100
          },
          {
            'Параметр': 'Версия системы мотивации',
            'Значение': motivationData.version || '1.0.0'
          }
        ]
      });

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
    return new Date(date).toLocaleDateString('ru-RU');
  }

  formatDateTime(date) {
    return new Date(date).toLocaleString('ru-RU');
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