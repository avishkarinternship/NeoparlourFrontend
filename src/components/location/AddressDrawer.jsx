import React from 'react';
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

  if (!isDrawerOpen) return null;

  const handleSelectAddress = (addr) => {
    dispatch(setActiveLocation(addr));
    dispatch(closeAddressDrawer());
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
    dispatch(closeAddressDrawer());
    dispatch(openLocationPicker());
  };

  const getIcon = (type) => {
    const t = (type || '').toUpperCase();
    if (t === 'HOME') return Home;
    if (t === 'WORK') return Briefcase;
    return MapPin;
  };

  return (
    <div className="fixed inset-0 z-[9990] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-gray-100 dark:border-zinc-800 animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Select Delivery / Salon Location</h3>
            <p className="text-xs text-gray-400 mt-0.5">Choose your saved address or pin a new location</p>
          </div>
          <button 
            onClick={() => dispatch(closeAddressDrawer())}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors"
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
