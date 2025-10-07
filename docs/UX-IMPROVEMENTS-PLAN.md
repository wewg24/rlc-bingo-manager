# UX Improvements Plan - October 7, 2025

## 1. Loading Spinner Fix ✅
**Status:** COMPLETED - Added embedded styles with unique animation name to bypass CSS cache

## 2. Progressive Game Inputs - Move to Game Results Tab ✅
**Status:** COMPLETED - Added Actual Balls column, moved inputs to game row

**Changes Made:**
- Added "Actual Balls" column to Session Games table
- Progressive Diamond row now has inline Actual Balls input field
- Prize calculation logic implemented: if actualBalls <= ballsNeeded, prize = jackpot; else prize = consolation
- Removed Actual Balls Called, Prize Awarded, and Paid by Check from Occasion Info tab
- Updated saveGameResults() to save actualBalls field per game
- Added updateProgressivePrize() function for automatic prize calculation
- All regular games show "—" in Actual Balls column (not applicable)

## 3. Session Games - Move Edit Button ✅
**Status:** COMPLETED - Edit button now inside Game column on right side

**Changes Made:**
- Removed "Actions" column header from Session Games table
- Moved Edit button into Game column using flexbox layout
- Updated colspan values for loading/error messages

## 4. Door Sales - Align Column Widths ✅
**Status:** COMPLETED - Added CSS column width specifications

**Changes Made:**
- Added inline styles to align Item/Price/Quantity/Total columns across all three sections
- Electronic, Miscellaneous, and Paper sections now have consistent widths

## 5. Pull-Tab Table Improvements ✅
**Status:** COMPLETED - Updated headers and icons

**Changes Made:**
- Renamed "Actions" column to "Remove"
- Replaced × with trash can icon (🗑️) in addPullTabRow() function
- Changed "Paid by Check" header to checkmark icon (✓)
- Widened "Serial #" column to 12% for better visibility

## 6. Auto-Scroll on Tab Focus ✅
**Status:** COMPLETED - Added smooth scrolling for focused inputs

## 7. Submit Occasion Spinner ✅
**Status:** COMPLETED - Verified working with new embedded spinner styles
