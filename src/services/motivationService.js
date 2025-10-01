// src/services/motivationService.js
class MotivationService {
  constructor() {
    this.storageKey = 'eps-motivation-data';
    this.init();
  }

  init() {
    if (!this.getData()) {
      const initialData = {
        employees: {},
        achievements: [],
        settings: {
          pointsPerPlan: 10,
          bonusForOverachievement: 5,
          monthlyBonus: 100
        },
        version: '1.0.0'
      };
      this.saveData(initialData);
    }
  }

  getData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Ошибка чтения мотивационных данных:', error);
      return null;
    }
  }

  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Ошибка сохранения мотивационных данных:', error);
      return false;
    }
  }

  recordAchievement(employeeId, type, fact, plan, date) {
    const data = this.getData();
    if (!data) return null;

    const percentage = Math.round((fact / plan) * 100);
    let points = data.settings.pointsPerPlan;

    // Бонус за перевыполнение
    if (percentage > 100) {
      points += data.settings.bonusForOverachievement;
    }

    // Запись достижения
    const achievement = {
      id: Date.now().toString(),
      employeeId,
      type,
      fact,
      plan,
      percentage,
      points,
      date: date || new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    data.achievements.unshift(achievement);

    // Обновление баллов сотрудника
    if (!data.employees[employeeId]) {
      data.employees[employeeId] = {
        totalPoints: 0,
        totalAchievements: 0,
        monthlyPoints: 0
      };
    }

    data.employees[employeeId].totalPoints += points;
    data.employees[employeeId].totalAchievements += 1;

    // Обновление месячных баллов
    const achievementMonth = new Date(achievement.date).getMonth();
    const currentMonth = new Date().getMonth();
    if (achievementMonth === currentMonth) {
      data.employees[employeeId].monthlyPoints += points;
    }

    this.saveData(data);
    return achievement;
  }

  getEmployeeStats(employeeId) {
    const data = this.getData();
    if (!data) return null;

    const employee = data.employees[employeeId];
    if (!employee) return null;

    const achievements = data.achievements.filter(a => a.employeeId === employeeId);
    const thisMonth = new Date().getMonth();
    const monthlyAchievements = achievements.filter(a => 
      new Date(a.date).getMonth() === thisMonth
    );

    // Вычисляем место в рейтинге
    const leaderboard = this.getLeaderboard();
    const monthlyRank = leaderboard.findIndex(emp => emp.employeeId === employeeId) + 1;

    return {
      totalPoints: employee.totalPoints,
      totalAchievements: achievements.length,
      monthlyPoints: monthlyAchievements.reduce((sum, a) => sum + a.points, 0),
      monthlyAchievements: monthlyAchievements.length,
      monthlyRank: monthlyRank > 0 ? monthlyRank : null,
      achievements: achievements.slice(0, 10)
    };
  }

  getLeaderboard(limit = 10) {
    const data = this.getData();
    if (!data) return [];

    const employees = Object.entries(data.employees)
      .map(([employeeId, stats]) => ({
        employeeId,
        ...stats
      }))
      .sort((a, b) => b.monthlyPoints - a.monthlyPoints)
      .slice(0, limit);

    return employees;
  }

  getRecentAchievements(limit = 5) {
    const data = this.getData();
    if (!data) return [];

    return data.achievements
      .slice(0, limit)
      .map(achievement => ({
        ...achievement,
        title: this.getAchievementTitle(achievement.type, achievement.percentage)
      }));
  }

  getAchievementTitle(type, percentage) {
    const titles = {
      revenue: {
        100: 'План по выручке выполнен!',
        110: 'Выручка превышена на 10%!',
        120: 'Выручка превышена на 20%!',
        150: 'Выручка превышена на 50%! 🎉'
      },
      focus: {
        100: 'План по фокусным товарам выполнен!',
        110: 'Фокусные товары превышены на 10%!',
        120: 'Фокусные товары превышены на 20%!',
        150: 'Фокусные товары превышены на 50%! 🎉'
      },
      sbp: {
        100: 'План по СБП выполнен!',
        110: 'СБП превышен на 10%!',
        120: 'СБП превышен на 20%!',
        150: 'СБП превышен на 50%! 🎉'
      }
    };

    const typeTitles = titles[type] || {};
    const exactMatch = typeTitles[percentage];
    if (exactMatch) return exactMatch;

    // Находим ближайшее достижение
    const milestones = Object.keys(typeTitles).map(Number).sort((a, b) => b - a);
    const milestone = milestones.find(m => percentage >= m);
    
    return milestone ? typeTitles[milestone] : 'Цель достигнута!';
  }
}

export const motivationService = new MotivationService();