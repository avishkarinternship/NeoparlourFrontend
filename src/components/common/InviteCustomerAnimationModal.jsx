import React, { useEffect, useState } from 'react';
import { Send, CheckCircle2, UserCheck, Sparkles, Zap, Smartphone, ArrowRight, XCircle, AlertTriangle, RefreshCw, AlertCircle, X } from 'lucide-react';

/**
 * Enhanced Invite Customer & Action Animation Modal
 * Supports:
 * - SUCCESS (New Customer Invite + Points Credited)
 * - WARNING (Unregistered Customer with Existing Invite Resent, 0 Points)
 * - INFO (Already Registered Customer, 0 Points)
 * - FAILURE (Booking / API Error)
 */
export default function InviteCustomerAnimationModal({
  isOpen = false,
  type = 'NEW_INVITE', // 'NEW_INVITE' | 'RE_INVITED' | 'ALREADY_REGISTERED' | 'FAILURE'
  status, // explicit override: 'success' | 'warning' | 'info' | 'failure'
  phone = '',
  name = '',
  points = 3,
  title = '',
  message = '',
  onClose,
  onProceed,
  autoCloseTime = 0 // 0 means popup stays open until manually closed by staff
}) {
  const [coins, setCoins] = useState([]);
  const [showCard, setShowCard] = useState(false);

  // Determine current mode
  const currentStatus = status || (
    type === 'FAILURE' || type === 'ERROR' ? 'failure' :
    type === 'RE_INVITED' || type === 'WARNING' ? 'warning' :
    type === 'ALREADY_REGISTERED' || type === 'INFO' ? 'info' : 'success'
  );

  const isSuccess = currentStatus === 'success';
  const isWarning = currentStatus === 'warning';
  const isInfo = currentStatus === 'info';
  const isFailure = currentStatus === 'failure';

  useEffect(() => {
    if (isOpen) {
      setShowCard(false);

      if (isSuccess) {
        // Spawn 12 flying gold coins across the screen
        const newCoins = Array.from({ length: 12 }).map((_, i) => ({
          id: i,
          top: Math.random() * 60 + 20,
          delay: (i * 0.07).toFixed(2),
          duration: (0.75 + Math.random() * 0.35).toFixed(2),
          scale: (0.8 + Math.random() * 0.4).toFixed(2),
        }));
        setCoins(newCoins);
      } else {
        setCoins([]);
      }

      const cardTimer = setTimeout(() => {
        setShowCard(true);
      }, 200);

      // Auto proceed / dismiss if autoCloseTime > 0
      let autoTimer;
      if (autoCloseTime > 0) {
        autoTimer = setTimeout(() => {
          if (onProceed && (isSuccess || isWarning || isInfo)) onProceed();
          if (onClose) onClose();
        }, autoCloseTime);
      }

      return () => {
        clearTimeout(cardTimer);
        if (autoTimer) clearTimeout(autoTimer);
      };
    } else {
      setShowCard(false);
      setCoins([]);
    }
  }, [isOpen, currentStatus, autoCloseTime, onProceed, onClose, isSuccess]);

  if (!isOpen) return null;

  // Resolve Header Title
  const resolvedTitle = title || (
    isSuccess ? 'New Customer Invitation Sent!' :
    isWarning ? 'Invite Link Already Sent Previously' :
    isInfo ? 'This Customer Is Already Registered' :
    'Invitation / Booking Failed'
  );

  // Resolve Subtitle / Body
  const resolvedSubtitle = message || (
    isSuccess
      ? `Invitation link with referral code sent to ${name ? name + ' (' + phone + ')' : phone || 'customer'}.`
      : isWarning
      ? `An invite link has already been sent to ${name ? name + ' (' + phone + ')' : phone || 'this customer'}. No extra reward points claimed.`
      : isInfo
      ? `Customer ${name || phone || ''} is already registered on NeoParlour.`
      : `Could not process booking for ${phone || 'customer'}. Please check mobile number or internet connection.`
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md overflow-hidden p-4 animate-in fade-in duration-200">
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes flyRightInvite {
          0% {
            transform: translateX(-120px) translateY(0px) rotate(0deg) scale(0.6);
            opacity: 0;
          }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(-60px) rotate(540deg) scale(1.1);
            opacity: 0;
          }
        }
        @keyframes invitePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes modalShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-fly-invite {
          animation: flyRightInvite linear forwards;
        }
        .animate-invite-pulse {
          animation: invitePulse 2s infinite ease-in-out;
        }
        .animate-modal-shake {
          animation: modalShake 0.4s ease-in-out;
        }
      `}</style>

      {/* Flying coins overlay for SUCCESS mode */}
      {isSuccess && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {coins.map((coin) => (
            <div
              key={coin.id}
              className="absolute left-0 animate-fly-invite flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(255,215,0,0.85)]"
              style={{
                top: `${coin.top}%`,
                animationDelay: `${coin.delay}s`,
                animationDuration: `${coin.duration}s`,
                transform: `scale(${coin.scale})`,
              }}
            >
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border-2 border-yellow-100 flex items-center justify-center shadow-lg shadow-amber-500/50">
                <span className="text-xs select-none">🪙</span>
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-1 bg-gradient-to-r from-transparent to-amber-300 rounded-full blur-[1px]"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Card */}
      <div
        className={`relative max-w-sm w-full rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-all duration-500 transform ${
          isSuccess
            ? 'bg-slate-900 border border-emerald-500/40 shadow-emerald-500/20'
            : isWarning
            ? 'bg-slate-900 border border-amber-500/40 shadow-amber-500/20'
            : isFailure
            ? 'bg-slate-900 border border-rose-500/40 shadow-rose-500/25 animate-modal-shake'
            : 'bg-slate-900 border border-indigo-500/40 shadow-indigo-500/20'
        } ${showCard ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-6'}`}
      >
        {/* Radial Background Accent */}
        <div
          className={`absolute inset-0 rounded-3xl pointer-events-none ${
            isSuccess
              ? 'bg-gradient-to-b from-emerald-500/15 via-amber-500/5 to-transparent'
              : isWarning
              ? 'bg-gradient-to-b from-amber-500/15 via-yellow-500/5 to-transparent'
              : isFailure
              ? 'bg-gradient-to-b from-rose-500/15 via-red-500/5 to-transparent'
              : 'bg-gradient-to-b from-indigo-500/15 via-blue-500/5 to-transparent'
          }`}
        />

        {/* Top-Right Manual Close Button */}
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
          }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Close Popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Badge Header */}
        <div
          className={`relative mx-auto w-20 h-20 rounded-2xl p-0.5 shadow-xl mb-5 flex items-center justify-center ${
            isSuccess
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-300 shadow-emerald-500/30 animate-invite-pulse'
              : isWarning
              ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-amber-500/30 animate-invite-pulse'
              : isFailure
              ? 'bg-gradient-to-tr from-rose-600 to-red-400 shadow-rose-500/40'
              : 'bg-gradient-to-tr from-indigo-500 to-sky-300 shadow-indigo-500/30 animate-invite-pulse'
          }`}
        >
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            {isSuccess ? (
              <Smartphone className="w-9 h-9 text-emerald-400" />
            ) : isWarning ? (
              <Send className="w-9 h-9 text-amber-400" />
            ) : isFailure ? (
              <AlertTriangle className="w-9 h-9 text-rose-400 animate-bounce" />
            ) : (
              <UserCheck className="w-9 h-9 text-indigo-400" />
            )}
          </div>

          <div
            className={`absolute -bottom-2 -right-2 p-1.5 rounded-full border-2 border-slate-900 shadow-md ${
              isSuccess
                ? 'bg-amber-400 text-slate-950'
                : isWarning
                ? 'bg-amber-500 text-slate-950'
                : isFailure
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-500 text-white'
            }`}
          >
            {isSuccess ? (
              <Zap className="w-4 h-4 fill-slate-950" />
            ) : isWarning ? (
              <AlertCircle className="w-4 h-4 text-slate-950" />
            ) : isFailure ? (
              <XCircle className="w-4 h-4 text-white" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        {/* Status Tag Header */}
        {isSuccess && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> +{points || 3} Referral Points Credited 🪙
          </div>
        )}

        {isWarning && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-black uppercase tracking-wider mb-3">
            <AlertCircle className="w-3.5 h-3.5" /> Invite Link Previously Sent (0 Pts)
          </div>
        )}

        {isFailure && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/20 border border-rose-400/40 rounded-full text-rose-300 text-xs font-black uppercase tracking-wider mb-3">
            <AlertTriangle className="w-3.5 h-3.5" /> Invitation / Booking Failed
          </div>
        )}

        {isInfo && (
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-500/20 border border-indigo-400/40 rounded-full text-indigo-300 text-xs font-black uppercase tracking-wider mb-3">
            <UserCheck className="w-3.5 h-3.5" /> Existing Customer Registered
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-black text-white tracking-tight mb-2">
          {resolvedTitle}
        </h3>

        {/* Subtitle / Message */}
        <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6">
          {resolvedSubtitle}
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            if (onProceed && (isSuccess || isWarning || isInfo)) onProceed();
            if (onClose) onClose();
          }}
          className={`w-full py-3.5 px-6 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
            isSuccess
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20'
              : isWarning
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/20'
              : isFailure
              ? 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-rose-500/30'
              : 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white shadow-indigo-500/20'
          }`}
        >
          {isSuccess ? (
            <>Proceed to Booking <ArrowRight className="w-4 h-4" /></>
          ) : isWarning ? (
            <>Continue Booking <ArrowRight className="w-4 h-4" /></>
          ) : isFailure ? (
            <>Dismiss & Retry <RefreshCw className="w-4 h-4" /></>
          ) : (
            <>Continue Booking <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
