import React, { useEffect, useState } from 'react';
import { Sparkles, Trophy, Award, CheckCircle2, Zap, AlertOctagon, XCircle, RefreshCw, X } from 'lucide-react';

/**
 * Enhanced Reward Points Animation Modal
 * Supports SUCCESS (Flying Gold Coins, Trophy, +Points) and FAILURE (Red Alert, Card Shake, Error details).
 */
export default function RewardPointsAnimation({
  isOpen = false,
  status = 'success', // 'success' | 'failure'
  isSuccess = true, // alternative boolean prop
  isError = false,   // alternative boolean prop
  points = 50,
  title = '',
  subtitle = '',
  errorMessage = '',
  onClose,
  autoCloseTime = 0 // 0 means popup stays open until staff manually closes it
}) {
  const [coins, setCoins] = useState([]);
  const [showCard, setShowCard] = useState(false);

  // Determine resolved status mode
  const resolvedStatus = (isError || status === 'failure' || isSuccess === false) ? 'failure' : 'success';
  const isSuccessMode = resolvedStatus === 'success';

  useEffect(() => {
    if (isOpen) {
      setShowCard(false);

      if (isSuccessMode) {
        // Generate 14 fast flying gold coins with randomized trajectories & staggered delays
        const newCoins = Array.from({ length: 14 }).map((_, i) => ({
          id: i,
          top: Math.random() * 60 + 20, // 20% to 80% screen height
          delay: (i * 0.06).toFixed(2),
          duration: (0.7 + Math.random() * 0.35).toFixed(2),
          scale: (0.8 + Math.random() * 0.5).toFixed(2),
        }));
        setCoins(newCoins);
      } else {
        setCoins([]);
      }

      // Show reward/error card after initial delay
      const cardTimer = setTimeout(() => {
        setShowCard(true);
      }, 350);

      // Auto dismiss timer if autoCloseTime > 0
      let dismissTimer;
      if (autoCloseTime > 0) {
        dismissTimer = setTimeout(() => {
          if (onClose) onClose();
        }, autoCloseTime);
      }

      return () => {
        clearTimeout(cardTimer);
        if (dismissTimer) clearTimeout(dismissTimer);
      };
    } else {
      setShowCard(false);
      setCoins([]);
    }
  }, [isOpen, isSuccessMode, autoCloseTime, onClose]);

  if (!isOpen) return null;

  // Title fallback resolution
  const resolvedTitle = title || (
    isSuccessMode ? "Appointment Completed!" : "Appointment Completion Failed"
  );

  // Subtitle fallback resolution
  const resolvedSubtitle = errorMessage || subtitle || (
    isSuccessMode
      ? "Reward points & commission successfully collected and added to wallet."
      : "Could not complete appointment or process reward points. Please check network connection and try again."
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md overflow-hidden p-4 animate-in fade-in duration-200">
      {/* Dynamic CSS Keyframe Animations */}
      <style>{`
        @keyframes flyRightFast {
          0% {
            transform: translateX(-150px) translateY(0px) rotate(0deg) scale(0.6);
            opacity: 0;
          }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(-80px) rotate(720deg) scale(1.2);
            opacity: 0;
          }
        }
        @keyframes rewardPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes shineGlow {
          0% { opacity: 0.3; transform: rotate(0deg); }
          50% { opacity: 0.8; transform: rotate(180deg); }
          100% { opacity: 0.3; transform: rotate(360deg); }
        }
        @keyframes modalShakeError {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-fly-fast {
          animation: flyRightFast linear forwards;
        }
        .animate-reward-pulse {
          animation: rewardPulse 2s infinite ease-in-out;
        }
        .animate-shine-glow {
          animation: shineGlow 6s infinite linear;
        }
        .animate-modal-shake-error {
          animation: modalShakeError 0.4s ease-in-out;
        }
      `}</style>

      {/* Stream of Flying Gold Coins across screen (For SUCCESS Mode) */}
      {isSuccessMode && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {coins.map((coin) => (
            <div
              key={coin.id}
              className="absolute left-0 animate-fly-fast flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(255,215,0,0.85)]"
              style={{
                top: `${coin.top}%`,
                animationDelay: `${coin.delay}s`,
                animationDuration: `${coin.duration}s`,
                transform: `scale(${coin.scale})`,
              }}
            >
              {/* Shiny Gold Coin Graphics */}
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border-2 border-yellow-100 flex items-center justify-center shadow-lg shadow-amber-500/50">
                <div className="w-7 h-7 rounded-full border border-amber-600/40 bg-amber-400 flex items-center justify-center font-black text-amber-900 text-xs shadow-inner select-none">
                  🪙
                </div>
                {/* Speed motion trail light behind coin */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-10 h-1.5 bg-gradient-to-r from-transparent via-amber-300/80 to-yellow-400 rounded-full blur-[1px]"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Center Reward Completion or Failure Card */}
      <div
        className={`relative max-w-sm w-full bg-slate-900 rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-all duration-500 transform ${
          isSuccessMode
            ? 'border border-amber-500/40 shadow-amber-500/20'
            : 'border border-rose-500/40 shadow-rose-500/25 animate-modal-shake-error'
        } ${showCard ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-6'}`}
      >
        {/* Background Radial Glow */}
        <div
          className={`absolute inset-0 rounded-3xl pointer-events-none ${
            isSuccessMode
              ? 'bg-gradient-to-b from-amber-500/10 via-red-500/5 to-transparent'
              : 'bg-gradient-to-b from-rose-500/15 via-red-500/5 to-transparent'
          }`}
        />

        {/* Top-Right Manual Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Close Popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Rotating Glow Ring for Success */}
        {isSuccessMode && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-28 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full blur-xl opacity-40 animate-shine-glow pointer-events-none" />
        )}

        {/* Icon Header */}
        <div
          className={`relative mx-auto w-20 h-20 rounded-2xl p-0.5 shadow-xl mb-5 flex items-center justify-center ${
            isSuccessMode
              ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-amber-500/30 animate-reward-pulse'
              : 'bg-gradient-to-tr from-rose-600 to-red-400 shadow-rose-500/40'
          }`}
        >
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            {isSuccessMode ? (
              <Trophy className="w-10 h-10 text-amber-400" />
            ) : (
              <AlertOctagon className="w-10 h-10 text-rose-400 animate-pulse" />
            )}
          </div>

          <div
            className={`absolute -bottom-2 -right-2 p-1 rounded-full border-2 border-slate-900 shadow-md ${
              isSuccessMode ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {isSuccessMode ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        {/* Points or Failure Tag Header */}
        {isSuccessMode ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-amber-400 text-xs font-black uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 fill-amber-400" /> +{points} Reward Points Collected
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/15 border border-rose-500/30 rounded-full text-rose-400 text-xs font-black uppercase tracking-wider mb-3">
            <AlertOctagon className="w-3.5 h-3.5" /> Reward Points Not Credited ⚠️
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-black text-white tracking-tight mb-2">
          {resolvedTitle}
        </h3>

        {/* Subtitle / Message */}
        <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6">
          {resolvedSubtitle}
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3 px-6 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
            isSuccessMode
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20'
              : 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-rose-500/30'
          }`}
        >
          {isSuccessMode ? (
            'Awesome! 🎉'
          ) : (
            <>Close & Retry <RefreshCw className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
