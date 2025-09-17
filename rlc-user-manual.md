# RLC Bingo Manager - User Manual
*Version 11.0.2 - Wizard-Based PWA System*

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [The Wizard Workflow](#the-wizard-workflow)
4. [Step-by-Step Instructions](#step-by-step-instructions)
5. [Offline Operations](#offline-operations)
6. [Reports and Compliance](#reports-and-compliance)
7. [Troubleshooting](#troubleshooting)
8. [Quick Reference Guide](#quick-reference-guide)

---

## 1. Introduction

### Purpose
The RLC Bingo Manager is a modern Progressive Web Application designed specifically for the Rolla Lions Club to manage Monday night bingo sessions. This wizard-based system guides you through each step of recording a bingo occasion, ensuring complete and accurate data collection for Missouri Gaming Commission compliance.

### What's New in Version 11.0.2
- **Wizard Interface**: 6-step guided workflow that matches your actual session process
- **Dark/Light Mode**: Easy on the eyes with automatic theme switching
- **Smart Caching**: Never see outdated versions again with intelligent cache management
- **Enhanced Calculations**: Automatic BOGO processing and progressive prize calculations
- **Improved Offline**: Complete functionality without internet connection

### Key Features
✅ **Step-by-Step Guidance**: Never miss important data with our wizard workflow  
✅ **Auto-Save Everything**: Every field change is saved locally  
✅ **Real-Time Calculations**: See totals update as you type  
✅ **Touch-Optimized**: Works perfectly on tablets and phones  
✅ **Complete Offline Mode**: Full functionality without internet  
✅ **Automatic Sync**: Data uploads when connection returns  
✅ **Dark Mode**: Reduce eye strain during evening sessions  

---

## 2. Getting Started

### Accessing the Application

#### First Time Setup
1. Open your web browser (Chrome or Edge recommended)
2. Navigate to: `https://wewg24.github.io/rlc-bingo-manager/`
3. Bookmark the page for quick access
4. The application will load and cache itself for offline use

#### Installing as an App (Recommended)

**On a Tablet (iPad/Android):**
1. Open the website in Chrome or Safari
2. Tap the share button
3. Select "Add to Home Screen"
4. Name it "RLC Bingo"
5. An app icon appears on your home screen

**On a Computer:**
1. Look for the install icon (⊕) in the address bar
2. Click "Install"
3. The app opens in its own window

### Understanding the Interface

#### Top Header
The header shows three important elements:
- **Theme Toggle** (🌙/☀️): Switch between dark and light modes
- **Menu Button** (☰): Access additional features and reports
- **Connection Status**: 
  - 🟢 Online: Connected to internet
  - 🔴 Offline: Working locally (will sync later)

#### Progress Bar
The wizard progress bar shows your current position:
- **Blue circle**: Current step
- **Green checkmark**: Completed step
- **Gray circle**: Upcoming step

You can click on any completed step to go back and review or edit.

#### Navigation Buttons
- **Previous**: Go back one step (disabled on first step)
- **Next**: Advance to next step (changes to "Complete" on final step)

### Session Detection
The system automatically determines your session type based on the date:
- Entering a Monday date auto-selects the correct session (5-1, 6-2, 7-3, or 8-4)
- Session type determines which 17 games are loaded
- You can override if needed for special circumstances

---

## 3. The Wizard Workflow

The wizard guides you through six logical steps that match your actual bingo session workflow:

```
1. Session Info → 2. Paper Sales → 3. Game Results
      ↓                ↓                ↓
   Basic Info      Inventory        Prize Tracking
   Progressive     POS Sales        17 Games
      ↓                ↓                ↓
4. Pull-Tabs → 5. Money Count → 6. Review & Submit
      ↓                ↓                ↓
   Game Entry     Drawer Count    Final Summary
   Serial #s      Deposit Calc    Submit Data
```

### Step Validation
Each step validates your entries before allowing you to proceed. This ensures:
- Required fields are completed
- Calculations make sense
- No critical data is missed

You can always go back to previous steps to make corrections.

---

## 4. Step-by-Step Instructions

### Step 1: Session Information

This first step captures the basic occasion details and progressive game setup.

#### Basic Information Fields

**Date**: Select the date of your bingo session. The system will:
- Auto-detect if it's a Monday
- Determine the session type (1st, 2nd, 3rd, or 4th Monday)
- Load the appropriate game configuration

**Session Type**: Automatically selected based on date:
- **5-1**: 1st and 5th Mondays (when applicable)
- **6-2**: 2nd Monday of the month
- **7-3**: 3rd Monday of the month
- **8-4**: 4th Monday of the month

**Lion in Charge**: Enter the name of the Lion member running the closet. This is the person responsible for the session's operations.

**Total People**: Enter the total attendance count. This includes all players but excludes workers.

**Birthdays (BOGOs)**: Enter the number of players celebrating birthdays. The system automatically calculates:
- 2 free Early Bird sheets per birthday
- 1 free 6-Face sheet per birthday
- Updates inventory calculations in Step 2

#### Progressive Game Section

The progressive game is a special jackpot that grows each week until won.

**Jackpot Offered**: Enter the current progressive amount. This carries over from the previous week plus any increments.

**Balls to Win**: Enter the number of balls required to win the full jackpot (typically 48).

**Consolation Prize**: The amount paid if won after the required balls (default: $200).

**Actual Balls Called**: Enter only if the progressive was won. The system will:
- Calculate if full jackpot or consolation is paid
- Update the prize amount automatically
- Show the calculated prize in the "Prize Awarded" field

**Paid by Check**: Check this box if the progressive winner was paid by check rather than cash.

### Step 2: Paper Sales

This step tracks your paper bingo inventory and point-of-sale transactions.

#### Paper Bingo Inventory

For each type of paper, enter:

**Start Count**: Number of sheets at the beginning of the session  
**Free Count**: Automatically calculated for Early Birds and 6-Face based on birthdays  
**End Count**: Number of sheets remaining after the session  
**Sold**: Automatically calculated as (Start - End - Free)  

Paper types tracked:
- Early Birds (includes free birthday sheets)
- 6 Face (includes free birthday sheets)
- 9 Face Solid Border
- 9 Face Stripe Border
- Progressive 3 Face ($1)
- Progressive 18 Face ($5)

#### POS Door Sales

This table shows items sold at the door with automatic total calculations:

For each item type, enter the **Quantity** sold. The system calculates the total based on preset prices:
- 6 Face: $10.00
- 9 Face Solid: $15.00
- 9 Face Stripe: $10.00
- Birthday Pack: $0.00 (BOGO, quantity auto-filled)
- Progressive 18 Face: $5.00
- Progressive 3 Face: $1.00
- Letter X Extra: $1.00
- Number 7 Extra: $1.00
- Coverall Extra: $1.00
- Early Bird Double: $5.00

The **Total Paper Sales** updates automatically as you enter quantities.

#### Electronic Bingo

Enter the number of electronic machines rented:
- **Small Machines** (27 regular/18 progressive games): $40 each
- **Large Machines** (45 regular/36 progressive games): $65 each

### Step 3: Game Results

This step displays all 17 games for your session type. The games are pre-loaded based on the session you selected in Step 1.

For each game, you'll see:
- **Game Number** (1-17)
- **Color** (card color for that game)
- **Game Name** (the pattern being played)
- **Prize Amount** (standard prize for that game)

#### Recording Winners

For each game played:
1. Enter the **number of winners** (default is 1)
2. If multiple winners, the system calculates the split automatically
3. Adjust the **Prize per Winner** if needed
4. The **Total** column shows the total payout for that game
5. Check the **Check** box if any winner was paid by check

#### Special Games

**Game 13 - Progressive**: This automatically links to the progressive prize calculated in Step 1. The prize amount updates based on whether the jackpot was won and at how many balls.

**Game 9 - Event Game**: This may vary by session. Enter the appropriate prize amount.

The **Total Bingo Prizes** at the bottom shows your total payout for all games.

### Step 4: Pull-Tabs

Pull-tabs are instant-win games sold throughout the session. This step tracks each game opened.

#### Lion in Charge of Pull-Tabs
Enter the name of the Lion member who managed pull-tabs for this session.

#### Adding Pull-Tab Games

Click **"Add Game"** for each regular pull-tab game opened:

1. **Select Game** from the dropdown (152 games in library)
2. **Enter Serial Number** from the game flare
3. **Price per Ticket** auto-fills from library
4. **Enter Tickets Sold** (or starting/ending counts)
5. System calculates **Sales** automatically
6. **Enter Ideal Profit** from the flare
7. **Enter Prizes Paid** (actual amount paid out)
8. System calculates **Net Profit**

#### Special Event Games

Click **"Add Special Event"** for any special event games (these are tracked separately):
- These appear with a yellow background
- Enter the same information as regular games
- Mark the **SE** (Special Event) checkbox

#### Check Payments
Check the **Check** box for any prizes paid by check.

The totals section shows:
- **Regular Games**: Total sales, ideal profit, prizes, and net
- **Special Events**: Separate totals for special event games
- **Grand Totals**: Combined figures

### Step 5: Money Count

This step reconciles all cash and checks from the session.

#### Bingo Drawer Count

Count and enter the quantity of each denomination:
- $100 bills
- $50 bills
- $20 bills
- $10 bills
- $5 bills
- $2 bills (if any)
- $1 bills
- Coins (total value)
- Checks (total value)

The **Bingo Total** calculates automatically.

#### Pull-Tab Drawer Count

Count pull-tab cash (typically no checks):
- Enter quantities for each denomination
- The **Pull-Tab Total** calculates automatically

#### Deposit Summary

The system automatically shows:
- **Currency Total**: All bills from both drawers
- **Coins Total**: Combined coin amount
- **Checks Total**: All checks received
- **Total Deposit**: Everything combined
- **Less Startup Cash**: Subtracts $1,000 startup
- **Net Deposit**: Final deposit amount

### Step 6: Review & Submit

This final step shows a complete summary for review before submission.

#### Financial Summary

Review all calculated totals:
- **Sales Breakdown**: Bingo, Pull-Tab, and Special Event sales
- **Gross Sales**: Total of all sales
- **Prize Breakdown**: Amounts paid for each category
- **Total Prizes**: All prizes paid out
- **Deposit Information**: Cash deposit and calculations
- **Profit Analysis**: Actual vs. Ideal profit
- **Over/Short**: Variance (highlighted if significant)

#### Performance Metrics

Key performance indicators:
- **Total Players**: Attendance for the session
- **Gross Sales**: Total revenue generated
- **Net Profit**: After all prizes paid
- **Per Player**: Average profit per attendee

#### Action Buttons

- **Submit Occasion**: Saves all data to the cloud (or queue if offline)
- **Save Draft**: Saves current progress locally
- **Print Report**: Generates a printable version
- **Export Data**: Downloads data as JSON file

---

## 5. Offline Operations

### How Offline Mode Works

The application is designed to function completely without internet:

1. **Automatic Detection**: The status indicator shows when you're offline
2. **Full Functionality**: All features work exactly the same offline
3. **Local Storage**: Data saves to your device automatically
4. **Sync Queue**: Changes are queued for upload when reconnected
5. **Visual Feedback**: Red offline indicator in header
6. **Auto-Sync**: Data uploads automatically when connection returns

### Working Offline

You can complete an entire bingo session offline:
- Enter all data normally through the wizard
- Calculations work exactly the same
- Save draft or submit occasion
- Data is stored securely on your device
- When internet returns, everything syncs automatically

### Sync Process

When connection is restored:
1. The status indicator turns green
2. Queued data begins uploading
3. You'll see a sync progress indicator
4. Once complete, data is safely in the cloud
5. Local backup is retained until confirmed

---

## 6. Reports and Compliance

### Missouri Gaming Commission Requirements

The system helps maintain MGC compliance by:
- Tracking all required data fields
- Enforcing session configurations
- Calculating prizes accurately
- Maintaining complete audit trails
- Generating required reports

### Available Reports

Access reports through the menu (☰):

**MGC Form 104**: Official occasion report for state filing
- Generated from completed occasion data
- Includes all required fields
- PDF format for printing/filing

**Session Summary**: Internal report showing:
- Complete financial reconciliation
- Game-by-game analysis
- Pull-tab performance
- Variance explanations

**Monthly Reports**: Aggregate data for board meetings
- Total attendance trends
- Revenue analysis
- Profit margins
- Progressive status

### Data Export

You can export session data for:
- Backup purposes
- External analysis
- Historical records
- Audit requirements

---

## 7. Troubleshooting

### Common Issues and Solutions

#### Display Issues

**Problem**: Text is hard to read  
**Solution**: Toggle between dark and light mode using the moon/sun icon

**Problem**: Old version keeps appearing  
**Solution**: Press CTRL+F5 once to clear cache (fixed in v11.0.2)

#### Data Entry Issues

**Problem**: Can't proceed to next step  
**Solution**: Check for required fields marked with red borders

**Problem**: Calculations seem wrong  
**Solution**: Verify all source numbers are entered correctly

**Problem**: Progressive prize not calculating  
**Solution**: Enter all progressive fields including balls to win

#### Sync Issues

**Problem**: Data not syncing  
**Solution**: Check connection status, wait for green indicator

**Problem**: "Sync failed" message  
**Solution**: Click retry, check for app updates

### Getting Help

If you encounter issues:
1. Check the connection status indicator
2. Try refreshing the page
3. Verify all required fields are completed
4. Contact technical support if problems persist

---

## 8. Quick Reference Guide

### Session Start Checklist
- [ ] Navigate to the application URL
- [ ] Check theme preference (dark/light)
- [ ] Note connection status
- [ ] Click through wizard steps

### Wizard Steps Quick Reference

**Step 1 - Session Info**
- Date → Session auto-selects
- Enter Lion in Charge and attendance
- Record birthdays for BOGOs
- Set up progressive game

**Step 2 - Paper Sales**
- Enter starting/ending inventory
- Record POS door sales
- Count electronic rentals

**Step 3 - Games**
- Enter winner counts
- Verify prize amounts
- Mark check payments

**Step 4 - Pull-Tabs**
- Add each game opened
- Enter serial numbers
- Record prizes paid
- Separate special events

**Step 5 - Money**
- Count bingo drawer
- Count pull-tab drawer
- Verify deposit total

**Step 6 - Review**
- Check all totals
- Review over/short
- Submit occasion

### Keyboard Shortcuts
- **Tab**: Next field
- **Shift+Tab**: Previous field
- **Enter**: Submit form/next step
- **Numbers**: Direct entry in number fields

### Important Numbers
- **Startup Cash**: $1,000 (Bingo) + $550 (Pull-tabs)
- **Progressive Seed**: $1,000 after jackpot won
- **Progressive Increment**: $100 per week if not won
- **Consolation Prize**: $200 (if won after 48 balls)
- **Birthday BOGOs**: 2 Early Birds + 1 Six Face per birthday

### Session Types by Monday
- **1st Monday**: Session 5-1
- **2nd Monday**: Session 6-2
- **3rd Monday**: Session 7-3
- **4th Monday**: Session 8-4
- **5th Monday** (when applicable): Session 5-1

---

## Document Information

**Version**: 11.0.2  
**System Version**: RLC Bingo Manager v11.0.2  
**Last Updated**: September 2025  
**Support**: wewg24@github.com  

© 2025 Rolla Lions Club. All rights reserved.

This manual describes the wizard-based interface implemented in version 11.0.2, featuring step-by-step data entry, automatic calculations, complete offline support, and enhanced dark mode visibility.
