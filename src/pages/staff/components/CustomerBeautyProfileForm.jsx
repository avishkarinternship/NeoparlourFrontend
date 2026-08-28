import React from 'react';
import { Sparkles, Scissors, Smile, AlertCircle } from 'lucide-react';

const HAIR_TYPES = [
  { id: 'STRAIGHT', label: 'Straight' },
  { id: 'WAVY', label: 'Wavy' },
  { id: 'CURLY', label: 'Curly' },
  { id: 'COILY', label: 'Coily' }
];

const SCALP_TYPES = [
  { id: 'DRY', label: 'Dry' },
  { id: 'NORMAL', label: 'Normal' },
  { id: 'OILY', label: 'Oily' },
  { id: 'SENSITIVE', label: 'Sensitive' }
];

const HAIR_CONCERNS = [
  { id: 'DANDRUFF', label: 'Dandruff' },
  { id: 'HAIR_FALL', label: 'Hair Fall' },
  { id: 'FRIZZ', label: 'Frizz' },
  { id: 'SPLIT_ENDS', label: 'Split Ends' },
  { id: 'DAMAGE', label: 'Damage' }
];

const SKIN_TYPES = [
  { id: 'DRY', label: 'Dry' },
  { id: 'NORMAL', label: 'Normal' },
  { id: 'OILY', label: 'Oily' },
  { id: 'COMBINATION', label: 'Combination' },
  { id: 'SENSITIVE', label: 'Sensitive' }
];

const SKIN_CONCERNS = [
  { id: 'ACNE', label: 'Acne / Breakouts' },
  { id: 'PIGMENTATION', label: 'Pigmentation' },
  { id: 'TANNING', label: 'Sun Tanning' }
];

const CustomerBeautyProfileForm = ({ profile, onChange, isDarkMode = false }) => {
  const {
    hairType = 'STRAIGHT',
    scalpType = 'NORMAL',
    hairConcerns = [],
    skinType = 'NORMAL',
    skinConcerns = [],
    allergiesAndNotes = ''
  } = profile || {};

  const handleHairTypeChange = (val) => onChange && onChange({ ...profile, hairType: val });
  const handleScalpTypeChange = (val) => onChange && onChange({ ...profile, scalpType: val });
  const handleSkinTypeChange = (val) => onChange && onChange({ ...profile, skinType: val });
  const handleAllergiesChange = (val) => onChange && onChange({ ...profile, allergiesAndNotes: val });

  const toggleHairConcern = (id) => {
    if (!onChange) return;
    const current = hairConcerns || [];
    const updated = current.includes(id) ? current.filter(c => c !== id) : [...current, id];
    onChange({ ...profile, hairConcerns: updated });
  };

  const toggleSkinConcern = (id) => {
    if (!onChange) return;
    const current = skinConcerns || [];
    const updated = current.includes(id) ? current.filter(c => c !== id) : [...current, id];
    onChange({ ...profile, skinConcerns: updated });
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50/70 border-slate-200'
    }`}>
      
      <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-zinc-800">
        <Sparkles className="w-4 h-4 text-[#FF2A14]" />
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Customer Beauty & Consultation Profile
        </h4>
      </div>

      {/* 💇 Hair Profile Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300">
          <Scissors className="w-3.5 h-3.5 text-[#FF2A14]" />
          <span>Hair & Scalp Assessment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Hair Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400">Hair Type</label>
            <div className="grid grid-cols-4 gap-1">
              {HAIR_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleHairTypeChange(t.id)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition cursor-pointer ${
                    hairType === t.id
                      ? 'bg-[#FF2A14] text-white shadow-2xs'
                      : isDarkMode
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scalp Type */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400">Scalp Type</label>
            <div className="grid grid-cols-4 gap-1">
              {SCALP_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleScalpTypeChange(t.id)}
                  className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition cursor-pointer ${
                    scalpType === t.id
                      ? 'bg-[#FF2A14] text-white shadow-2xs'
                      : isDarkMode
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hair Concerns Pills */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400">Hair Concerns (Multi-select)</label>
          <div className="flex flex-wrap gap-1.5">
            {HAIR_CONCERNS.map(c => {
              const isSelected = (hairConcerns || []).includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleHairConcern(c.id)}
                  className={`py-1 px-2.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-red-100 dark:bg-red-950/60 text-[#FF2A14] border border-red-300 dark:border-red-800'
                      : isDarkMode
                        ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}{c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🧴 Skin Profile Section */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-zinc-300">
          <Smile className="w-3.5 h-3.5 text-[#FF2A14]" />
          <span>Skin Assessment</span>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400">Skin Type</label>
          <div className="grid grid-cols-5 gap-1">
            {SKIN_TYPES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSkinTypeChange(t.id)}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition cursor-pointer ${
                  skinType === t.id
                    ? 'bg-[#FF2A14] text-white shadow-2xs'
                    : isDarkMode
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skin Concerns Pills */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400">Skin Concerns (Multi-select)</label>
          <div className="flex flex-wrap gap-1.5">
            {SKIN_CONCERNS.map(c => {
              const isSelected = (skinConcerns || []).includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleSkinConcern(c.id)}
                  className={`py-1 px-2.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-red-100 dark:bg-red-950/60 text-[#FF2A14] border border-red-300 dark:border-red-800'
                      : isDarkMode
                        ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}{c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ⚠️ Allergies & Consultation Notes */}
      <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-zinc-800">
        <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-amber-500" />
          Product Allergies & Special Notes
        </label>
        <textarea
          rows={2}
          value={allergiesAndNotes}
          onChange={(e) => handleAllergiesChange(e.target.value)}
          placeholder="e.g. Sensitive to ammonia or specific hair dye brands."
          className={`w-full p-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
            isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}
        />
      </div>

    </div>
  );
};

export default CustomerBeautyProfileForm;
