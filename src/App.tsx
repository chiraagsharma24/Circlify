import React from 'react';
import CircleGame from './components/CircleGame';
import { Analytics } from "@vercel/analytics/react";
import { Twitter } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center">
      <CircleGame />
      <Analytics />
      <footer className="w-full mt-8 flex flex-col items-center justify-center pb-4">
        <div className="text-center text-sm text-gray-400 flex items-center justify-center gap-1">
          Made with <span className="text-pink-500 mx-1">♥</span> by
          <a
            href="https://x.com/LordGoldyy"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 font-semibold underline flex items-center gap-1 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent hover:underline"
          >
            <Twitter size={16} className="inline-block text-blue-400" />
            Goldyy
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;