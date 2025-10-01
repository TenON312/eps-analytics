import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Clock } from 'lucide-react';

const Dashboard3D = () => {
  const [activeScreen, setActiveScreen] = useState('plans');

  // Данные для отображения
  const screens = [
    {
      id: 'plans',
      title: 'Планы',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {[
            { category: 'Продажи', progress: 78 },
            { category: 'Сервис', progress: 45 },
            { category: 'Маркетинг', progress: 92 }
          ].map((item, index) => (
            <motion.div 
              key={index}
              className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 shadow-lg shadow-purple-900/30 border border-purple-900/30"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-white text-xl font-bold mb-4">{item.category}</h3>
              <div className="w-full bg-gray-800 rounded-full h-4 mb-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-500" 
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
              <p className="text-white font-mono text-2xl">{item.progress}%</p>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'analytics',
      title: 'Аналитика',
      content: (
        <div className="p-6">
          <h2 className="text-white text-2xl font-bold mb-6">Графики и диаграммы</h2>
          <div className="bg-gray-800 rounded-xl p-6 h-64 flex items-center justify-center">
            <p className="text-gray-400">Данные загружаются...</p>
          </div>
        </div>
      )
    },
    {
      id: 'forecast',
      title: 'Прогноз',
      content: (
        <div className="p-6">
          <h2 className="text-white text-2xl font-bold mb-6">Прогноз выполнения</h2>
          <div className="bg-gray-800 rounded-xl p-6 h-64 flex items-center justify-center">
            <p className="text-gray-400">Рассчитывается на основе исторических данных</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/10 to-gray-900">
      {/* Сайдбар */}
      <div className="fixed left-0 top-0 bottom-0 w-16 md:w-20 bg-purple-900/30 backdrop-blur-sm border-r border-purple-800/30 z-10">
        <nav className="flex flex-col h-full justify-center space-y-6">
          {screens.map(screen => (
            <button
              key={screen.id}
              onClick={() => setActiveScreen(screen.id)}
              className={`transform transition-transform ${
                activeScreen === screen.id 
                  ? 'scale-110 translate-x-2' 
                  : 'translate-x-0'
              }`}
            >
              <span className={`block w-8 h-8 rounded-full mx-auto ${
                activeScreen === screen.id 
                  ? 'bg-white' 
                  : 'bg-gray-700'
              }`}></span>
            </button>
          ))}
        </nav>
      </div>

      {/* Основной контент */}
      <div className="ml-16 md:ml-20 p-4 md:p-8">
        <div className="bg-gradient-to-br from-purple-800/30 to-gray-800/30 rounded-2xl border border-purple-900/30 backdrop-blur-sm p-4 md:p-6 shadow-xl shadow-purple-900/20">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-white">{screens.find(s => s.id === activeScreen)?.title}</h1>
          </header>
          
          {screens.find(s => s.id === activeScreen)?.content}
        </div>
      </div>
    </div>
  );
};

export default Dashboard3D;