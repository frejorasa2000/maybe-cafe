import { useEffect, useState } from 'react';

const SQUARE_ENV = import.meta.env.VITE_SQUARE_ENV === 'production' ? 'production' : 'sandbox';
const SDK_URL =
  SQUARE_ENV === 'production' ? 'https://web.squarecdn.com/v1/square.js' : 'https://sandbox.web.squarecdn.com/v1/square.js';

// Loads Square's Web Payments SDK once and shares it across every mount
// (the checkout modal can open/close many times per session).
let loadPromise = null;

function loadSquareSdk() {
  if (window.Square) return Promise.resolve(window.Square);
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SDK_URL;
      script.onload = () => resolve(window.Square);
      script.onerror = () => reject(new Error('Failed to load Square SDK'));
      document.head.appendChild(script);
    });
  }
  return loadPromise;
}

export function useSquareSdk() {
  const [square, setSquare] = useState(window.Square || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (square) return;
    let cancelled = false;
    loadSquareSdk()
      .then((sdk) => {
        if (!cancelled) setSquare(sdk);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [square]);

  return { square, error };
}
