'use client'

import React, { useState, useEffect } from 'react';

const phrases = [
  'Reticulating splines...',
  'PLS GIEF GPU!!!',
  'Rendering the awesome...',
  'Calculating infinity...',
  'PLS GIEF GPU!!!',
  'Dividing by zero...',
  'PLS GIEF GPU!!!',
  'Spinning up the hamster...',
  'Shovelling coal into the server...',
  'PLS GIEF GPU!!!',
  'Programming the flux capacitor...',
  '640K ought to be enough for anybody...',
  'PLS GIEF GPU!!!',
  'The architects are still drafting...',
  'The bits are breeding...',
  'PLS GIEF GPU!!!',
  'Would you prefer chicken, steak, or tofu?...',
  'PLS GIEF GPU!!!',
  'Pay no attention to the man behind the curtain...',
  'PLS GIEF GPU!!!',
  'The server is powered by a lemon and two electrodes...',
];

export default function Loading() {
  const [phrase, setPhrase] = useState('Loading...');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="h-full w-full flex justify-center items-center">
      <span className="h-5 animate-spin relative flex h-10 w-10 rounded-sm bg-[#0278CD] mr-3"></span>
      <span>{phrase}</span>
    </div>
  );
}