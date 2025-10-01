
import React from 'react';

const Header = () => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Левая часть - логотип или название */}
          <div className="flex items-center">
            <h1 className="ml-2 text-xl font-bold text-white hidden md:block">EPC Analytics</h1>
          </div>

          {/* Правая часть - пустая, так как кнопка выхода перенесена в сайдбар */}
          <div></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
