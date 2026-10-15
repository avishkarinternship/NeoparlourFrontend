import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  X, 
  MapPin, 
  Home, 
  Briefcase, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Compass
} from 'lucide-react';
import { 
  closeAddressDrawer, 
  openLocationPicker, 
  setActiveLocation, 
  deleteSavedAddressLocal,
  deleteCustomerAddress,
  setDefaultCustomerAddress
} from '../../redux/slices/locationSlice';
import toast from 'react-hot-toast';

export default function AddressDrawer() {
  const dispatch = useDispatch();
  const { isDrawerOpen, activeLocation, savedAddresses } = useSelector((state) => state.location);
  const { isAuthenticated } = useSelector((state) => state.customer);

  const [isOpenRendered, setIsOpenRendered] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  // Sync open state with smooth entrance
  useEffect(() => {
    let timer;
    if (isDrawerOpen) {
      setIsOpenRendered(true);
      setDragOffset(0);
      setIsDragging(false);
      timer = setTimeout(() => {
        setAnimateIn(true);
      }, 20);
    } else {
      setAnimateIn(false);
      setIsOpenRendered(false);
    }
    return () => clearTimeout(timer);
  }, [isDrawerOpen]);

  // Smooth animated close function (for cross button, backdrop click, Escape key, or swipe down)
  const handleClose = () => {
    if (!animateIn) return;
    setAnimateIn(false);
    setTimeout(() => {
      dispatch(closeAddressDrawer());
      setIsOpenRendered(false);
      setDragOffset(0);
    }, 320);
  };

  useEffect(() => {
    if (!isOpenRendered) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpenRendered, animateIn]);

  if (!isOpenRendered) return null;

  const handleSelectAddress = (addr) => {
    dispatch(setActiveLocation(addr));
    handleClose();
    toast.success(`Switched location to ${addr.label || addr.areaName || addr.cityName}`);
  };

  const handleDeleteAddress = (e, id) => {
    e.stopPropagation();
    dispatch(deleteSavedAddressLocal(id));
    if (isAuthenticated) {
      dispatch(deleteCustomerAddress(id));
    }
    toast.success("Address removed");
  };

  const handleSetDefault = (e, id) => {
    e.stopPropagation();
    if (isAuthenticated) {
      dispatch(setDefaultCustomerAddress(id));
    }
    toast.success("Set as default address");
  };

  const handleAddNew = () => {
    handleClose();
    setTimeout(() => {
      dispatch(openLocationPicker());
    }, 320);
  };

  const getIcon = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'HOME') return Home;
    if (t === 'WORK') return Briefcase;
    return MapPin;
  };

  // Touch gesture handlers for downward swipe dismissal
  const handleTouchStart = (e) => {
    const touchY = e.touches[0].clientY;
    startYRef.current = touchY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - startYRef.current;
    if (deltaY > 0) {
      setDragOffset(deltaY);
    } else {
      setDragOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 75) {
      handleClose();
    } else {
      setDragOffset(0);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[9990] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
        animateIn ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className={`w-full sm:max-w-lg bg-white dark:bg-zinc-900 max-h-[85vh] sm:max-h-[80vh] rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col border-t sm:border border-gray-100 dark:border-zinc-800 overflow-hidden transform will-change-transform ${
          isDragging 
            ? '' 
            : 'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]'
        } ${
          animateIn && !isDragging ? 'translate-y-0' : !isDragging ? 'translate-y-full' : ''
        }`}
        style={
          isDragging && dragOffset > 0
            ? { transform: `translateY(${dragOffset}px)` }
            : {}
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Drag Handle indicator for bottom sheet with touch gestures */}
        <div 
          className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 transition-colors" />
        </div>

        {/* Drawer Header */}
        <div 
          className="px-5 py-3.5 sm:py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Select Delivery / Salon Location</h3>
            <p className="text-xs text-gray-400 mt-0.5">Choose your saved address or pin a new location</p>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-all cursor-pointer active:scale-90"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Location Display */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Current Active Location</p>
          <div className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-800 rounded-xl border border-red-200 dark:border-red-900/40 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-gray-900 dark:text-white block truncate">
                {activeLocation?.label || activeLocation?.areaName || activeLocation?.cityName || 'Current GPS'}
              </span>
              <p className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                {activeLocation?.formattedAddress || `${activeLocation?.cityName || ''}`}
              </p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          </div>
        </div>

        {/* Saved Addresses List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Saved Addresses</p>
            <button 
              onClick={handleAddNew}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New
            </button>
          </div>

          {savedAddresses.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
              No saved addresses yet. Click below to pin on map.
            </div>
          ) : (
            savedAddresses.map((addr) => {
              const Icon = getIcon(addr.addressType);
              const isSelected = activeLocation?.id === addr.id || 
                (activeLocation?.latitude === addr.latitude && activeLocation?.longitude === addr.longitude);

              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelectAddress(addr)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected 
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-800 shadow-sm'
                      : 'bg-white dark:bg-zinc-800 border-gray-100 dark:border-zinc-700/80 hover:border-gray-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-white truncate">
                          {addr.addressType || addr.label || 'Location'}
                        </span>
                        {addr.isDefault && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 shrink-0">
                            DEFAULT
                          </span>
                        )}
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 shrink-0">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={(e) => handleSetDefault(e, addr.id)}
                            className="text-[10px] font-bold text-gray-400 hover:text-amber-600 px-1 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                            title="Set as default address"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAddress(e, addr.id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors"
                          title="Remove address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-zinc-200 truncate mt-1">
                      {addr.houseFlatNo ? `${addr.houseFlatNo}, ` : ''}{addr.buildingName ? `${addr.buildingName}, ` : ''}{addr.areaName || addr.cityName}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {addr.landmark ? `Near ${addr.landmark}, ` : ''}{addr.cityName} {addr.pincode}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom CTA to pin new on map */}
        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            onClick={handleAddNew}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Set Location on Map
          </button>
        </div>

      </div>
    </div>
  );
}
