import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import beautyProfileService from '../services/beautyProfileService';

export const DEFAULT_BEAUTY_PROFILE = {
  hairType: 'STRAIGHT',
  scalpType: 'NORMAL',
  hairConcerns: [],
  skinType: 'NORMAL',
  skinConcerns: [],
  allergiesAndNotes: ''
};

export const useCustomerBeautyProfile = (initialProfile = null) => {
  const [profile, setProfile] = useState(() => ({
    ...DEFAULT_BEAUTY_PROFILE,
    ...(initialProfile || {})
  }));
  const [loading, setLoading] = useState(false);

  const setHairType = (hairType) => setProfile(prev => ({ ...prev, hairType }));
  const setScalpType = (scalpType) => setProfile(prev => ({ ...prev, scalpType }));
  const setSkinType = (skinType) => setProfile(prev => ({ ...prev, skinType }));
  const setAllergiesAndNotes = (allergiesAndNotes) => setProfile(prev => ({ ...prev, allergiesAndNotes }));

  const toggleHairConcern = (concern) => {
    setProfile(prev => {
      const current = prev.hairConcerns || [];
      const updated = current.includes(concern)
        ? current.filter(c => c !== concern)
        : [...current, concern];
      return { ...prev, hairConcerns: updated };
    });
  };

  const toggleSkinConcern = (concern) => {
    setProfile(prev => {
      const current = prev.skinConcerns || [];
      const updated = current.includes(concern)
        ? current.filter(c => c !== concern)
        : [...current, concern];
      return { ...prev, skinConcerns: updated };
    });
  };

  const fetchBeautyProfile = useCallback(async (customerId) => {
    if (!customerId) return;
    try {
      setLoading(true);
      const data = await beautyProfileService.getCustomerBeautyProfile(customerId);
      if (data) {
        setProfile(prev => ({
          ...prev,
          hairType: data.hairType || prev.hairType,
          scalpType: data.scalpType || prev.scalpType,
          hairConcerns: Array.isArray(data.hairConcerns) ? data.hairConcerns : prev.hairConcerns,
          skinType: data.skinType || prev.skinType,
          skinConcerns: Array.isArray(data.skinConcerns) ? data.skinConcerns : prev.skinConcerns,
          allergiesAndNotes: data.allergiesAndNotes || data.notes || prev.allergiesAndNotes
        }));
      }
    } catch (err) {
      console.warn("Could not fetch customer beauty profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetProfile = () => setProfile(DEFAULT_BEAUTY_PROFILE);

  return {
    profile,
    setProfile,
    loading,
    setHairType,
    setScalpType,
    setSkinType,
    setAllergiesAndNotes,
    toggleHairConcern,
    toggleSkinConcern,
    fetchBeautyProfile,
    resetProfile
  };
};

export default useCustomerBeautyProfile;
