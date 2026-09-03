import React, { useState, useEffect, useRef } from 'react';
import { INDIAN_STATES, getStateFromGstin } from '../../constants/indianStates';
import { ChevronDown, Check, Search } from 'lucide-react';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const StateSelector = ({ state, onChange, error, isDarkMode = false, disabled = false, showLabel = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStateSelect = (enumValue) => {
    if (disabled) return;
    onChange(enumValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const sortedStates = [...INDIAN_STATES].sort((a, b) => a.displayName.localeCompare(b.displayName));
  const filteredStates = sortedStates.filter(st => 
    st.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedStateObj = INDIAN_STATES.find(s => s.enumValue === state);

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {showLabel && (
        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 text-left ${
          isDarkMode ? 'text-zinc-300' : 'text-gray-700'
        }`}>
          State <span className="text-red-500">*</span>
        </label>
      )}
      
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={`w-full p-4 border rounded-2xl text-sm font-bold flex items-center justify-between transition text-left ${
          disabled ? (isDarkMode ? 'bg-zinc-800/40 border-zinc-800 text-zinc-300 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed') : ''
        } ${
          isDarkMode 
            ? 'border-zinc-700 bg-zinc-800 text-white focus:border-[#ff0b01]' 
            : 'border-gray-100 bg-[#fafafa] text-gray-900 focus:border-[#ff0b01] focus:bg-white'
        }`}
      >
        <span className={selectedStateObj ? (isDarkMode ? (disabled ? 'text-zinc-300' : 'text-white') : 'text-gray-900') : (isDarkMode ? 'text-zinc-500' : 'text-gray-400')}>
          {selectedStateObj ? selectedStateObj.displayName : 'Select State / UT'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#ff0b01]' : ''}`} />
      </button>

      {/* Downwards Dropdown Menu */}
      {isOpen && !disabled && (
        <div className={`absolute top-full left-0 right-0 z-[100] mt-1.5 border rounded-2xl shadow-2xl overflow-hidden p-2 text-left animate-in fade-in slide-in-from-top-2 duration-150 ${
          isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-100 text-gray-900'
        }`}>
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search state..."
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border font-bold focus:outline-none transition ${
                isDarkMode 
                  ? 'bg-zinc-900 border-zinc-700 text-white focus:border-[#ff0b01]' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#ff0b01]'
              }`}
              autoFocus
            />
          </div>

          {/* Options List */}
          <div className="max-h-52 overflow-y-auto space-y-0.5 custom-scrollbar">
            <div
              onClick={() => handleStateSelect('')}
              className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                !state ? 'bg-[#ff0b01]/10 text-[#ff0b01]' : isDarkMode ? 'hover:bg-zinc-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              Select State / UT
            </div>
            {filteredStates.length > 0 ? (
              filteredStates.map((st) => {
                const isSelected = st.enumValue === state;
                return (
                  <div
                    key={st.enumValue}
                    onClick={() => handleStateSelect(st.enumValue)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected 
                        ? 'bg-[#ff0b01] text-white font-black' 
                        : isDarkMode 
                          ? 'hover:bg-zinc-700 text-zinc-200' 
                          : 'hover:bg-[#ff0b01]/5 hover:text-[#ff0b01] text-gray-700'
                    }`}
                  >
                    <span>{st.displayName}</span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-3 text-xs text-center text-gray-400 font-medium">
                No state found
              </div>
            )}
          </div>
        </div>
      )}

      {state && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1 text-left">
          <span>✓ Selected:</span>
          <span>{selectedStateObj?.displayName}</span>
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1 font-medium text-left">{error}</p>
      )}
    </div>
  );
};

export const GstinInput = ({ gstin, state, onChange, isDarkMode = false, disabled = false, showLabel = true }) => {
  const handleGstinChange = (e) => {
    if (disabled) return;
    const rawVal = e.target.value.toUpperCase();
    const autoDerivedState = getStateFromGstin(rawVal);
    onChange({
      gstin: rawVal,
      state: state ? state : (autoDerivedState || state)
    });
  };

  const cleanGstin = (gstin || '').trim().toUpperCase();
  const isFormatValid = !cleanGstin || GSTIN_REGEX.test(cleanGstin);

  // Check state code mismatch against selected state
  const gstinPrefix = cleanGstin.length >= 2 ? cleanGstin.substring(0, 2) : '';
  const isNumericPrefix = /^\d{2}$/.test(gstinPrefix);

  const selectedStateObj = state ? INDIAN_STATES.find(s => 
    s.enumValue === state || 
    s.displayName.toLowerCase() === state.toLowerCase() ||
    s.enumValue.replace(/_/g, ' ').toLowerCase() === state.toLowerCase()
  ) : null;

  const derivedStateObj = isNumericPrefix ? INDIAN_STATES.find(s => s.stateCode === gstinPrefix) : null;

  const isStateMismatch = Boolean(
    cleanGstin.length >= 2 &&
    isNumericPrefix &&
    selectedStateObj &&
    selectedStateObj.stateCode !== gstinPrefix
  );

  const isGstinValid = isFormatValid && !isStateMismatch;

  return (
    <div className="font-sans text-left">
      {showLabel && (
        <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
          isDarkMode ? 'text-zinc-300' : 'text-gray-700'
        }`}>
          GSTIN Number <span className={isDarkMode ? 'text-zinc-500 font-normal' : 'text-gray-400 font-normal'}>(Optional)</span>
        </label>
      )}
      <input
        type="text"
        maxLength={15}
        disabled={disabled}
        placeholder="GSTIN Number (Optional, e.g. 27AAAAA0000A1Z5)"
        value={gstin || ''}
        onChange={handleGstinChange}
        className={`w-full p-4 border rounded-2xl uppercase tracking-wider text-sm font-mono focus:outline-none transition ${
          disabled ? (isDarkMode ? 'bg-zinc-800/40 border-zinc-800 text-zinc-300 cursor-not-allowed' : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed') : ''
        } ${
          !isGstinValid 
            ? 'border-red-500 bg-red-50 text-red-900 focus:ring-2 focus:ring-red-500' 
            : isDarkMode 
              ? 'border-zinc-700 bg-zinc-800 text-white focus:border-[#ff0b01] focus:ring-1 focus:ring-[#ff0b01]' 
              : 'border-gray-100 bg-[#fafafa] text-gray-900 focus:border-[#ff0b01] focus:bg-white'
        }`}
      />

      {/* State Code Mismatch Error Notice */}
      {isStateMismatch && (
        <div className="mt-1.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium space-y-1 animate-in fade-in duration-150">
          <p className="font-bold text-red-800 flex items-center gap-1">
            <span>⚠️ State Code Mismatch (Code {gstinPrefix} vs {selectedStateObj?.displayName}):</span>
          </p>
          <p>
            The entered GSTIN state code ({gstinPrefix}{derivedStateObj ? ` - ${derivedStateObj.displayName}` : ''}) does not belong to the selected state ({selectedStateObj?.displayName}).
          </p>
          <p className="text-[11px] text-red-600 font-bold">
            If you don't have the GSTIN for {selectedStateObj?.displayName}, please keep this field blank.
          </p>
        </div>
      )}

      {/* Format Validation Error Notice */}
      {!isFormatValid && !isStateMismatch && (
        <p className="text-xs text-red-600 mt-1 font-medium">Invalid 15-digit GSTIN format (e.g., 27AAAAA0000A1Z5)</p>
      )}
    </div>
  );
};

export const GstStateInput = ({ gstin, state, onChange, error, isDarkMode = false, disabled = false }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 font-sans">
      <GstinInput 
        gstin={gstin} 
        state={state} 
        onChange={onChange} 
        isDarkMode={isDarkMode} 
        disabled={disabled} 
      />
      <StateSelector 
        state={state} 
        onChange={(newState) => onChange({ gstin, state: newState })} 
        error={error} 
        isDarkMode={isDarkMode} 
        disabled={disabled} 
      />
    </div>
  );
};

export default GstStateInput;
