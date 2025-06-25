import React, { useEffect, useState } from 'react';

interface ScoreDisplayProps {
  score: number | null;
  isNewRecord: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, isNewRecord }) => {
  const [showScore, setShowScore] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (score !== null) {
      setShowScore(true);
      
      // Animate score counting up
      const duration = 1500;
      const steps = 60;
      const increment = score / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(current * 10) / 10);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setShowScore(false);
      setAnimatedScore(0);
    }
  }, [score]);

  if (!showScore || score === null) return null;

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-emerald-400';
    if (score >= 85) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 95) return 'from-emerald-400 to-green-500';
    if (score >= 85) return 'from-blue-400 to-blue-600';
    if (score >= 70) return 'from-yellow-400 to-orange-500';
    return 'from-orange-400 to-red-500';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 98) return '🤯 INCREDIBLE!';
    if (score >= 95) return '🔥 AMAZING!';
    if (score >= 90) return '⭐ EXCELLENT!';
    if (score >= 80) return '👍 GREAT!';
    if (score >= 70) return '👌 GOOD!';
    return '💪 KEEP TRYING!';
  };

  const getBgEffect = (score: number) => {
    if (score >= 95) return 'shadow-emerald-500/50';
    if (score >= 85) return 'shadow-blue-500/50';
    if (score >= 70) return 'shadow-yellow-500/50';
    return 'shadow-orange-500/50';
  };

  return (
    <div className={`text-center transition-all duration-700 ${showScore ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
      {/* Main score display */}
      <div className="relative mb-6">
        {/* Background glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${getScoreGradient(score)} rounded-3xl blur-xl opacity-30 ${isNewRecord ? 'animate-pulse' : ''}`}></div>
        
        {/* Score container */}
        <div className={`relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl ${getBgEffect(score)} border border-white/20`}>
          <div className={`text-6xl sm:text-7xl md:text-8xl font-black bg-gradient-to-r ${getScoreGradient(score)} bg-clip-text text-transparent transition-all duration-500 ${isNewRecord ? 'animate-bounce' : ''}`}>
            {animatedScore.toFixed(1)}%
          </div>
          
          {/* Perfection label */}
          <div className="text-gray-600 text-lg font-semibold mt-2 tracking-wide">
            PERFECTION
          </div>
        </div>
      </div>

      {/* Message display */}
      <div className="mb-4">
        <div className={`inline-block bg-gradient-to-r ${getScoreGradient(score)} text-white font-bold text-xl sm:text-2xl md:text-3xl px-6 py-3 rounded-2xl shadow-lg transform transition-all duration-500 hover:scale-105`}>
          {getScoreMessage(score)}
        </div>
      </div>

      {/* New record indicator */}
      {isNewRecord && (
        <div className="animate-bounce">
          <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-xl sm:text-2xl px-8 py-4 rounded-2xl shadow-2xl border-4 border-yellow-300 transform rotate-1">
            🏆 NEW RECORD! 🏆
          </div>
        </div>
      )}
    </div>
  );
};