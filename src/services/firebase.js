// Пока это заглушка - мы настроим реальный Firebase позже
export const mockAuth = {
  login: (employeeId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, employeeId });
      }, 1000);
    });
  }
};

export const mockData = {
  getDashboardData: () => ({
    revenue: { plan: 150000, fact: 120000 },
    focus: { plan: 50000, fact: 45000 },
    sbp: { plan: 30000, fact: 28000 }
  })
};