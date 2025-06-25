import React, { useState } from 'react';
import { getHighScore, setHighScore } from '../utils/storage';

interface HighScoreProps {
  currentScore: number | null;
  onRecordSet: () => void;
}

export const HighScore: React.FC<HighScoreProps> = ({ currentScore, onRecordSet }) => {
  const [highScore, setHighScoreState] = useState(getHighScore());
  const [showNameInput, setShowNameInput] = useState(false);
  const [newName, setNewName] = useState('');

  const isNewRecord = currentScore !== null && currentScore > highScore.score;

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && currentScore !== null) {
      const newRecord = { name: newName.trim(), score: currentScore };
      setHighScore(newRecord);
      setHighScoreState(newRecord);
      setShowNameInput(false);
      setNewName('');
      onRecordSet();
    }
  };

  React.useEffect(() => {
    if (isNewRecord) {
      setShowNameInput(true);
    }
  }, [isNewRecord]);

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/25 transition-all duration-300">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <span className="text-2xl">🏆</span>
          High Score
        </h3>
      </div>
      
      {showNameInput && isNewRecord ? (
        <form onSubmit={handleNameSubmit} className="space-y-4">
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg px-4 py-2 rounded-xl mb-4 shadow-lg">
              🎉 New Record! 🎉
            </div>
            <p className="text-white/90 text-sm mb-4 font-medium">Enter your name for the leaderboard:</p>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-white/30 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all duration-200 text-center font-medium"
              placeholder="Your name"
              maxLength={20}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!newName.trim()}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg"
          >
            Save Record
          </button>
        </form>
      ) : (
        <div className="text-center">
          {/* Score display */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-4xl sm:text-5xl font-black text-transparent bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text mb-2">
              {highScore.score.toFixed(1)}%
            </div>
            <div className="text-white/90 text-sm font-medium mb-1">
              Perfect Score
            </div>
            <div className="text-white/80 text-lg font-semibold">
              by {highScore.name}
            </div>
          </div>

          {/* Motivational message */}
          <div className="mt-4 text-white/70 text-sm font-medium">
            {highScore.score === 0 ? "Be the first to set a record!" : "Can you beat this score?"}
          </div>
        </div>
      )}
    </div>
  );
};