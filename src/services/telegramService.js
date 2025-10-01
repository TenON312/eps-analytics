// Сервис для отправки уведомлений в Telegram
class TelegramService {
  constructor() {
    // Используем import.meta.env вместо process.env для Vite
    this.botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    this.chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;
    this.isConfigured = !!(this.botToken && this.chatId);
    
    console.log('TelegramService config:', {
      hasToken: !!this.botToken,
      hasChatId: !!this.chatId,
      isConfigured: this.isConfigured
    });
  }

  async sendMessage(text) {
    if (!this.isConfigured) {
      console.warn('Telegram bot not configured');
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('✅ Telegram notification sent');
      return true;
    } catch (error) {
      console.error('❌ Error sending Telegram message:', error);
      return false;
    }
  }

  // Уведомление о выполнении плана
  async sendPlanCompletion(planType, fact, plan) {
    const message = `
🎉 <b>План выполнен!</b>
🏪 <b>Тип:</b> ${planType}
💰 <b>Факт:</b> ${fact.toLocaleString('ru-RU')} ₽
🎯 <b>План:</b> ${plan.toLocaleString('ru-RU')} ₽
⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
    `;
    return this.sendMessage(message);
  }

  // Уведомление о внесении данных
  async sendRevenueEntry(employeeName, amount, details) {
    const message = `
💰 <b>Новые данные о выручке</b>
👤 <b>Сотрудник:</b> ${employeeName}
💵 <b>Сумма:</b> ${amount.toLocaleString('ru-RU')} ₽
📊 <b>Детали:</b> ${details}
⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
    `;
    return this.sendMessage(message);
  }

  // Уведомление о запросе на изменение графика
  async sendScheduleRequest(employeeName, requestType, date) {
    const message = `
📅 <b>Новый запрос на изменение графика</b>
👤 <b>Сотрудник:</b> ${employeeName}
📋 <b>Тип запроса:</b> ${requestType}
📅 <b>Дата:</b> ${date}
⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
    `;
    return this.sendMessage(message);
  }

  // Уведомление для администраторов
  async sendAdminNotification(title, message) {
    const fullMessage = `
🔔 <b>Административное уведомление</b>
📢 <b>${title}</b>
📝 ${message}
⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
    `;
    return this.sendMessage(fullMessage);
  }
}

// Создаем экземпляр сервиса
export const telegramService = new TelegramService();

// Заглушка для режима разработки
export const mockTelegramService = {
  sendMessage: (text) => {
    console.log('📱 Telegram message (mock):', text);
    return Promise.resolve(true);
  },
  sendPlanCompletion: (planType, fact, plan) => {
    console.log(`📱 Plan completion: ${planType} - ${fact}/${plan}`);
    return Promise.resolve(true);
  },
  sendRevenueEntry: (employeeName, amount, details) => {
    console.log(`📱 Revenue entry: ${employeeName} - ${amount} руб`);
    return Promise.resolve(true);
  },
  sendScheduleRequest: (employeeName, requestType, date) => {
    console.log(`📱 Schedule request: ${employeeName} - ${requestType} on ${date}`);
    return Promise.resolve(true);
  }
};

// Условный экспорт для использования в коде
export default import.meta.env.PROD ? telegramService : mockTelegramService;