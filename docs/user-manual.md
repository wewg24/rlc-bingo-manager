# RLC Bingo Manager - User Manual

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Starting a New Occasion](#starting-a-new-occasion)
4. [Door Sales Management](#door-sales-management)
5. [Pull-Tab Operations](#pull-tab-operations)
6. [Bingo Games Tracking](#bingo-games-tracking)
7. [Cash Reconciliation](#cash-reconciliation)
8. [Reports and Analytics](#reports-and-analytics)
9. [Troubleshooting](#troubleshooting)
10. [Quick Reference](#quick-reference)

---

## Getting Started

### Accessing the System

1. **Web Application**
   - Open your web browser (Chrome, Firefox, Safari, or Edge)
   - Navigate to the Web App URL provided by your administrator
   - Bookmark this URL for easy access

2. **From Google Sheets**
   - Open the RLC Bingo spreadsheet
   - Click **🎰 Bingo Manager** in the menu bar
   - Select **📱 Open Web App**

### First Time Setup

When accessing the system for the first time:
1. You may need to authorize the application
2. Click **Review Permissions** when prompted
3. Select your Google account
4. Click **Allow** to grant necessary permissions

### User Roles

- **Administrator**: Full system access, can modify settings
- **Manager**: Can manage sessions, generate reports
- **Cashier**: Can record sales and games
- **Volunteer**: View-only access
- **Auditor**: Can view reports and audit trails

---

## Dashboard Overview

The dashboard provides a real-time overview of your bingo operations.

### Key Metrics Display

- **Today's Players**: Total attendance for current session
- **Gross Receipts**: Total money collected
- **Total Prizes**: All prizes awarded
- **Net Profit**: Gross receipts minus prizes

### Navigation Tabs

1. **Dashboard** - Main overview and quick actions
2. **New Occasion** - Start a new bingo session
3. **Door Sales** - Record bingo card sales
4. **Pull-Tabs** - Manage pull-tab games
5. **Bingo Games** - Track game winners
6. **Cash Close** - End-of-session reconciliation
7. **Reports** - Generate compliance reports

### Quick Actions

- **Start New Occasion** - Begin a new bingo session
- **Record Door Sales** - Jump to sales entry
- **Manage Pull-Tabs** - Access pull-tab management
- **Generate Form 104** - Create MGC compliance report

---

## Starting a New Occasion

### Step 1: Basic Information

1. Click **New Occasion** tab or **Start New Occasion** button
2. Enter required information:
   - **Date**: Select occasion date (defaults to today)
   - **Start Time**: When bingo begins (default 6:00 PM)
   - **Closet Worker**: Name of person managing supplies
   - **Lion in Charge (Pull-Tabs)**: Person responsible for pull-tabs
   - **Starting Cash**: Beginning cash drawer amount (typically $1,200)
   - **Number of Bingo Games**: Total games to be played (default 27)

### Step 2: Progressive Games Setup

Configure your progressive jackpot games:

#### Progressive Game 1
- **Jackpot Amount**: Current progressive jackpot value
- **Balls to Win**: Number of balls for jackpot (default 48)
- **Consolation Prize**: Amount if not won (default $100)

#### Progressive Game 2
- **Jackpot Amount**: Second progressive jackpot
- **Balls to Win**: Number of balls needed (default 52)
- **Consolation Prize**: Consolation amount (default $100)

### Step 3: Create Occasion

1. Review all entered information
2. Click **Create Occasion** button
3. System generates unique Session ID
4. Dashboard updates with new session

⚠️ **Important**: Once created, session information cannot be edited. Verify all information before creating.

---

## Door Sales Management

Door sales tracks all bingo card sales and miscellaneous items.

### Paper Sales Entry

#### Standard Packages

1. **9on20 1st Pack** ($15.00)
   - Enter beginning count (typically 150)
   - Enter ending count after sales
   - System calculates cards sold

2. **9on20 Additional** ($10.00)
   - Beginning and ending counts
   - Automatic calculation of total sales

3. **Early Birds** ($5.00)
   - Track 6on6 early bird cards
   - Enter start and end counts

4. **Special Games** ($1.00 each)
   - 3on Yellow Special
   - 3on Orange Special
   - 3on Blue Special

5. **Progressive Games**
   - 9on Progressive ($5.00)
   - 3on Progressive ($2.00)

### Special Games Extra Sheets

Track additional sheets for major prize games:

- **$250 Letter X** - Extra sheets at $1.00
- **$250 Number 7** - Extra sheets at $1.00
- **$500 Coverall** - Extra sheets at $2.00

### Birthday BOGO Promotional

**Important**: Track birthday promotional sales separately

1. Enter **Birthday BOGO Count** - Number of free packs given
2. Enter **Birthday BOGO Value** - Dollar value of promotions
3. These are recorded but not included in revenue

### Electronic Sales

**Machine Rentals**:
- **Standard Machines @ $40** - Enter quantity
- **Premium Machines @ $65** - Enter quantity

### Miscellaneous Sales

- **Daubers**: Quantity sold at $2.00 each
- **Glue Sticks**: Quantity sold at $1.00 each

### Saving Door Sales

1. Review **Sales Summary** section:
   - Total Paper Sales
   - Total Electronic Sales
   - Miscellaneous Sales
   - **Grand Total**

2. Click **Calculate** to verify totals
3. Click **Save Door Sales** to record
4. System confirms successful save

---

## Pull-Tab Operations

Pull-tab management includes game tracking and cash turn-in reporting.

### Recording a Pull-Tab Sale

#### Step 1: Personnel Information
- **Lion in Charge**: Person managing pull-tabs
- **Worker Name**: Person recording the sale

#### Step 2: Game Selection
1. Click **Select Game** dropdown
2. Choose from active games list
3. System auto-fills game details:
   - Top prize amount
   - Ideal profit percentage
   - Price per ticket

#### Step 3: Game Details
- **Serial Number**: Enter from game packaging
- **Beginning Count**: Starting ticket count
- **Ending Count**: Remaining tickets
- System calculates: **Tickets Sold**

#### Step 4: Financial Tracking
- **Prizes Paid Out**: Total prizes awarded
- **Cash Turned In**: Actual cash collected
- System calculates: **Expected vs. Actual Variance**

#### Step 5: Variance Analysis

If cash variance exists:
1. **Variance Amount** displays automatically
2. Enter **Variance Explanation** if difference > $50
3. Common explanations:
   - "Winner took tickets"
   - "Counting error corrected"
   - "Previous game adjustment"

#### Step 6: Save Transaction
1. Click **Calculate Variance** to verify
2. Click **Save Pull-Tab Sale**
3. System logs transaction with timestamp

### Managing Multiple Games

You can have multiple pull-tab games active simultaneously:
1. Complete one game entry
2. Click **Save Pull-Tab Sale**
3. Select next game
4. Repeat process

### Cash Turn-In Best Practices

✅ **DO**:
- Count cash immediately after game closes
- Have Lion in Charge verify count
- Document any discrepancies immediately
- Keep serial number stubs for audit

❌ **DON'T**:
- Mix cash from different games
- Wait until session end to count
- Accept IOUs or checks for pull-tabs
- Destroy game packaging before audit

---

## Bingo Games Tracking

Track all bingo games including regular, progressive, and special games.

### Game Categories

#### Progressive Games

**Progressive Game 1**
1. Enter **Winner Name** (if won)
2. Enter **Balls Called**
3. Select **Prize Awarded**:
   - Jackpot Won
   - Consolation Prize
   - No Winner
4. System auto-calculates amount
5. Click **Save Progressive 1**

**Progressive Game 2**
- Same process as Progressive 1
- Different ball count requirement

#### Special Games ($250/$500 Games)

**$250 Letter X**
1. Enter **Winner Name**
2. Enter **Balls Called** when won
3. Enter **Card Number** (optional)
4. Verify **Prize Paid** ($250)
5. Click **Save Letter X**

**$250 Number 7**
- Same process as Letter X
- Default prize: $250

**$500 Coverall**
- Enter winner information
- Enter balls called
- Default prize: $500
- This is typically the final game

#### Regular Games (1-27)

1. Click on **game number button** (1-27)
2. Modal window opens
3. Enter:
   - Winner Name
   - Card Number (optional)
   - Balls Called
   - Prize Amount (default $50)
4. Click **Save Winner**
5. Game button shows ✓ when complete

### Session Summary View

The **Session Summary** tab shows:
- Total Regular Game Prizes
- Total Progressive Prizes
- Total Special Game Prizes
- **Grand Total Bingo Prizes**

### Important Notes

⚠️ **Ball Count Limits**:
- Minimum: 1 ball
- Maximum: 75 balls
- Progressive jackpots typically require exact ball count

⚠️ **Prize Verification**:
- Always verify prize amounts before saving
- Check progressive jackpot amounts match posted values
- Confirm special game prizes are correct

---

## Cash Reconciliation

End-of-session reconciliation ensures all money is accounted for properly.

### Pre-Reconciliation Checklist

Before starting reconciliation:
- [ ] All door sales recorded
- [ ] All pull-tab games closed
- [ ] All bingo prizes recorded
- [ ] Physical cash counted
- [ ] Checks listed separately

### Step 1: Review Session Summary

The system displays:
- **Starting Cash**: Beginning drawer amount
- **Bingo Card Sales**: Total from door sales
- **Pull-Tab Gross**: Total pull-tab sales
- **Miscellaneous**: Daubers, glue sticks, etc.
- **Total Gross Receipts**: All income

### Step 2: Review Prizes Paid

- **Bingo Prizes Paid**: All bingo game prizes
- **Pull-Tab Prizes Paid**: All pull-tab prizes
- **Total Prizes Paid**: Combined total

### Step 3: Calculate Net Receipts

System automatically calculates:
```
Net Receipts = Total Gross Receipts - Total Prizes Paid
```

This is your **Expected Deposit Amount**

### Step 4: Enter Actual Deposit

1. Count all cash and checks
2. Enter **Actual Amount Deposited**
3. System calculates variance (offage)

### Step 5: Offage Analysis

The system provides three offage calculations:

#### Bingo Offage
- Variance attributed to bingo operations
- Calculated as percentage of bingo gross

#### Pull-Tab Offage  
- Variance from pull-tab operations
- Includes cash turn-in variances

#### Combined Offage
- Total session variance
- Status indicators:
  - **BALANCED**: Within $5
  - **OVER**: Excess cash
  - **SHORT**: Missing cash

### Step 6: Document Offage

If offage exceeds $100:
1. **Required**: Enter explanation
2. Common explanations:
   - "Miscounted door sales - corrected"
   - "Found additional cash in pull-tab box"
   - "Check from previous session included"
   - "Error in prize payout - see notes"

### Step 7: Deposit Information

Enter:
- **Depositor Name**: Person making bank deposit
- **Deposit Slip Number**: Bank deposit reference

### Step 8: Close Session

1. Review all information
2. Click **Reconcile & Close Session**
3. Confirm closure (cannot be undone)
4. System generates Form 104

### Post-Reconciliation

After closing:
- Session status changes to "CLOSED"
- Form 104 becomes available
- Audit trail is finalized
- Reports can be generated

---

## Reports and Analytics

### Missouri Gaming Commission Form 104

**Generating Form 104**:
1. Click **Reports** tab
2. Select **MGC Form 104**
3. Choose session date
4. Click **Load Session**
5. Review generated form
6. Click **Print Form 104** or **Save as PDF**

**Form 104 Includes**:
- Organization information
- Session date and times
- Player count
- Progressive game details
- Gross receipts breakdown
- Prizes awarded summary
- Net receipts calculation
- Actual deposit amount

### Quarterly Report

**For MGC Compliance**:
1. Select **Quarterly Report** tab
2. Choose Quarter (Q1-Q4) and Year
3. Click **Generate Report**
4. Review monthly breakdown
5. Export options:
   - Print Report
   - Export CSV
   - Submit to MGC

**Report Contains**:
- Total occasions per month
- Monthly player counts
- Gross receipts by month
- Prize distributions
- Net receipts tracking
- Deposit verification

### Offage Analysis

**Track Cash Variances**:
1. Select **Offage Analysis**
2. Set date range (From/To)
3. Click **Analyze**
4. Review:
   - Average Bingo Offage
   - Average Pull-Tab Offage
   - Combined Offage Trends
   - Percentage of Balanced Sessions

**Offage Details Table**:
- Date and Session ID
- Closet Worker responsible
- Individual offage amounts
- Status (Balanced/Over/Short)
- Explanations provided

### Statistics Dashboard

**Performance Metrics**:
1. Select **Statistics** tab
2. Choose time period:
   - Last Week
   - Last Month
   - Last Quarter
   - Last Year
   - Custom Range
3. Click **Generate Stats**

**Key Metrics**:
- Total Sessions
- Players Served
- Average Players/Session
- Total Gross Receipts
- Total Prizes Paid
- Net Profit
- Profit Margin %

**Top Performers**:
- Best Day (highest average profit)
- Most Players (single session)
- Highest Gross (single session)
- Highest Profit (single session)

**Game Statistics**:
- Progressive Jackpots Won
- Average Balls for Winner
- Total Birthday BOGOs
- Pull-Tab Profit Percentage

### Export Options

All reports can be exported:
- **Print**: Direct printing
- **PDF**: Save for records
- **CSV**: For spreadsheet analysis
- **Email**: Send to administrators

---

## Troubleshooting

### Common Issues and Solutions

#### Cannot Save Data
**Problem**: Clicking save doesn't work
**Solutions**:
1. Check internet connection
2. Refresh the page
3. Verify all required fields are filled
4. Check for error messages
5. Try different browser

#### Calculations Don't Match
**Problem**: Totals seem incorrect
**Solutions**:
1. Click **Calculate** button
2. Verify beginning/ending counts
3. Check price entries
4. Refresh page and re-enter
5. Contact support if persists

#### Session Won't Close
**Problem**: Cannot complete reconciliation
**Solutions**:
1. Ensure all games are recorded
2. Verify actual deposit entered
3. Add offage explanation if required
4. Check all pull-tabs closed
5. Review error messages

#### Form 104 Not Generating
**Problem**: Report won't create
**Solutions**:
1. Verify session is closed
2. Check all required data present
3. Try different date format
4. Refresh and retry
5. Generate from spreadsheet menu

#### Menu Not Visible in Spreadsheet
**Problem**: Bingo Manager menu missing
**Solutions**:
1. Refresh spreadsheet
2. Run `onOpen()` in Apps Script
3. Check permissions
4. Re-authorize application
5. Contact administrator

### Error Messages

#### "Session Already Exists"
- A session for this date is already created
- Close existing session first
- Or select different date

#### "Authorization Required"
- Click authorization link
- Sign in with Google account
- Grant requested permissions
- Retry operation

#### "Invalid Cash Variance"
- Cash difference exceeds limits
- Recount cash carefully
- Check for calculation errors
- Add detailed explanation

#### "Missing Required Fields"
- Check all marked fields (*)
- Enter valid data formats
- Dates: MM/DD/YYYY
- Money: 0.00 format
- Times: HH:MM format

### Data Recovery

If data appears lost:
1. **Check Audit Log**: All actions are logged
2. **Review Backups**: Daily backups at 2 AM
3. **Check Sheet History**: Google Sheets version history
4. **Contact Support**: Immediate assistance

### Emergency Contacts

**During Session Issues**:
- Primary Support: (573) 555-0100
- Emergency Line: (573) 555-0111
- Email: bingo@rollalions.org

**Technical Support Hours**:
- Monday-Friday: 9 AM - 5 PM
- Saturday (Bingo Days): 4 PM - 10 PM
- Sunday: Emergency only

---

## Quick Reference

### Keyboard Shortcuts

- **Ctrl+S** / **Cmd+S**: Save current form
- **Ctrl+P** / **Cmd+P**: Print report
- **Tab**: Move to next field
- **Shift+Tab**: Move to previous field
- **Enter**: Submit form (where applicable)

### Price Reference

#### Bingo Cards
- 9on20 First Pack: $15.00
- 9on20 Additional: $10.00
- 6on6 Early Birds: $5.00
- 3on Specials: $1.00 each
- 9on Progressive: $5.00
- 3on Progressive: $2.00

#### Special Games
- Letter X Extra: $1.00
- Number 7 Extra: $1.00
- Coverall Extra: $2.00

#### Electronic
- Standard Machine: $40.00
- Premium Machine: $65.00

#### Miscellaneous
- Daubers: $2.00
- Glue Sticks: $1.00

### Standard Prizes

#### Regular Games
- Standard Prize: $50.00
- Can be adjusted per game

#### Progressive Games
- Consolation: $100.00
- Jackpot: Variable (accumulates)

#### Special Games
- Letter X: $250.00
- Number 7: $250.00
- Coverall: $500.00

### Session Timeline

**5:30 PM** - Setup begins
- Open session
- Count starting cash
- Prepare supplies

**6:00 PM** - Door sales begin
- Record all sales
- Track Birthday BOGOs

**6:30 PM** - Early birds start
- Begin game tracking

**7:00 PM** - Regular session
- Track all games
- Manage pull-tabs

**9:30 PM** - Session ends
- Final game (Coverall)
- Begin counting

**10:00 PM** - Reconciliation
- Count all cash
- Complete reconciliation
- Generate Form 104

**10:30 PM** - Deposit preparation
- Prepare bank deposit
- Secure remaining supplies

### Compliance Requirements

**Missouri Gaming Commission**:
- Form 104 for each occasion
- Quarterly reports required
- Keep records 3 years minimum
- Report large winners (>$1,200)

**Financial Requirements**:
- Daily deposits required
- Separate bingo bank account
- No commingling of funds
- Detailed audit trail

**Record Keeping**:
- All game records
- Serial numbers for pull-tabs
- Winner information
- Financial reconciliations
- Offage explanations

### Best Practices

✅ **Always**:
- Count cash twice
- Get second verification
- Document everything
- Save frequently
- Keep serial numbers

❌ **Never**:
- Skip reconciliation steps
- Ignore offage > $100
- Delete records
- Share login credentials
- Mix personal funds

### Tips for Success

1. **Start Early**: Begin setup 30 minutes before
2. **Stay Organized**: Keep areas separate (bingo/pull-tabs)
3. **Communicate**: Clear handoffs between workers
4. **Document**: Write everything down
5. **Verify**: Double-check all counts
6. **Ask**: When in doubt, ask for help

---

## Appendices

### A. Glossary

- **Offage**: Difference between expected and actual cash
- **BOGO**: Buy One Get One (promotional)
- **Progressive**: Jackpot that increases until won
- **Consolation**: Prize when progressive not won at exact count
- **Serial Number**: Unique identifier for pull-tab games
- **Form 104**: Missouri Gaming Commission occasion report
- **Lion in Charge**: Member responsible for pull-tabs
- **Closet Worker**: Member managing supplies

### B. Regulatory Information

**Missouri Gaming Commission**
- Address: P.O. Box 1847, Jefferson City, MO 65102
- Phone: (573) 526-5370
- Toll-Free: 1-866-801-8643
- Website: mgc.dps.mo.gov

### C. System Information

**Technical Requirements**:
- Google Account
- Modern Browser
- Stable Internet
- JavaScript Enabled

**Supported Browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### D. Update History

- **v3.0.0** - Complete system redesign
- **v2.5.0** - Added offage tracking
- **v2.0.0** - Pull-tab integration
- **v1.0.0** - Initial release

---

*Last Updated: September 2025*  
*Version: 3.0.0*  
*© 2025 Rolla Lions Club - All Rights Reserved*
