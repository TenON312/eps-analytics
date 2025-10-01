import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'recharts';
import { useNotifications } from '../../contexts/NotificationContext';
import { exportToExcel } from '../../services/exportService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { notificationService } from '../../services/notificationService';

const Analytics = ({ data }) => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [forecastData, setForecastData] = useState([]);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const { addNotification } = useNotifications();

  // Группировка данных по временным периодам
  const groupDataByTime = (data, range) => {
    return data.reduce((acc, item) => {
      const date = new Date(item.date);
      
      let key;
      if (range === 'day') {
        key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      } else if (range === 'week') {
        const firstDayOfWeek = new Date(date);
        firstDayOfWeek.setDate(date.getDate() - date.getDay());
        key = `${firstDayOfWeek.getFullYear()}-W${String(firstDayOfWeek.getMonth()+1).padStart(2,'0')}${String(firstDayOfWeek.getDate()).padStart(2,'0')}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
      }

      if (!acc[key]) {
        acc[key] = { 
          date: key,
          total: 0,
          categories: {}
        };
      }

      acc[key].total += item.amount;
      if (!acc[key].categories[item.category]) {
        acc[key].categories[item.category] = 0;
      }
      acc[key].categories[item.category] += item.amount;

      return acc;
    }, {});
  };

  // Расчет прогноза на основе линейной регрессии
  const calculateForecast = (historicalData) => {
    if (historicalData.length < 3) return [];
    
    // Подготовка данных для регрессии
    const xValues = historicalData.map((_, i) => i + 1);
    const yValues = historicalData.map(d => d.total);
    
    // Вычисление коэффициентов регрессии
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x*x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Прогноз на следующие 7 дней
    const forecastPeriods = 7;
    const forecast = [];
    
    for (let i = 1; i <= forecastPeriods; i++) {
      const nextDate = new Date(historicalData[historicalData.length-1].date);
      nextDate.setDate(nextDate.getDate() + i);
      
      const predictedValue = Math.max(0, slope * (xValues[xValues.length-1] + i) + intercept);
      forecast.push({
        date: formatDate(nextDate),
        predicted: predictedValue,
        confidence: Math.min(100, 80 + (i * 5))
      });
    }
    
    return forecast;
  };

  // Обработка экспорта
  const handleExport = async () => {
    try {
      await exportToExcel(data, 'analytical_data');
      addNotification({
        type: 'success',
        title: 'Экспорт завершен',
        message: 'Данные успешно экспортированы в Excel'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка экспорта',
        message: 'Не удалось экспортировать данные'
      });
    }
  };

  // Инициализация данных при изменении фильтров
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const grouped = groupDataByTime(data, timeRange);
    const sortedKeys = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
    
    const formattedData = sortedKeys.map(key => ({
      ...grouped[key],
      date: key,
      total: grouped[key].total
    }));
    
    if (selectedCategory !== 'all') {
      setForecastData(calculateForecast(formattedData.filter(item => 
        selectedCategory === 'all' || 
        Object.keys(item.categories).includes(selectedCategory)
      )));
    } else {
      setForecastData(calculateForecast(formattedData));
    }
  }, [data, timeRange, selectedCategory]);

  // Рендеринг графиков
  const renderCharts = () => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          Нет данных для отображения
        </div>
      );
    }

    const grouped = groupDataByTime(data, timeRange);
    const sortedKeys = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
    
    const chartData = sortedKeys.map(key => {
      const item = grouped[key];
      return {
        name: key,
        total: item.total,
        ...(selectedCategory === 'all' ? {} : { [selectedCategory]: item.categories[selectedCategory] })
      };
    });

    return (
      <div className="space-y-6">
        {/* Основной график */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Общий объем</h3>
          <div className="h-80">
            <Bar 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barSize={20}
              className="text-blue-400"
            >
              <Bar dataKey="total" fill="#3b82f6" />
            </Bar>
          </div>
        </div>

        {/* График прогноза */}
        {forecastData.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Прогноз выполнения</h3>
            <div className="h-80">
              <Line
                data={forecastData}
                dataKey="predicted"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-900 p-3 rounded border border-gray-700">
                <p className="text-gray-400">Средний рост:</p>
                <p className="text-white font-medium">
                  {Math.round(forecastData[forecastData.length-1].predicted / forecastData[0].predicted * 100)}%
                </p>
              </div>
              
              <div className="bg-gray-900 p-3 rounded border border-gray-700">
                <p className="text-gray-400">Уверенность:</p>
                <p className="text-white font-medium">
                  {Math.floor(forecastData[forecastData.length-1].confidence)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="day">По дням</option>
            <option value="week">По неделям</option>
            <option value="month">По месяцам</option>
          </select>
          
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
          >
            <option value="all">Все категории</option>
            {Array.from(new Set(data?.map(d => d.category))).map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Экспорт в Excel
        </button>
      </div>

      {renderCharts()}
    </div>
  );
};

export default Analytics;