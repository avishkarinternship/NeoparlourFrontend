# 🪔 Diwali Firecrackers Background Theme

A lightweight, hardware-accelerated Diwali Firecrackers background animation built with `fireworks-js`.

## ✨ Features
- **Realistic Diwali Crackers**: Upward-launching rocket trails and sparkling explosive bursts.
- **Non-Intrusive (`pointer-events: none`)**: 100% of underlying application buttons, forms, links, and cards remain fully clickable and interactive.
- **Floating Diya Widget**: A festive collapsible widget allowing users to toggle firecrackers ON/OFF, adjust intensity (Subtle / Festive / Dhamaka), switch color palettes (Rainbow / Golden / Royal), or burst crackers on demand.
- **Interactive Click to Burst**: Clicking empty areas of the page fires a celebratory rocket.
- **Battery & CPU Friendly**: Automatically pauses fireworks animation whenever the browser tab is switched or minimized.

---

## 🔄 How to Revert or Disable (100% Revertible)

Choose any of the simple options below:

### Option 1: 1-Second Soft Switch (No code deletion needed)
Open `src/components/diwali/diwaliConfig.js` and change:
```javascript
export const DIWALI_THEME_ENABLED = false;
```
That instantly turns off all fireworks and floating widgets without touching any other files.

### Option 2: Remove from `src/App.jsx`
In `src/App.jsx`, simply remove:
1. `import DiwaliTheme from './components/diwali';`
2. `<DiwaliTheme />`

### Option 3: Complete Removal
1. Remove `<DiwaliTheme />` and its import from `src/App.jsx`.
2. Delete the `src/components/diwali/` folder.
3. Run `npm uninstall fireworks-js`.
