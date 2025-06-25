import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { Canvas } from './components/Canvas';
import { ScoreDisplay } from './components/ScoreDisplay';
import { HighScore } from './components/HighScore';
import { InfoModal } from './components/InfoModal';
import { ShareButton } from './components/ShareButton';
import { Confetti } from './components/Confetti';
import { analyzeCircle } from './utils/circleAnalysis';
import { getHighScore } from './utils/storage';
import { soundManager } from './utils/sound';

interface Point {
  x: number;
  y: number;
}

function App() {
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const handleCircleComplete = (points: Point[]) => {
    const analysis = analyzeCircle(points);
    const score = analysis.score;
    setCurrentScore(score);

    const highScore = getHighScore();
    const isRecord = score > highScore.score;
    setIsNewRecord(isRecord);

    // Play sound effects
    if (score >= 98) {
      soundManager.playPerfect();
    } else if (score >= 85) {
      soundManager.playSuccess();
    }

    // Show confetti for great scores
    if (score >= 90) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    if (isRecord) {
      soundManager.playNewRecord();
    }
  };

  const handleRecordSet = () => {
    setIsNewRecord(false);
  };

  const highScore = getHighScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 relative overflow-hidden">
      <Confetti isActive={showConfetti} />
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-white rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full blur-xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Section */}
        <header className="text-center pt-8 pb-6 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              Perfect Circle Challenge
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 font-medium">
              Draw the most perfect circle you can!
            </p>
            <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white/90 text-sm sm:text-base font-medium">
              <span className="mr-2">🏆</span>
              Current Record: <span className="font-bold mx-1 text-yellow-300">{highScore.name}</span> with{' '}
              <span className="font-bold ml-1 text-yellow-300">{highScore.score.toFixed(1)}%</span> perfection
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-7xl mx-auto">
            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
              {/* Left Sidebar - High Score */}
              <div className="lg:col-span-3 flex justify-center">
                <div className="w-full max-w-sm">
                  <HighScore currentScore={currentScore} onRecordSet={handleRecordSet} />
                </div>
              </div>

              {/* Center - Canvas and Score */}
              <div className="lg:col-span-6 flex flex-col items-center space-y-8">
                <Canvas 
                  onCircleComplete={handleCircleComplete} 
                  isDrawing={isDrawing}
                  setIsDrawing={setIsDrawing}
                />
                
                {currentScore !== null && (
                  <div className="space-y-6 flex flex-col items-center">
                    <ScoreDisplay score={currentScore} isNewRecord={isNewRecord} />
                    <ShareButton score={currentScore} />
                  </div>
                )}

                {!isDrawing && currentScore === null && (
                  <div className="text-center text-white/90 max-w-md">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <p className="text-xl font-semibold mb-3">✨ Ready to start?</p>
                      <p className="text-white/80 leading-relaxed">
                        Draw a circle on the canvas above. Try to make it as perfect as possible!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Info */}
              <div className="lg:col-span-3 flex justify-center">
                <div className="w-full max-w-sm">
                  <button
                    onClick={() => setShowInfo(true)}
                    className="w-full bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:bg-white/25 transition-all duration-300 group border border-white/20 hover:border-white/30"
                  >
                    <div className="flex flex-col items-center gap-4 text-white">
                      <Info className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                      <div className="text-center">
                        <div className="font-bold text-lg mb-1">How it works</div>
                        <div className="text-white/80 text-sm">Learn about our scoring algorithm</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Layout */}
            <div className="lg:hidden space-y-8">
              {/* Canvas Section */}
              <div className="flex flex-col items-center space-y-6">
                <Canvas 
                  onCircleComplete={handleCircleComplete} 
                  isDrawing={isDrawing}
                  setIsDrawing={setIsDrawing}
                />
                
                {currentScore !== null && (
                  <div className="space-y-6 flex flex-col items-center w-full">
                    <ScoreDisplay score={currentScore} isNewRecord={isNewRecord} />
                    <ShareButton score={currentScore} />
                  </div>
                )}

                {!isDrawing && currentScore === null && (
                  <div className="text-center text-white/90 max-w-md mx-auto">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <p className="text-xl font-semibold mb-3">✨ Ready to start?</p>
                      <p className="text-white/80 leading-relaxed">
                        Draw a circle on the canvas above. Try to make it as perfect as possible!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Section - High Score and Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="order-1">
                  <HighScore currentScore={currentScore} onRecordSet={handleRecordSet} />
                </div>
                
                <div className="order-2">
                  <button
                    onClick={() => setShowInfo(true)}
                    className="w-full h-full bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:bg-white/25 transition-all duration-300 group border border-white/20 hover:border-white/30 min-h-[140px] flex flex-col justify-center"
                  >
                    <div className="flex flex-col items-center gap-3 text-white">
                      <Info className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
                      <div className="text-center">
                        <div className="font-bold text-lg mb-1">How it works</div>
                        <div className="text-white/80 text-sm">Learn about scoring</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center pb-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 inline-block border border-white/20">
              <p className="text-white/80 text-sm font-medium">
                💡 Draw slowly and steadily • Close the circle completely • Practice makes perfect!
              </p>
            </div>
          </div>
        </footer>
      </div>

      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </div>
  );
}

export default App;