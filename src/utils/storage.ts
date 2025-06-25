interface HighScoreData {
  name: string;
  score: number;
}

const HIGH_SCORE_KEY = 'perfectCircleHighScore';

export const getHighScore = (): HighScoreData => {
  try {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading high score:', error);
  }
  
  return { name: 'Nobody yet', score: 0 };
};

export const setHighScore = (data: HighScoreData): void => {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving high score:', error);
  }
};