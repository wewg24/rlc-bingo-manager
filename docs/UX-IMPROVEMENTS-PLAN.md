# UX Improvements Plan - October 7, 2025

## 1. Loading Spinner Fix ✅
**Status:** COMPLETED - Added inline styles to force proper rendering

## 2. Progressive Game Inputs - Move to Game Results Tab
**Current:** Progressive inputs are on Occasion Info tab
- Actual Balls Called
- Prize Awarded
- Paid by Check checkbox

**New Design:** Add these as inline inputs in the Progressive Diamond game row
- Keep existing Winners/Per Winner columns
- Add Actual Balls input
- Prize calculation logic: if actualBalls <= ballsNeeded, prize = jackpot; else prize = consolation
- Add Paid by Check checkbox
- Remove from Occasion Info tab

**Impact:**
- Simplifies data entry (single location)
- Reduces duplication
- Makes progressive game consistent with other games

## 3. Session Games - Move Edit Button
**Current:** Separate "Actions" column with Edit button
**New:** Move Edit button/icon inside the "Game" column on the right side

## 4. Door Sales - Align Column Widths
**Current:** Miscellaneous section has different column sizing than Electronic/Paper
**New:** Make all three sections have consistent column widths

## 5. Pull-Tab Table Improvements
**Changes:**
- Rename "Actions" column to "Remove"
- Replace × with trash can icon (🗑️ or FontAwesome icon)
- Change "Paid by Check" header to checkmark icon (✓)
- Widen "Serial #" column so full entry is visible

## 6. Auto-Scroll on Tab Focus
**Issue:** When user tabs to off-screen inputs, screen doesn't scroll
**Solution:** Add event listeners to auto-scroll focused elements into view
- Use `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`
- Apply to all input/select/textarea elements

## 7. Submit Occasion Spinner
**Current:** Already has showLoading() call
**Verify:** Ensure it's working with new inline spinner styles
