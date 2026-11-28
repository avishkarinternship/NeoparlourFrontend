import React from 'react';
import { DIWALI_THEME_ENABLED } from './diwaliConfig';
import DiwaliFireworksCanvas from './DiwaliFireworksCanvas';

/**
 * DiwaliTheme
 * -----------
 * Primary container for the Diwali Festive Firecrackers theme.
 * - Confined strictly to the Hero Section.
 * - Slow straight-line ascending rockets from the bottom.
 * - Ambient night-sky flash effect when crackers detonate.
 * - 360° Spherical Starburst with glowing non-hollow center.
 * - Anti-aliased optical diamond stars at ray tips (zero pixelation).
 * - Exclusively Golden & Crimson Red palette.
 * - Floating widget/button removed as requested.
 *
 * HOW TO REVERT:
 * 1. Change `DIWALI_THEME_ENABLED = false` in `src/components/diwali/diwaliConfig.js`, OR
 * 2. Remove `<DiwaliTheme />` from `src/App.jsx`.
 */
const DiwaliTheme = () => {
  if (!DIWALI_THEME_ENABLED) {
    return null;
  }

  return <DiwaliFireworksCanvas enabled={true} />;
};

export default React.memo(DiwaliTheme);
