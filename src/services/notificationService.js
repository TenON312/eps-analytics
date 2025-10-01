class NotificationService {
  constructor() {
    this.permission = null;
    this.init();
  }

  async init() {
    if (!('Notification' in window)) {
      console.warn('Браузер не поддерживает уведомления');
      return;
    }

    this.permission = Notification.permission;
    
    if (this.permission === 'default') {
      this.permission = await this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.error('Ошибка запроса разрешения:', error);
      return 'denied';
    }
  }

  showNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      console.warn('Разрешение на уведомления не предоставлено');
      return null;
    }

    const notificationOptions = {
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      vibrate: [200, 100, 200],
      ...options
    };

    const notification = new Notification(title, notificationOptions);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  // Специфичные уведомления для нашего приложения
  showPlanCompletion(category, fact, plan) {
    return this.showNotification('🎉 План выполнен!', {
      body: `${category}: ${fact.toLocaleString('ru-RU')} ₽ из ${plan.toLocaleString('ru-RU')} ₽`,
      tag: 'plan-completion',
      requireInteraction: true
    });
  }

  showDataSaved(amount) {
    return this.showNotification('✅ Данные сохранены', {
      body: `Внесено ${amount.toLocaleString('ru-RU')} ₽`,
      tag: 'data-saved'
    });
  }

  showOfflineWarning() {
    return this.showNotification('⚠️ Работа офлайн', {
      body: 'Данные сохраняются локально',
      tag: 'offline-warning'
    });
  }

  showOnlineSync() {
    return this.showNotification('🔗 Соединение восстановлено', {
      body: 'Данные синхронизированы',
      tag: 'online-sync'
    });
  }
}

export const notificationService = new NotificationService();