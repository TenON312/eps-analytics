import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Filter, Download, BarChart3, PieChart, Users } from 'lucide-react';
import { dataService } from '../services/dataService';
import { exportService } from '../services/exportService';
import { useNotifications } from '../contexts/NotificationContext';



const Analytics = ({ userData }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [analyticsData, setAnalyticsData] = useState([]);
  const [summary, setSummary] = useState({});
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = () => {
    const allData = dataService.getData();
    if (!allData) return;

    const filteredData = {};
    let totalRevenue = 0;
    let totalFocus = 0;
    let totalSBP = 0;
    let totalCash = 0;
    let entryCount = 0;

    Object.entries(allData.revenueData || {}).forEach(([date, entries]) => {
      if (date >= dateRange.start && date <= dateRange.end) {
        filteredData[date] = entries;
        
        entries.forEach(entry => {
          totalRevenue += (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0);
          totalFocus += parseInt(entry.focus) || 0;
          totalSBP += parseInt(entry.sbp) || 0;
          totalCash += parseInt(entry.cash) || 0;
          entryCount++;
        });
      }
    });

    setAnalyticsData(filteredData);
    setSummary({
      totalRevenue,
      totalFocus,
      totalSBP,
      totalCash,
      entryCount,
      averagePerDay: totalRevenue / Object.keys(filteredData).length || 0
    });
  };

  const handleExport = () => {
    const exportData = [];
    
    Object.entries(analyticsData).forEach(([date, entries]) => {
      entries.forEach(entry => {
        exportData.push({
          Дата: date,
          'Табельный номер': entry.employeeId,
          Сотрудник: entry.employeeName,
          'Фокусные товары': parseInt(entry.focus) || 0,
          СБП: parseInt(entry.sbp) || 0,
          Наличные: parseInt(entry.cash) || 0,
          'Общая сумма': (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0),
          'Время внесения': new Date(entry.timestamp).toLocaleString('ru-RU')
        });
      });
    });

    exportService.exportToExcel(exportData, 'eps-analytics');
    addNotification({
      type: 'success',
      title: 'Экспорт завершен',
      message: 'Данные аналитики успешно экспортированы'
    });
  };

  const getEmployeeStats = () => {
    const employeeMap = {};
    
    Object.values(analyticsData).forEach(entries => {
      entries.forEach(entry => {
        if (!employeeMap[entry.employeeId]) {
          employeeMap[entry.employeeId] = {
            name: entry.employeeName,
            total: 0,
            focus: 0,
            sbp: 0,
            cash: 0,
            entries: 0
          };
        }
        
        employeeMap[entry.employeeId].total += (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0);
        employeeMap[entry.employeeId].focus += parseInt(entry.focus) || 0;
        employeeMap[entry.employeeId].sbp += parseInt(entry.sbp) || 0;
        employeeMap[entry.employeeId].cash += parseInt(entry.cash) || 0;
        employeeMap[entry.employeeId].entries++;
      });
    });

    return Object.values(employeeMap).sort((a, b) => b.total - a.total);
  };

  const employeeStats = getEmployeeStats();

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Аналитика</h1>
            <p className="text-gray-400">Детальный анализ показателей</p>
          </div>
          
          <button
            onClick={handleExport}
            className="btn-primary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Экспорт отчета
          </button>
        </div>

        {/* Фильтры */}
        <div className="card p-6 mb-6">
          <div className="flex items-center space-x-4">
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

        {/* Сводка */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Общая выручка</h3>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.totalRevenue?.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-sm text-gray-400">
              {Object.keys(analyticsData).length} дней
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Фокусные товары</h3>
              <BarChart3 className="h-5 w-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.totalFocus?.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-sm text-gray-400">
              {Math.round((summary.totalFocus / summary.totalRevenue) * 100) || 0}% от общей
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">СБП</h3>
              <PieChart className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.totalSBP?.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-sm text-gray-400">
              {Math.round((summary.totalSBP / summary.totalRevenue) * 100) || 0}% от общей
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Среднее в день</h3>
              <Calendar className="h-5 w-5 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {Math.round(summary.averagePerDay)?.toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-sm text-gray-400">
              {summary.entryCount} записей
            </div>
          </div>
        </div>

        {/* Статистика по сотрудникам */}
        <div className="card p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Users className="h-6 w-6 mr-2 text-blue-400" />
            Статистика по сотрудникам
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Сотрудник</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-semibold">Общая выручка</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-semibold">Фокусные</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-semibold">СБП</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-semibold">Наличные</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-semibold">Записей</th>
                </tr>
              </thead>
              <tbody>
                {employeeStats.map((employee, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-750">
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{employee.name}</div>
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
                      {employee.cash.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="py-4 px-6 text-right text-gray-400">
                      {employee.entries}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ежедневная статистика */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Ежедневная статистика</h3>
          
          <div className="space-y-4">
            {Object.entries(analyticsData)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([date, entries]) => {
                const dayTotal = entries.reduce((sum, entry) => 
                  sum + (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0), 0);
                const dayFocus = entries.reduce((sum, entry) => sum + (parseInt(entry.focus) || 0), 0);
                const daySBP = entries.reduce((sum, entry) => sum + (parseInt(entry.sbp) || 0), 0);
                
                return (
                  <div key={date} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <div className="text-white font-medium">
                        {new Date(date).toLocaleDateString('ru-RU', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {entries.length} записей
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-white font-semibold text-lg">
                        {dayTotal.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-gray-400 text-sm">
                        Фокус: {dayFocus.toLocaleString('ru-RU')} ₽ • СБП: {daySBP.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;