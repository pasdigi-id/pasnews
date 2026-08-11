import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle, className = '' }) => {
  return (
    <button
      onClick={onToggle}
      type="button"
      className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700'
          : 'bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200'
      } ${className}`}
      title={theme === 'dark' ? 'Ganti ke Mode Terang (Light)' : 'Ganti ke Mode Gelap (Dark)'}
    >
      {theme === 'dark' ? (
        <>
          <Moon className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          <span>Gelap</span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
          <span>Terang</span>
        </>
      )}
    </button>
  );
};
