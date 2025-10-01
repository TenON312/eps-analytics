// src/services/cashRegisterService.js
class CashRegisterService {
  constructor() {
    this.connected = false;
    this.lastSync = null;
    this.autoSyncInterval = null;
  }

  // Имитация подключения к кассовой системе
  async connect() {
    console.log('🔌 Подключение к кассовой системе...');
    
    try {
      // Имитация задержки подключения
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.connected = true;
      this.lastSync = new Date();
      
      // Запускаем автоматическую синхронизацию каждые 5 минут
      this.startAutoSync();
      
      console.log('✅ Успешно подключено к кассовой системе');
      return true;
    } catch (error) {
      console.error('❌ Ошибка подключения к кассовой системе:', error);
      this.connected = false;
      return false;
    }
  }

  // Имитация получения данных из кассы
  async getCashRegisterData(date = new Date().toISOString().split('T')[0]) {
    if (!this.connected) {
      throw new Error('Кассовая система не подключена');
    }

    console.log(`📊 Получение данных из кассы за ${date}...`);
    
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Генерация демо-данных из кассы
    const cashData = {
      date,
      totalRevenue: Math.floor(Math.random() * 200000) + 50000,
      totalTransactions: Math.floor(Math.random() * 100) + 20,
      averageReceipt: Math.floor(Math.random() * 5000) + 1000,
      paymentMethods: {
        cash: Math.floor(Math.random() * 100000) + 20000,
        card: Math.floor(Math.random() * 120000) + 30000,
        sbp: Math.floor(Math.random() * 40000) + 10000
      },
      topProducts: [
        { name: 'Смартфон', quantity: 5, amount: 150000 },
        { name: 'Наушники', quantity: 12, amount: 60000 },
        { name: 'Чехол', quantity: 25, amount: 25000 },
        { name: 'Зарядное устройство', quantity: 8, amount: 16000 },
        { name: 'Кабель', quantity: 30, amount: 15000 }
      ],
      hourlyData: this.generateHourlyData(),
      lastUpdated: new Date().toISOString()
    };

    this.lastSync = new Date();
    return cashData;
  }

  generateHourlyData() {
    const hours = [];
    for (let hour = 9; hour <= 21; hour++) {
      hours.push({
        hour: `${hour}:00`,
        revenue: Math.floor(Math.random() * 20000) + 5000,
        transactions: Math.floor(Math.random() * 10) + 2
      });
    }
    return hours;
  }

  // Автоматическая синхронизация данных
  startAutoSync() {
    this.autoSyncInterval = setInterval(async () => {
      if (this.connected) {
        try {
          console.log('🔄 Автоматическая синхронизация данных кассы...');
          await this.getCashRegisterData();
        } catch (error) {
          console.error('Ошибка автоматической синхронизации:', error);
        }
      }
    }, 5 * 60 * 1000); // Каждые 5 минут
  }

  stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  // Имитация отправки данных в кассу (возвраты, коррекции)
  async sendCorrection(correctionData) {
    if (!this.connected) {
      throw new Error('Кассовая система не подключена');
    }

    console.log('📤 Отправка коррекции в кассовую систему:', correctionData);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      correctionId: `CORR-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  // Получение статуса подключения
  getStatus() {
    return {
      connected: this.connected,
      lastSync: this.lastSync,
      autoSync: !!this.autoSyncInterval
    };
  }

  // Имитация отключения от кассы
  disconnect() {
    this.connected = false;
    this.stopAutoSync();
    console.log('🔌 Отключено от кассовой системы');
  }
}

export const cashRegisterService = new CashRegisterService();