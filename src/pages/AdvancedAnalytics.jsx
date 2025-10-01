import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Filter, 
  Download, 
  Users, 
  Target,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  Trash2,
  Save
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { exportService } from '../services/exportService';
import { useNotifications } from '../contexts/NotificationContext';

const AdvancedAnalytics = ({ userData }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [analyticsData, setAnalyticsData] = useState([]);
  const [summary, setSummary] = useState({});
  const [employeeStats, setEmployeeStats] = useState([]);
  const [storeStats, setStoreStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    trends: true,
    employees: true,
    stores: true,
    forecasts: false
  });
  const [customReports, setCustomReports] = useState([]);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    metrics: [],
    filters: {},
    chartType: 'bar'
  });
  const { addNotification } = useNotifications();

  const chartTypes = [
    { id: 'bar', name: 'Столбчатая диаграмма', icon: BarChart3 },
    { id: 'line', name: 'Линейный график', icon: TrendingUp },
    { id: 'pie', name: 'Круговая диаграмма', icon: PieChart }
  ];

  const metrics = [
    { id: 'revenue', name: 'Выручка', color: '#3b82f6' },
    { id: 'focus', name: 'Фокусные товары', color: '#10b981' },
    { id: 'sbp', name: 'СБП', color: '#8b5cf6' },
    { id: 'cash', name: 'Наличные', color: '#f59e0b' },
    { id: 'plan_completion', name: 'Выполнение плана', color: '#ef4444' }
  ];

  useEffect(() => {
    loadAdvancedAnalytics();
    loadCustomReports();
  }, [dateRange]);

  const loadAdvancedAnalytics = () => {
    const allData = dataService.getData();
    if (!allData) return;

    const filteredData = {};
    let totalRevenue = 0;
    let totalFocus = 0;
    let totalSBP = 0;
    let totalCash = 0;
    let entryCount = 0;
    let planCompletionSum = 0;
    let planCompletionCount = 0;

    const storeData = {};
    const employeeData = {};

    Object.entries(allData.revenueData || {}).forEach(([date, entries]) => {
      if (date >= dateRange.start && date <= dateRange.end) {
        filteredData[date] = entries;
        
        const dailyPlan = allData.plans[date];
        let dailyRevenue = 0;
        let dailyFocus = 0;
        let dailySBP = 0;
        let dailyCash = 0;

        entries.forEach(entry => {
          const focus = parseInt(entry.focus) || 0;
          const sbp = parseInt(entry.sbp) || 0;
          const cash = parseInt(entry.cash) || 0;
          const total = focus + sbp + cash;

          dailyRevenue += total;
          dailyFocus += focus;
          dailySBP += sbp;
          dailyCash += cash;
          totalRevenue += total;
          totalFocus += focus;
          totalSBP += sbp;
          totalCash += cash;
          entryCount++;

          // Статистика по сотрудникам
          if (!employeeData[entry.employeeId]) {
            const employee = allData.employees.find(emp => emp.employeeId === entry.employeeId);
            employeeData[entry.employeeId] = {
              id: entry.employeeId,
              name: entry.employeeName,
              total: 0,
              focus: 0,
              sbp: 0,
              cash: 0,
              entries: 0,
              stores: employee?.stores || ['Неизвестно']
            };
          }
          employeeData[entry.employeeId].total += total;
          employeeData[entry.employeeId].focus += focus;
          employeeData[entry.employeeId].sbp += sbp;
          employeeData[entry.employeeId].cash += cash;
          employeeData[entry.employeeId].entries++;

          // Статистика по магазинам
          const employee = allData.employees.find(emp => emp.employeeId === entry.employeeId);
          if (employee) {
            employee.stores.forEach(store => {
              if (!storeData[store]) {
                storeData[store] = {
                  total: 0,
                  focus: 0,
                  sbp: 0,
                  cash: 0,
                  employees: new Set()
                };
              }
              storeData[store].total += total;
              storeData[store].focus += focus;
              storeData[store].sbp += sbp;
              storeData[store].cash += cash;
              storeData[store].employees.add(entry.employeeId);
            });
          }
        });

        // Расчет выполнения плана
        if (dailyPlan && dailyPlan.revenue > 0) {
          const completionRate = Math.min((dailyRevenue / dailyPlan.revenue) * 100, 200);
          planCompletionSum += completionRate;
          planCompletionCount++;
        }
      }
    });

    // Преобразуем данные магазинов
    const formattedStoreStats = Object.entries(storeData).map(([store, data]) => ({
      store,
      ...data,
      employeeCount: data.employees.size,
      averagePerEmployee: data.total / data.employees.size
    }));

    setAnalyticsData(filteredData);
    setEmployeeStats(Object.values(employeeData).sort((a, b) => b.total - a.total));
    setStoreStats(formattedStoreStats.sort((a, b) => b.total - a.total));
    setSummary({
      totalRevenue,
      totalFocus,
      totalSBP,
      totalCash,
      entryCount,
      averagePerDay: totalRevenue / Object.keys(filteredData).length || 0,
      averagePlanCompletion: planCompletionCount > 0 ? planCompletionSum / planCompletionCount : 0,
      daysWithData: Object.keys(filteredData).length
    });
  };

  const loadCustomReports = () => {
    try {
      const saved = localStorage.getItem('eps-custom-reports');
      if (saved) {
        setCustomReports(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Ошибка загрузки кастомных отчетов:', error);
    }
  };

  const saveCustomReports = (reports) => {
    try {
      localStorage.setItem('eps-custom-reports', JSON.stringify(reports));
    } catch (error) {
      console.error('Ошибка сохранения кастомных отчетов:', error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCreateReport = () => {
    if (!newReport.name.trim()) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Введите название отчета'
      });
      return;
    }

    if (newReport.metrics.length === 0) {
      addNotification({
        type: 'error',
        title: 'Ошибка',
        message: 'Выберите хотя бы один показатель'
      });
      return;
    }

    const report = {
      id: Date.now().toString(),
      ...newReport,
      createdAt: new Date().toISOString(),
      createdBy: userData?.name || 'Неизвестный'
    };

    const updatedReports = [...customReports, report];
    setCustomReports(updatedReports);
    saveCustomReports(updatedReports);

    addNotification({
      type: 'success',
      title: 'Отчет создан',
      message: `Отчет "${newReport.name}" успешно сохранен`
    });

    setIsCreatingReport(false);
    setNewReport({
      name: '',
      metrics: [],
      filters: {},
      chartType: 'bar'
    });
  };

  const handleDeleteReport = (reportId) => {
    const updatedReports = customReports.filter(report => report.id !== reportId);
    setCustomReports(updatedReports);
    saveCustomReports(updatedReports);
    
    addNotification({
      type: 'success',
      title: 'Отчет удален',
      message: 'Отчет успешно удален'
    });
  };

  const handleExportAdvanced = () => {
    const exportData = [];
    
    // Основная статистика
    exportData.push({
      'Тип данных': 'Сводная статистика',
      'Период': `${dateRange.start} - ${dateRange.end}`,
      'Общая выручка': summary.totalRevenue,
      'Фокусные товары': summary.totalFocus,
      'СБП': summary.totalSBP,
      'Наличные': summary.totalCash,
      'Среднее в день': Math.round(summary.averagePerDay),
      'Выполнение плана (%)': Math.round(summary.averagePlanCompletion),
      'Дней с данными': summary.daysWithData
    });

    // Статистика по сотрудникам
    employeeStats.forEach(employee => {
      exportData.push({
        'Тип данных': 'Статистика сотрудника',
        'Сотрудник': employee.name,
        'Табельный номер': employee.id,
        'Общая выручка': employee.total,
        'Фокусные товары': employee.focus,
        'СБП': employee.sbp,
        'Наличные': employee.cash,
        'Количество записей': employee.entries,
        'Магазины': employee.stores.join(', ')
      });
    });

    // Статистика по магазинам
    storeStats.forEach(store => {
      exportData.push({
        'Тип данных': 'Статистика магазина',
        'Магазин': store.store,
        'Общая выручка': store.total,
        'Фокусные товары': store.focus,
        'СБП': store.sbp,
        'Наличные': store.cash,
        'Количество сотрудников': store.employeeCount,
        'Среднее на сотрудника': Math.round(store.averagePerEmployee)
      });
    });

    exportService.exportToExcel(exportData, 'eps-advanced-analytics');
    addNotification({
      type: 'success',
      title: 'Экспорт завершен',
      message: 'Расширенная аналитика успешно экспортирована'
    });
  };

  const calculateTrend = (data, key) => {
    if (data.length < 2) return 0;
    
    const values = Object.values(data).map(day => 
      day.reduce((sum, entry) => sum + (parseInt(entry[key]) || 0), 0)
    );
    
    const first = values[0];
    const last = values[values.length - 1];
    
    return first > 0 ? ((last - first) / first) * 100 : 0;
  };

  const revenueTrend = calculateTrend(analyticsData, 'focus') + calculateTrend(analyticsData, 'sbp') + calculateTrend(analyticsData, 'cash');

  const renderCustomChart = (report) => {
    // Простая реализация кастомного графика
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400">График для: {report.name}</p>
          <p className="text-gray-500 text-sm">
            Метрики: {report.metrics.map(m => metrics.find(metric => metric.id === m)?.name).join(', ')}
          </p>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: TrendingUp },
    { id: 'custom', name: 'Мои отчеты', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Расширенная аналитика</h1>
            <p className="text-gray-400">Глубокий анализ показателей и кастомные отчеты</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleExportAdvanced}
              className="btn-primary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Экспорт отчета
            </button>
          </div>
        </div>

        {/* Фильтры */}
        <div className="card p-6 mb-6">
          <div className="flex items-center space-x-6">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex items-center space-x-4">
              <div>
                <label className="form-label">С</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="input-primary"
                />
              </div>
              <div>
                <label className="form-label">По</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="input-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Навигация по вкладкам */}
        <div className="card p-6 mb-6">
          <div className="border-b border-gray-700">
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
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Ключевые метрики */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Общая выручка</h3>
                  <DollarSign className="h-5 w-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {summary.totalRevenue?.toLocaleString('ru-RU')} ₽
                </div>
                <div className={`text-sm ${revenueTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {revenueTrend >= 0 ? '↗' : '↘'} {Math.abs(revenueTrend).toFixed(1)}%
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Выполнение плана</h3>
                  <Target className="h-5 w-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {Math.round(summary.averagePlanCompletion)}%
                </div>
                <div className="text-sm text-gray-400">
                  в среднем за период
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Активность</h3>
                  <Clock className="h-5 w-5 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {summary.entryCount}
                </div>
                <div className="text-sm text-gray-400">
                  {summary.daysWithData} дней с данными
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Сотрудники</h3>
                  <Users className="h-5 w-5 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">
                  {employeeStats.length}
                </div>
                <div className="text-sm text-gray-400">
                  активных сотрудников
                </div>
              </div>
            </div>

            {/* Тренды и распределение */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Динамика выручки</h3>
                  <button
                    onClick={() => toggleSection('trends')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.trends ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
                
                {expandedSections.trends && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Период:</span>
                      <span className="text-white">
                        {new Date(dateRange.start).toLocaleDateString('ru-RU')} - {new Date(dateRange.end).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4 h-48 flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400">График динамики выручки</p>
                        <p className="text-gray-500 text-sm">Общая тенденция: {revenueTrend >= 0 ? 'рост' : 'снижение'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Распределение по типам</h3>
                  <button
                    onClick={() => toggleSection('stores')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.stores ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
                
                {expandedSections.stores && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-500/20 rounded-lg">
                        <div className="text-blue-400 font-semibold">{Math.round((summary.totalFocus / summary.totalRevenue) * 100) || 0}%</div>
                        <div className="text-gray-400">Фокусные</div>
                      </div>
                      <div className="text-center p-3 bg-purple-500/20 rounded-lg">
                        <div className="text-purple-400 font-semibold">{Math.round((summary.totalSBP / summary.totalRevenue) * 100) || 0}%</div>
                        <div className="text-gray-400">СБП</div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4 h-32 flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Круговая диаграмма распределения</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Топ сотрудников */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Топ сотрудников по выручке</h3>
                <button
                  onClick={() => toggleSection('employees')}
                  className="text-gray-400 hover:text-white"
                >
                  {expandedSections.employees ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>
              
              {expandedSections.employees && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-4 px-6 text-gray-400 font-semibold">Сотрудник</th>
                        <th className="text-right py-4 px-6 text-gray-400 font-semibold">Общая выручка</th>
                        <th className="text-right py-4 px-6 text-gray-400 font-semibold">Фокусные</th>
                        <th className="text-right py-4 px-6 text-gray-400 font-semibold">СБП</th>
                        <th className="text-right py-4 px-6 text-gray-400 font-semibold">Доля от общей</th>
                        <th className="text-right py-4 px-6 text-gray-400 font-semibold">Записей</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeStats.slice(0, 10).map((employee, index) => (
                        <tr key={employee.id} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-white">{employee.name}</div>
                                <div className="text-gray-400 text-xs">{employee.stores.join(', ')}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right text-white font-semibold">
                            {employee.total.toLocaleString('ru-RU')} ₽
                          </td>
                          <td className="py-4 px-6 text-right text-green-400">
                            {employee.focus.toLocaleString('ru-RU')} ₽
                          </td>
                          <td className="py-4 px-6 text-right text-purple-400">
                            {employee.sbp.toLocaleString('ru-RU')} ₽
                          </td>
                          <td className="py-4 px-6 text-right text-blue-400">
                            {summary.totalRevenue > 0 ? Math.round((employee.total / summary.totalRevenue) * 100) : 0}%
                          </td>
                          <td className="py-4 px-6 text-right text-gray-400">
                            {employee.entries}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Статистика по магазинам */}
            {storeStats.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Статистика по магазинам</h3>
                  <button
                    onClick={() => toggleSection('stores')}
                    className="text-gray-400 hover:text-white"
                  >
                    {expandedSections.stores ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
                
                {expandedSections.stores && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {storeStats.map((store, index) => (
                      <div key={store.store} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">{store.store}</h4>
                          <div className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                            {store.employeeCount} сотрудников
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Выручка:</span>
                            <span className="text-white font-semibold">{store.total.toLocaleString('ru-RU')} ₽</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">На сотрудника:</span>
                            <span className="text-blue-400">{Math.round(store.averagePerEmployee).toLocaleString('ru-RU')} ₽</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Фокусные:</span>
                            <span className="text-green-400">{store.focus.toLocaleString('ru-RU')} ₽</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Доля от общей:</span>
                            <span className="text-purple-400">
                              {summary.totalRevenue > 0 ? Math.round((store.total / summary.totalRevenue) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Создание нового отчета */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Мои кастомные отчеты</h3>
                <button
                  onClick={() => setIsCreatingReport(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Создать отчет
                </button>
              </div>

              {customReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customReports.map(report => (
                    <div key={report.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{report.name}</h4>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-400 mb-4">
                        <div>Тип графика: {chartTypes.find(t => t.id === report.chartType)?.name}</div>
                        <div>Метрики: {report.metrics.length}</div>
                        <div>Создан: {new Date(report.createdAt).toLocaleDateString('ru-RU')}</div>
                      </div>
                      
                      {renderCustomChart(report)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">У вас пока нет кастомных отчетов</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Создайте свой первый отчет для отслеживания нужных метрик
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Модальное окно создания отчета */}
        {isCreatingReport && (
          <div className="modal-overlay">
            <div className="modal-content max-w-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Создание кастомного отчета</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Название отчета *</label>
                    <input
                      type="text"
                      value={newReport.name}
                      onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                      className="input-primary"
                      placeholder="Например: Динамика выручки по неделям"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Тип графика</label>
                    <div className="grid grid-cols-3 gap-2">
                      {chartTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setNewReport(prev => ({ ...prev, chartType: type.id }))}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              newReport.chartType === type.id
                                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            <Icon className="h-5 w-5 mx-auto mb-1" />
                            <div className="text-xs font-medium">{type.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Выберите метрики *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {metrics.map(metric => (
                        <button
                          key={metric.id}
                          onClick={() => {
                            const updatedMetrics = newReport.metrics.includes(metric.id)
                              ? newReport.metrics.filter(m => m !== metric.id)
                              : [...newReport.metrics, metric.id];
                            setNewReport(prev => ({ ...prev, metrics: updatedMetrics }));
                          }}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            newReport.metrics.includes(metric.id)
                              ? 'border-green-500 bg-green-500/20 text-green-400'
                              : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          <div className="text-sm font-medium">{metric.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setIsCreatingReport(false)}
                    className="flex-1 btn-secondary"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleCreateReport}
                    className="flex-1 btn-primary"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить отчет
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

export default AdvancedAnalytics;