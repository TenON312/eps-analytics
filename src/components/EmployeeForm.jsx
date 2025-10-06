import React from 'react';
import { User, Shield, Phone, Mail, Calendar, Store, ChevronDown } from 'lucide-react';

const EmployeeForm = ({
  employeeForm,
  onFormChange,
  showStoresDropdown,
  onToggleStoresDropdown,
  availableStores,
  onToggleStore
}) => {
  const handleInputChange = (field, value) => {
    onFormChange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* ФИО */}
      <div className="flex items-center justify-between space-x-4">
        <label className="form-label flex items-center text-lg font-medium text-white min-w-[200px]">
          <User className="h-5 w-5 mr-3 text-blue-400" />
          ФИО *
        </label>
        <div className="flex-1">
          <input
            type="text"
            value={employeeForm.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="input-field text-lg bg-gray-750 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            placeholder="Иванов Иван Иванович"
          />
        </div>
      </div>

      {/* Табельный номер */}
      <div className="flex items-center justify-between space-x-4">
        <label className="form-label flex items-center text-lg font-medium text-white min-w-[200px]">
          <Shield className="h-5 w-5 mr-3 text-purple-400" />
          Табельный номер *
        </label>
        <div className="flex-1">
          <input
            type="text"
            value={employeeForm.employeeId}
            onChange={(e) => handleInputChange('employeeId', e.target.value)}
            className="input-field text-lg font-mono bg-gray-750 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            placeholder="12345"
          />
        </div>
      </div>

      {/* Телефон и Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between space-x-4">
          <label className="form-label flex items-center text-lg font-medium text-white min-w-[120px]">
            <Phone className="h-5 w-5 mr-3 text-green-400" />
            Телефон
          </label>
          <div className="flex-1">
            <input
              type="tel"
              value={employeeForm.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="input-field bg-gray-750 border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="+7 (999) 123-45-67"
            />
          </div>
        </div>

        <div className="flex items-center justify-between space-x-4">
          <label className="form-label flex items-center text-lg font-medium text-white min-w-[120px]">
            <Mail className="h-5 w-5 mr-3 text-orange-400" />
            Email
          </label>
          <div className="flex-1">
            <input
              type="email"
              value={employeeForm.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input-field bg-gray-750 border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              placeholder="employee@epc.ru"
            />
          </div>
        </div>
      </div>

      {/* Telegram и Дата рождения */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between space-x-4">
          <label className="form-label flex items-center text-lg font-medium text-white min-w-[120px]">
            <Mail className="h-5 w-5 mr-3 text-blue-400" />
            Telegram
          </label>
          <div className="flex-1">
            <input
              type="text"
              value={employeeForm.telegram}
              onChange={(e) => handleInputChange('telegram', e.target.value)}
              className="input-field bg-gray-750 border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="@username"
            />
          </div>
        </div>

        <div className="flex items-center justify-between space-x-4">
          <label className="form-label flex items-center text-lg font-medium text-white min-w-[120px]">
            <Calendar className="h-5 w-5 mr-3 text-yellow-400" />
            Дата рождения
          </label>
          <div className="flex-1">
            <div className="flex space-x-3">
              <input
                type="date"
                value={employeeForm.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="input-field bg-gray-750 border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 flex-1"
              />
              <input
                type="text"
                value={employeeForm.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="input-field bg-gray-750 border-gray-600 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 flex-1"
                placeholder="ДД.ММ.ГГГГ или выберите дату"
              />
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Можно ввести дату вручную или выбрать из календаря
            </div>
          </div>
        </div>
      </div>

      {/* Должность */}
      <div className="flex items-center justify-between space-x-4">
        <label className="form-label flex items-center text-lg font-medium text-white min-w-[200px]">
          <Shield className="h-5 w-5 mr-3 text-red-400" />
          Должность
        </label>
        <div className="flex-1">
          <select
            value={employeeForm.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className="input-field bg-gray-750 border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          >
            <option value="Сотрудник">Сотрудник</option>
            <option value="ЗДМ">ЗДМ</option>
            <option value="ДТК">ДТК</option>
            <option value="Админ">Админ</option>
          </select>
        </div>
      </div>

      {/* Магазины */}
      <div className="flex items-start justify-between space-x-4">
        <label className="form-label flex items-center text-lg font-medium text-white min-w-[200px]">
          <Store className="h-5 w-5 mr-3 text-emerald-400" />
          Магазины
        </label>
        <div className="flex-1 relative">
          <div 
            className="input-field bg-gray-750 border-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer flex justify-between items-center"
            onClick={onToggleStoresDropdown}
          >
            <span className={employeeForm.stores.length === 0 ? 'text-gray-500' : 'text-white'}>
              {employeeForm.stores.length === 0 ? 'Выберите магазины' : employeeForm.stores.join(', ')}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showStoresDropdown ? 'rotate-180' : ''}`} />
          </div>
          
          {showStoresDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-750 border border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {availableStores.map(store => (
                <label 
                  key={store}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={employeeForm.stores.includes(store)}
                    onChange={() => onToggleStore(store)}
                    className="rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-800"
                  />
                  <span className="text-white text-sm flex-1">{store}</span>
                </label>
              ))}
            </div>
          )}
          
          <div className="text-sm text-gray-400 mt-2">
            Выбрано: {employeeForm.stores.length} магазинов
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;