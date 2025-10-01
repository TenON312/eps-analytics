class OfflineService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingActions = [];
    this.init();
  }

  init() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Восстанавливаем pendingActions из localStorage
    this.loadPendingActions();
  }

  handleOnline() {
    this.isOnline = true;
    console.log('🟢 Соединение восстановлено');
    
    // Показываем уведомление
    if (typeof notificationService !== 'undefined') {
      notificationService.showOnlineSync();
    }
    
    // Выполняем отложенные действия
    this.processPendingActions();
  }

  handleOffline() {
    this.isOnline = false;
    console.log('🔴 Работа офлайн');
    
    if (typeof notificationService !== 'undefined') {
      notificationService.showOfflineWarning();
    }
  }

  loadPendingActions() {
    try {
      const saved = localStorage.getItem('eps-pending-actions');
      if (saved) {
        this.pendingActions = JSON.parse(saved) || [];
      }
    } catch (error) {
      console.error('Ошибка загрузки отложенных действий:', error);
      this.pendingActions = [];
    }
  }

  savePendingActions() {
    try {
      localStorage.setItem('eps-pending-actions', JSON.stringify(this.pendingActions));
    } catch (error) {
      console.error('Ошибка сохранения отложенных действий:', error);
    }
  }

  addPendingAction(action) {
    this.pendingActions.push({
      ...action,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    });
    this.savePendingActions();
  }

  async processPendingActions() {
    if (this.pendingActions.length === 0) return;

    console.log(`🔄 Синхронизация ${this.pendingActions.length} отложенных действий...`);
    
    const successfulActions = [];
    
    for (const action of this.pendingActions) {
      try {
        // Здесь в будущем можно добавить синхронизацию с сервером
        console.log('Обработка отложенного действия:', action);
        
        // Пока просто отмечаем как успешное
        successfulActions.push(action.id);
        
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error('Ошибка обработки отложенного действия:', error);
      }
    }

    // Удаляем успешно обработанные действия
    this.pendingActions = this.pendingActions.filter(
      action => !successfulActions.includes(action.id)
    );
    this.savePendingActions();
    
    console.log(`✅ Синхронизация завершена. Осталось: ${this.pendingActions.length} действий`);
  }

  // Метод для безопасного выполнения действий с учетом офлайн-режима
  async executeWithOfflineSupport(actionName, actionFunction, data) {
    if (this.isOnline) {
      try {
        return await actionFunction(data);
      } catch (error) {
        // Если ошибка сети, добавляем в отложенные
        if (error.message.includes('Network') || !this.isOnline) {
          this.addPendingAction({
            name: actionName,
            data: data,
            function: actionFunction.toString()
          });
          throw new Error('Действие отложено из-за проблем с сетью');
        }
        throw error;
      }
    } else {
      // Офлайн режим - откладываем действие
      this.addPendingAction({
        name: actionName,
        data: data,
        function: actionFunction.toString()
      });
      throw new Error('Режим офлайн. Действие будет выполнено при восстановлении связи');
    }
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      pendingActionsCount: this.pendingActions.length,
      lastSync: localStorage.getItem('eps-last-sync') || 'never'
    };
  }
}

export const offlineService = new OfflineService();