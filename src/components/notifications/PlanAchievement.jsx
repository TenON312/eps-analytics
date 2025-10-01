// src/components/notifications/PlanAchievement.jsx
import React from 'react';
import { Trophy, Target, TrendingUp } from 'lucide-react';

const PlanAchievement = ({ achievement }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'revenue': return <TrendingUp className="h-6 w-6" />;
      case 'focus': return <Target className="h-6 w-6" />;
      case 'sbp': return <TrendingUp className="h-6 w-6" />;
      default: return <Trophy className="h-6 w-6" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'revenue': return 'from-blue-500 to-blue-600';
      case 'focus': return 'from-green-500 to-green-600';
      case 'sbp': return 'from-purple-500 to-purple-600';
      default: return 'from-yellow-500 to-yellow-600';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getColor(achievement.type)} rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {getIcon(achievement.type)}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg">{achievement.title}</h4>
          <p className="text-sm opacity-90">{achievement.message}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              {achievement.date}
            </span>
            <span className="text-sm font-semibold">
              +{achievement.bonus} баллов
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanAchievement;