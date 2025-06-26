import React from 'react';
import CircleGame from './components/CircleGame';
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <>
      <CircleGame />
      <Analytics />
      <footer className="w-full text-center py-4 text-gray-400 text-sm">
        made with love by <a href="https://x.com/LordGoldyy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Goldyy</a>
      </footer>
    </>
  );
}

export default App;