import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const OnlineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center space-x-2 text-sm">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-400" />
          <span className="text-green-400">Онлайн</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-400" />
          <span className="text-red-400">Офлайн</span>
        </>
      )}
    </div>
  );
};

export default OnlineIndicator;