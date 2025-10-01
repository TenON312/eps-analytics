import React from 'react';
import { X, CheckCircle, AlertCircle, Info, Target, TrendingUp } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationCenter = () => {
  const { notifications, removeNotification } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'plan':
        return <Target className="h-5 w-5 text-blue-400" />;
      case 'revenue':
        return <TrendingUp className="h-5 w-5 text-purple-400" />;
      default:
        return <Info className="h-5 w-5 text-gray-400" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50';
      case 'plan':
        return 'bg-blue-500/20 border-blue-500/50';
      case 'revenue':
        return 'bg-purple-500/20 border-purple-500/50';
      default:
        return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border ${getBackgroundColor(notification.type)} backdrop-blur-sm animate-fade-in`}
        >
          <div className="flex items-start space-x-3">
            {getIcon(notification.type)}
            <div className="flex-1">
              <h4 className="font-semibold text-white">{notification.title}</h4>
              {notification.message && (
                <p className="text-sm text-gray-200 mt-1">{notification.message}</p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;