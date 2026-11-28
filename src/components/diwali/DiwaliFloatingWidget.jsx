import React, { useState } from 'react';
import { Sparkles, Flame, X } from 'lucide-react';

/**
 * DiwaliFloatingWidget
 * --------------------
 * Simplified, discrete floating Diwali Diya widget.
 * Exclusively Golden & Red firecrackers without mode selection.
 */
const DiwaliFloatingWidget = ({
  enabled,
  onToggleEnabled,
  onBurst
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`diwali-interactive fixed bottom-5 right-5 z-[9999] select-none transition-all duration-300 ${
        isOpen ? 'scale-100' : 'scale-95'
      }`}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Expanded Control Card */}
      {isOpen ? (
        <div className="w-72 bg-zinc-950/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/50 p-4 text-white animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🪔</span>
              <div>
                <h4 className="font-bold text-sm tracking-wide text-amber-300 flex items-center gap-1.5">
                  Happy Diwali!
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                </h4>
                <p className="text-[11px] text-amber-200/70 font-medium">Golden & Red Starbursts</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
              title="Minimize widget"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-2.5 mb-3">
            <span className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
              <Flame className={`w-3.5 h-3.5 ${enabled ? 'text-amber-400' : 'text-zinc-500'}`} />
              Firecrackers
            </span>
            <button
              onClick={() => onToggleEnabled(!enabled)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                enabled ? 'bg-amber-500' : 'bg-zinc-700'
              }`}
              role="switch"
              aria-checked={enabled}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {enabled && (
            <>
              {/* Golden & Red palette visual indicator */}
              <div className="mb-3 bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-medium">Palette:</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]"></span>
                    <span className="text-[11px] text-amber-300 font-semibold">Gold</span>
                  </div>
                  <span className="text-zinc-600 text-xs">&</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]"></span>
                    <span className="text-[11px] text-red-400 font-semibold">Red</span>
                  </div>
                </div>
              </div>

              {/* Instant Launch Button */}
              <button
                onClick={() => onBurst && onBurst(1)}
                className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:via-orange-400 hover:to-red-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/40 transition-all flex items-center justify-center gap-1.5"
              >
                <span>🚀</span>
                <span>Launch Cracker Straight Up!</span>
                <span>✨</span>
              </button>
            </>
          )}

          {/* Footer note */}
          <div className="mt-3 pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1">
            <span>✨ 360° Starburst • Optical lens flare</span>
          </div>
        </div>
      ) : (
        /* Collapsed Floating Diya Pill */
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-3.5 py-2.5 bg-zinc-950/90 hover:bg-zinc-900/95 border border-amber-500/50 hover:border-amber-400/80 rounded-full shadow-lg shadow-amber-950/40 text-amber-300 transition-all duration-300 backdrop-blur-md hover:scale-105 active:scale-95"
          title="Diwali Fireworks Settings"
          aria-label="Open Diwali Fireworks Menu"
        >
          {enabled && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}

          {/* Diya Icon */}
          <span className="text-xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">🪔</span>

          <span className="text-xs font-semibold tracking-wide text-amber-200 group-hover:text-amber-100 flex items-center gap-1">
            Diwali
            <Sparkles className="w-3 h-3 text-amber-400" />
          </span>
        </button>
      )}
    </div>
  );
};

export default React.memo(DiwaliFloatingWidget);
