import React from 'react';
import CircleGame from './components/CircleGame';
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center">
      <CircleGame />
      <Analytics />
      <footer className="w-full mt-8 flex flex-col items-center justify-center pb-4">
        <div className="text-center text-sm text-gray-400">
          Made with <span className="text-pink-500">♥</span> by
          <a
            href="https://x.com/LordGoldyy"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 font-semibold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent hover:underline"
          >
            Goldyy
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;