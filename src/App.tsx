import React from 'react';
import CircleGame from './components/CircleGame';
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <>
      <CircleGame />
      <Analytics />
    </>
  );
}

export default App;