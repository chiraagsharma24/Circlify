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
          Designed and Developed by Chirag Sharma
        </div>
      </footer>
    </div>
  );
}

export default App;