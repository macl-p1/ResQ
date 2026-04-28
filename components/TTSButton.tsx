'use client';
import { useState, useRef } from 'react';

interface TTSButtonProps {
  text: string;
  languageCode?: string;
}

export default function TTSButton({ text, languageCode = 'en-IN' }: TTSButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleClick = async () => {
    // If playing, stop
    if (state === 'playing') {
      audioRef.current?.pause();
      audioRef.current = null;
      setState('idle');
      return;
    }

    setState('loading');
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, languageCode })
      });

      if (!response.ok) throw new Error('TTS failed');

      const { audio } = await response.json();
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audio), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioEl = new Audio(audioUrl);
      audioRef.current = audioEl;

      audioEl.onended = () => {
        setState('idle');
        URL.revokeObjectURL(audioUrl);
      };
      audioEl.onerror = () => setState('error');

      await audioEl.play();
      setState('playing');

    } catch (error) {
      console.error('TTS error:', error);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  };

  return (
    <button
      onClick={handleClick}
      title={state === 'playing' ? 'Stop audio' : 'Listen to this report'}
      style={{
        background: 'none',
        border: '1px solid #E8EAED',
        borderRadius: 20,
        padding: '4px 10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 12,
        color: state === 'error' ? '#D93025' : state === 'playing' ? '#1A73E8' : '#5F6368',
        transition: 'all 0.2s'
      }}
    >
      {state === 'loading' && <span>⏳</span>}
      {state === 'playing' && <span>⏸️</span>}
      {state === 'idle' && <span>🔊</span>}
      {state === 'error' && <span>❌</span>}
      <span>
        {state === 'loading' ? 'Loading...' :
         state === 'playing' ? 'Stop' :
         state === 'error' ? 'Failed' : 'Listen'}
      </span>
    </button>
  );
}
