import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RefreshCw, Twitter, Trophy, Star, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { supabase, LeaderboardEntry } from '../lib/supabase';

interface Point {
  x: number;
  y: number;
}

const CircleGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [perfectionScore, setPerfectionScore] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [gameState, setGameState] = useState<'waiting' | 'drawing' | 'complete' | 'timeout'>('waiting');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [username, setUsername] = useState('');
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [centerPoint, setCenterPoint] = useState<Point>({ x: 0, y: 0 });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();

  // Generate a simple device ID for duplicate prevention
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('circle_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('circle_device_id', deviceId);
    }
    return deviceId;
  };

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load global leaderboard and personal best
  useEffect(() => {
    loadLeaderboard();
    
    const savedPersonalBest = localStorage.getItem('circlePersonalBest');
    if (savedPersonalBest) {
      setPersonalBest(parseFloat(savedPersonalBest));
    }
  }, []);

  // Load leaderboard from Supabase
  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading leaderboard:', error);
        // Fallback to localStorage if Supabase fails
        const savedLeaderboard = localStorage.getItem('circleLeaderboard');
        if (savedLeaderboard) {
          setLeaderboard(JSON.parse(savedLeaderboard));
        }
        return;
      }

      if (data) {
        setLeaderboard(data);
      }
    } catch (error) {
      console.error('Error connecting to database:', error);
      // Fallback to localStorage
      const savedLeaderboard = localStorage.getItem('circleLeaderboard');
      if (savedLeaderboard) {
        setLeaderboard(JSON.parse(savedLeaderboard));
      }
    }
  };

  // Set center point when canvas is ready
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      setCenterPoint({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  // Play celebration sound
  const playCelebrationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a sequence of ascending notes
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.15);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + index * 0.15 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.3);
      
      oscillator.start(audioContext.currentTime + index * 0.15);
      oscillator.stop(audioContext.currentTime + index * 0.15 + 0.3);
    });
  };

  // Play timeout sound (error sound)
  const playTimeoutSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a harsh descending sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Two oscillators for a harsher sound
    oscillator1.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.5);
    oscillator1.type = 'sawtooth';
    
    oscillator2.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
    oscillator2.type = 'square';
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator1.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.5);
    oscillator2.start(audioContext.currentTime);
    oscillator2.stop(audioContext.currentTime + 0.5);
  };

  // Calculate circle perfection using least squares fitting
  const calculateCirclePerfection = (points: Point[]): number => {
    if (points.length < 10) return 0;

    // Find centroid
    const centroidX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centroidY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

    // Calculate average radius
    const avgRadius = points.reduce((sum, p) => {
      return sum + Math.sqrt(Math.pow(p.x - centroidX, 2) + Math.pow(p.y - centroidY, 2));
    }, 0) / points.length;

    // Calculate deviation from perfect circle
    const deviations = points.map(p => {
      const actualRadius = Math.sqrt(Math.pow(p.x - centroidX, 2) + Math.pow(p.y - centroidY, 2));
      return Math.abs(actualRadius - avgRadius);
    });

    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
    const maxDeviation = Math.max(...deviations);
    
    // Calculate perfection percentage
    const perfection = Math.max(0, 100 - (avgDeviation / avgRadius * 100) - (maxDeviation / avgRadius * 50));
    return Math.round(perfection * 10) / 10;
  };

  // Check if circle is closed
  const isCircleClosed = (points: Point[]): boolean => {
    if (points.length < 20) return false;
    
    const start = points[0];
    const end = points[points.length - 1];
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    
    return distance < 30; // Allow some tolerance for closing
  };

  // Reset game
  const resetGame = useCallback(() => {
    setPoints([]);
    setPerfectionScore(null);
    setIsComplete(false);
    setIsDrawing(false);
    setGameState('waiting');
    setTimeLeft(5);
    setShowUsernameInput(false);
    setShowCelebration(false);
    setUsername('');
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawTarget(ctx, canvas.width, canvas.height);
      }
    }
  }, []);

  // Draw target dot at fixed center
  const drawTarget = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(rect.width / 2, rect.height / 2, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add a subtle glow effect
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(rect.width / 2, rect.height / 2, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set drawing style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#06b6d4';

    drawTarget(ctx, rect.width, rect.height);
  }, []);

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'waiting') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsDrawing(true);
    setGameState('drawing');
    setPoints([{ x, y }]);

    // Start timeout timer (5 seconds)
    timeoutRef.current = setTimeout(() => {
      playTimeoutSound();
      setGameState('timeout');
      setTimeout(resetGame, 1500);
    }, 5000);

    // Start countdown
    setTimeLeft(5);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || gameState !== 'drawing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setPoints(prev => {
      const newPoints = [...prev, { x, y }];
      
      // Draw line with gradient effect
      if (prev.length > 0) {
        const lastPoint = prev[prev.length - 1];
        const gradient = ctx.createLinearGradient(lastPoint.x, lastPoint.y, x, y);
        gradient.addColorStop(0, '#06b6d4');
        gradient.addColorStop(1, '#8b5cf6');
        
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      
      return newPoints;
    });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    // Check if circle is complete
    if (isCircleClosed(points)) {
      const score = calculateCirclePerfection(points);
      setPerfectionScore(score);
      setIsComplete(true);
      setGameState('complete');
      
      // Update personal best
      if (!personalBest || score > personalBest) {
        setPersonalBest(score);
        localStorage.setItem('circlePersonalBest', score.toString());
      }
      
      // Check if qualifies for leaderboard (top 10 or better than worst score)
      const worstScore = leaderboard.length >= 10 ? leaderboard[9].score : 0;
      if (leaderboard.length < 10 || score > worstScore) {
        setShowCelebration(true);
        playCelebrationSound();
        setTimeout(() => {
          setShowUsernameInput(true);
          setShowCelebration(false);
        }, 2000);
      }
    } else {
      // Reset if not a proper circle
      setTimeout(resetGame, 500);
    }
  };

  // Save to global leaderboard
  const saveToLeaderboard = async () => {
    if (!perfectionScore || !username.trim()) return;
    
    setIsLoading(true);
    
    try {
      const newEntry: LeaderboardEntry = {
        username: username.trim(),
        score: perfectionScore,
        device_id: getDeviceId()
      };
      
      // Try to save to Supabase first
      if (isOnline) {
        const { error } = await supabase
          .from('leaderboard')
          .insert([newEntry]);

        if (error) {
          console.error('Error saving to leaderboard:', error);
          // Fallback to localStorage
          saveToLocalStorage(newEntry);
        } else {
          // Reload leaderboard to get updated data
          await loadLeaderboard();
        }
      } else {
        // Save to localStorage when offline
        saveToLocalStorage(newEntry);
      }
    } catch (error) {
      console.error('Error saving score:', error);
      // Fallback to localStorage
      saveToLocalStorage({
        username: username.trim(),
        score: perfectionScore,
        created_at: new Date().toISOString()
      });
    }
    
    setIsLoading(false);
    setShowUsernameInput(false);
  };

  // Fallback to localStorage
  const saveToLocalStorage = (entry: LeaderboardEntry) => {
    const updatedLeaderboard = [...leaderboard, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    setLeaderboard(updatedLeaderboard);
    localStorage.setItem('circleLeaderboard', JSON.stringify(updatedLeaderboard));
  };

  // Generate tweet
  const generateTweet = () => {
    const text = `I have drawn a ${perfectionScore}% accurate circle, can you beat me? ${window.location.href}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Perfect Circle
          </h1>
          <p className="text-gray-300 text-lg">Draw a perfect circle around the red dot</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            {personalBest && (
              <p className="text-sm text-cyan-400 font-medium">Personal Best: {personalBest}%</p>
            )}
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="text-green-400" size={16} />
              ) : (
                <WifiOff className="text-red-400" size={16} />
              )}
              <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? 'Global' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-8 border border-gray-700/50">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-96 bg-gray-900/50 border-2 border-gray-600/50 rounded-xl cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            
            {/* Game Status Overlay */}
            {gameState === 'drawing' && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                Time: {timeLeft}s
              </div>
            )}
            
            {gameState === 'timeout' && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 backdrop-blur-sm rounded-xl">
                <div className="text-white text-2xl font-bold animate-pulse">Too slow! Try again</div>
              </div>
            )}
            
            {/* Celebration Animation */}
            {showCelebration && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-purple-900/80 to-pink-900/80 backdrop-blur-sm rounded-xl">
                <div className="text-center">
                  <div className="text-6xl animate-bounce mb-4">🎉</div>
                  <div className="text-white text-3xl font-bold animate-pulse">
                    New High Score!
                  </div>
                  <div className="flex justify-center space-x-2 mt-4">
                    <Star className="text-yellow-400 animate-spin" size={24} />
                    <Sparkles className="text-pink-400 animate-pulse" size={24} />
                    <Star className="text-cyan-400 animate-spin" size={24} />
                  </div>
                </div>
              </div>
            )}
            
            {gameState === 'complete' && perfectionScore !== null && !showCelebration && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm rounded-xl">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl text-center border border-gray-600/50 shadow-2xl">
                  <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
                    {perfectionScore}%
                  </div>
                  <div className="space-y-4">
                    <button
                      onClick={generateTweet}
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
                    >
                      <Twitter size={20} />
                      Tweet this
                    </button>
                    <button
                      onClick={resetGame}
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
                    >
                      <RefreshCw size={20} />
                      Play Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Username Input Modal */}
          {showUsernameInput && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-600/50 shadow-2xl max-w-md w-full mx-4">
                <h3 className="text-2xl font-bold text-white mb-2">🏆 New High Score!</h3>
                <p className="text-gray-300 mb-6">
                  Enter your name for the {isOnline ? 'global' : 'local'} leaderboard:
                </p>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Your name"
                  maxLength={20}
                />
                <div className="flex gap-3">
                  <button
                    onClick={saveToLeaderboard}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white px-4 py-3 rounded-xl transition-all duration-200 font-medium"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setShowUsernameInput(false)}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-3 rounded-xl transition-all duration-200 font-medium"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700/50">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Trophy className="text-yellow-400" size={32} />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {isOnline ? 'Global' : 'Local'} Leaderboard
              </span>
              {isOnline ? (
                <Wifi className="text-green-400" size={20} />
              ) : (
                <WifiOff className="text-red-400" size={20} />
              )}
            </h2>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id || index}
                  className={`flex justify-between items-center p-4 rounded-xl transition-all duration-200 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' :
                    index === 1 ? 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30' :
                    index === 2 ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30' :
                    'bg-gray-700/30 border border-gray-600/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`font-bold text-xl ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-orange-400' :
                      'text-gray-400'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className="font-medium text-white">{entry.username}</span>
                  </div>
                  <span className="font-bold text-xl text-cyan-400">{entry.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CircleGame;