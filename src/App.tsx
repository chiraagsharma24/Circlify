import React from 'react';
import CircleGame from './components/CircleGame';
import { Analytics } from "@vercel/analytics/next";

function App() {
  return (
    <>
      <CircleGame />
      <Analytics />
    </>
  );
}

export default App;