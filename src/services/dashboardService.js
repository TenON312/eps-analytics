import { dataService } from './dataService';

export const dashboardService = {
  getDashboardData: (date = new Date().toISOString().split('T')[0]) => {
    const dailyRevenue = dataService.getDailyRevenue(date);
    const plan = dataService.getDailyPlan(date) || {
      revenue: 150000,
      focus: 50000,
      sbp: 30000
    };

    const totalRevenue = dailyRevenue.focus + dailyRevenue.sbp + dailyRevenue.cash;
    
    return {
      revenue: { 
        plan: plan.revenue, 
        fact: totalRevenue,
        title: 'Выручка'
      },
      focus: { 
        plan: plan.focus, 
        fact: dailyRevenue.focus,
        title: 'Фокусные товары'
      },
      sbp: { 
        plan: plan.sbp, 
        fact: dailyRevenue.sbp,
        title: 'СБП'
      },
      rawData: dailyRevenue
    };
  },

  getTodayStats: () => {
    const today = new Date().toISOString().split('T')[0];
    const data = dataService.getDailyRevenue(today);
    
    return {
      total: data.focus + data.sbp + data.cash,
      entries: dataService.getRevenueEntries(today) || []
    };
  }
};