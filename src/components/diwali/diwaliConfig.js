/**
 * Diwali Firecrackers Theme Configuration
 * =======================================
 * Customized for Realistic, Slow Straight-Line Golden & Red Diwali Crackers with Ambient Flash.
 * Confined strictly to the Hero Section.
 *
 * TO REVERT / DISABLE:
 * Simply set `DIWALI_THEME_ENABLED = false` below, or remove <DiwaliTheme /> from App.jsx.
 */

export const DIWALI_THEME_ENABLED = true;

export const DIWALI_CONFIG = {
  // Confine firecrackers strictly to the hero section
  heroOnly: true,

  // Hero section CSS selector
  heroSelector: '#hero-section, [data-hero="true"], section.hero-section',

  // Floating widget completely removed from screen as requested
  showFloatingWidget: false,

  // Clicking empty area in hero section launches a straight-line cracker
  clickToBurst: true,

  // Enable ambient illumination flash when a cracker bursts
  enableBurstFlash: true,

  // Canvas Z-Index within hero section
  zIndex: 22
};
