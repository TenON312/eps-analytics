import React from 'react';
import { Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react';
import { dataService } from '../services/dataService';

const ExportData = () => {
  const exportToJSON = () => {
    const data = dataService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eps-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const data = dataService.exportData();
    // Преобразуем данные в CSV формат
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eps-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    // Простая реализация конвертации в CSV
    const headers = ['Дата', 'Сотрудник', 'Фокусные', 'СБП', 'Наличные', 'Общая сумма'];
    let csv = headers.join(',') + '\n';
    
    Object.entries(data.revenueData).forEach(([date, entries]) => {
      entries.forEach(entry => {
        const total = (parseInt(entry.focus) || 0) + (parseInt(entry.sbp) || 0) + (parseInt(entry.cash) || 0);
        const row = [
          date,
          entry.employeeName,
          entry.focus,
          entry.sbp,
          entry.cash,
          total
        ].map(field => `"${field}"`).join(',');
        csv += row + '\n';
      });
    });
    
    return csv;
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Экспорт данных</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={exportToJSON}
          className="flex items-center justify-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <FileText className="h-6 w-6 text-blue-400 mr-2" />
          <span>Экспорт в JSON</span>
        </button>
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Excel className="h-6 w-6 text-green-400 mr-2" />
          <span>Экспорт в CSV</span>
        </button>
      </div>
      <p className="text-gray-400 text-sm mt-4">
        Данные будут экспортированы за весь период
      </p>
    </div>
  );
};

export default ExportData;