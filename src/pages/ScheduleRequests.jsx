import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Check, X, MoreVertical } from 'lucide-react';
import { dataService } from '../services/dataService';
import { useNotifications } from '../contexts/NotificationContext';

const ScheduleRequests = ({ userData }) => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { addNotification } = useNotifications();

  // Моковые данные заявок
  const mockRequests = [
    {
      id: '1',
      employeeId: '12345',
      employeeName: 'Иванов Иван Иванович',
      type: 'dayoff',
      startDate: '2024-10-01',
      endDate: '2024-10-02',
      reason: 'Семейные обстоятельства',
      status: 'pending',
      createdAt: new Date('2024-09-28').toISOString()
    },
    {
      id: '2',
      employeeId: '12346',
      employeeName: 'Петрова Анна Сергеевна',
      type: 'shift_change',
      startDate: '2024-10-05',
      endDate: '2024-10-05',
      reason: 'Посещение врача',
      status: 'approved',
      createdAt: new Date('2024-09-27').toISOString()
    },
    {
      id: '3',
      employeeId: '12345',
      employeeName: 'Иванов Иван Иванович',
      type: 'vacation',
      startDate: '2024-10-10',
      endDate: '2024-10-20',
      reason: 'Ежегодный отпуск',
      status: 'pending',
      createdAt: new Date('2024-09-26').toISOString()
    }
  ];

  useEffect(() => {
    // В реальном приложении здесь будет загрузка из API
    setRequests(mockRequests);
  }, []);

  const handleApprove = (requestId) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
    addNotification({
      type: 'success',
      title: 'Заявка одобрена',
      message: 'Заявка на изменение графика была одобрена'
    });
  };

  const handleReject = (requestId) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
    addNotification({
      type: 'warning',
      title: 'Заявка отклонена',
      message: 'Заявка на изменение графика была отклонена'
    });
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-500/20 text-yellow-400',
      'approved': 'bg-green-500/20 text-green-400',
      'rejected': 'bg-red-500/20 text-red-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getTypeDisplayName = (type) => {
    const names = {
      'dayoff': 'Выходной',
      'vacation': 'Отпуск',
      'shift_change': 'Смена графика',
      'sick_leave': 'Больничный'
    };
    return names[type] || type;
  };

  const getStatusDisplayName = (status) => {
    const names = {
      'pending': 'На рассмотрении',
      'approved': 'Одобрено',
      'rejected': 'Отклонено'
    };
    return names[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Заявки на график</h1>
            <p className="text-gray-400">Управление запросами сотрудников</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
              {['all', 'pending', 'approved', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {getStatusDisplayName(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6">
          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map(request => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white font-semibold">
                          {request.employeeName}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusDisplayName(request.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {getTypeDisplayName(request.type)}
                        </div>
                        <div>
                          {new Date(request.startDate).toLocaleDateString('ru-RU')}
                          {request.endDate && ` - ${new Date(request.endDate).toLocaleDateString('ru-RU')}`}
                        </div>
                        <div className="truncate" title={request.reason}>
                          {request.reason}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                          title="Одобрить"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          title="Отклонить"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Нет заявок для отображения</p>
              <p className="text-gray-500 text-sm mt-2">
                {filter !== 'all' 
                  ? `Нет заявок со статусом "${getStatusDisplayName(filter)}"`
                  : 'Сотрудники еще не подавали заявки на изменение графика'
                }
              </p>
            </div>
          )}
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {requests.length}
            </div>
            <div className="text-gray-400">Всего заявок</div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-gray-400">На рассмотрении</div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-green-400 mb-2">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-gray-400">Одобрено</div>
          </div>
          
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-red-400 mb-2">
              {requests.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-gray-400">Отклонено</div>
          </div>
        </div>

        {/* Модальное окно деталей заявки */}
        {selectedRequest && (
          <div className="modal-overlay">
            <div className="modal-content max-w-2xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Детали заявки
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Сотрудник</label>
                      <div className="flex items-center text-white">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedRequest.employeeName}
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label">Табельный номер</label>
                      <div className="text-white font-mono">
                        {selectedRequest.employeeId}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Тип заявки</label>
                      <div className="text-white">
                        {getTypeDisplayName(selectedRequest.type)}
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label">Статус</label>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                          {getStatusDisplayName(selectedRequest.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Начало</label>
                      <div className="text-white">
                        {new Date(selectedRequest.startDate).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label">Конец</label>
                      <div className="text-white">
                        {selectedRequest.endDate 
                          ? new Date(selectedRequest.endDate).toLocaleDateString('ru-RU')
                          : '—'
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Причина</label>
                    <div className="text-white bg-gray-800 rounded-lg p-3">
                      {selectedRequest.reason}
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Дата подачи</label>
                    <div className="text-white">
                      {new Date(selectedRequest.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="flex-1 btn-secondary"
                  >
                    Закрыть
                  </button>
                  
                  {selectedRequest.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleApprove(selectedRequest.id);
                          setSelectedRequest(null);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                      >
                        Одобрить
                      </button>
                      <button
                        onClick={() => {
                          handleReject(selectedRequest.id);
                          setSelectedRequest(null);
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                      >
                        Отклонить
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleRequests;