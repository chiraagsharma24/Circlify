import React from 'react';
import { Share } from 'lucide-react';

interface ShareButtonProps {
  score: number;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ score }) => {
  const handleShare = () => {
    const text = `I just drew a ${score.toFixed(1)}% perfect circle at Perfect Circle Challenge! Can you beat me? 🔥`;
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  return (
    <button
      onClick={handleShare}
      className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl border border-white/20"
    >
      <Share className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
      <span className="text-lg">Celebrate on X</span>
      <div className="ml-2 opacity-75 group-hover:opacity-100 transition-opacity">
        🎉
      </div>
    </button>
  );
};