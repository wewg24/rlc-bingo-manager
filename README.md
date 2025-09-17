# RLC Bingo Manager

[![Version](https://img.shields.io/badge/version-11.0.2-blue.svg)](https://github.com/wewg24/rlc-bingo-manager/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![MGC Compliant](https://img.shields.io/badge/MGC-Compliant-red.svg)](https://www.mgc.dps.mo.gov/)

A modern Progressive Web Application (PWA) for managing bingo occasions with comprehensive offline capabilities. Designed specifically for the Rolla Lions Club in compliance with Missouri Gaming Commission regulations.

## 🎯 Features

### Core Functionality
- **🧙 Wizard-Based Workflow**: 6-step guided data entry process
- **🌓 Dark/Light Mode**: Automatic theme switching with user preference
- **📱 Mobile-First Design**: Touch-optimized with 44px minimum targets
- **☁️ Cloud Sync**: Automatic bidirectional synchronization with Google Sheets
- **📸 Photo Documentation**: Integrated camera support for winner documentation
- **💰 Financial Tracking**: Complete money counting and deposit reconciliation
- **📊 MGC Compliance**: Built-in Missouri Gaming Commission reporting
- **🎮 Session Management**: Predefined game configurations for each Monday
- **🎟️ Pull-Tab Tracking**: Complete inventory and sales management with library

### Technical Features
- **Offline-First Architecture**: Full functionality without internet connection
- **IndexedDB Storage**: Local data persistence with automatic sync queue
- **Service Worker**: Background sync and intelligent cache management
- **Responsive Design**: Seamless experience across all device sizes
- **Real-time Calculations**: Automatic progressive prize and BOGO calculations
- **Cache Busting**: Version-controlled assets prevent stale cache issues
- **Data Validation**: Client and server-side validation with visual feedback
- **Audit Trail**: Complete change tracking for compliance

## 🚀 Quick Start

### Prerequisites
- Google Account with Apps Script access
- GitHub repository (for hosting)
- Modern web browser (Chrome/Edge recommended)

### Installation

1. **Google Apps Script Backend Setup**
   ```javascript
   // 1. Open Google Apps Script project
   // 2. Replace Main.gs with provided v11.0.2 code
   // 3. Keep existing PullTabLibrary.gs
   // 4. Run setup() function once
   // 5. Deploy as Web App
   // 6. Copy deployment URL
   ```

2. **Configure Frontend**
   ```javascript
   // Edit js/config.js
   const CONFIG = {
     API_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
     VERSION: '11.0.2'
   };
   ```

3. **Deploy to GitHub Pages**
   ```bash
   git add .
   git commit -m "Deploy v11.0.2"
   git push origin main
   # Enable GitHub Pages in repository settings
   ```

4. **Access Application**
   ```
   https://wewg24.github.io/rlc-bingo-manager/
   ```

## 🏗️ Architecture

### Wizard Workflow
```
Step 1: Session Info → Step 2: Paper Sales → Step 3: Game Results
    ↓                      ↓                      ↓
Date, Type, Lion      Inventory, POS        17 Session Games
Progressive Setup     Electronic Sales       Prize Calculations
    ↓                      ↓                      ↓
Step 4: Pull-Tabs → Step 5: Money Count → Step 6: Review & Submit
    ↓                      ↓                      ↓
Game Entry, S/N      Drawer Reconcile       Financial Summary
Special Events       Deposit Calculation     Performance Metrics
```

### System Components
```
Frontend (PWA) - Wizard Interface
├── Session Information (Progressive tracking)
├── Paper Bingo Sales (BOGO calculations)
├── Session Games (Auto-populated by type)
├── Pull-Tab Management (Library integration)
├── Money Count (Denomination breakdown)
└── Review & Submit (Complete validation)
          ↓
   Service Worker
   (Cache v11.0.2)
          ↓
    Google Apps Script Backend
    ├── Occasions Sheet
    ├── SessionGames Sheet
    ├── PullTabLibrary (152 games)
    ├── PullTabUsage Sheet
    ├── PaperBingo Sheet
    ├── POSDoorSales Sheet
    ├── Electronic Sheet
    ├── MoneyCount Sheet
    └── FinancialSummary Sheet
```

## 📁 Project Structure

```
rlc-bingo-manager/
├── 📄 index.html                 # Wizard UI with 6 steps
├── 📄 manifest.json              # PWA manifest v11
├── 📄 sw.js                      # Service worker with cache busting
├── 📄 version.json               # Version control file
│
├── 📁 css/                       # Stylesheets
│   ├── style.css                 # Core styles
│   ├── wizard.css                # Wizard-specific styles
│   └── dark-mode.css             # Dark theme (enhanced v11.0.2)
│
├── 📁 js/                        # JavaScript modules
│   ├── app.js                    # Main BingoApp class
│   ├── wizard.js                 # Step navigation logic
│   ├── calculations.js           # Financial calculations
│   ├── config.js                 # Configuration (v11.0.2)
│   ├── offline.js                # IndexedDB manager
│   └── sync.js                   # Sync queue manager
│
├── 📁 assets/                    # Static assets
│   └── icons/                    # PWA icons
│
├── 📄 README.md                  # This file (v11.0.2)
└── 📄 USER-MANUAL.md             # User documentation (v11.0.2)
```

## 🔧 Configuration

### Session Types (Auto-detected by date)
| Session | Schedule | Games | Description |
|---------|----------|-------|-------------|
| **5-1** | 1st/5th Monday | 17 games | Standard configuration |
| **6-2** | 2nd Monday | 17 games | Alternate prizes |
| **7-3** | 3rd Monday | 17 games | Varied patterns |
| **8-4** | 4th Monday | 17 games | Mixed configuration |

### Progressive Game Rules
- **Starting Seed**: $1,000
- **Weekly Increment**: $100 if not won
- **Balls to Win**: 48 (configurable)
- **Consolation Prize**: $200 (if won after 48 balls)

### Pull-Tab Library
- **Total Games**: 152 pre-loaded
- **Auto-populate**: Select from dropdown
- **Fields**: Name, Form, Count, Price, Profit, URL
- **Special Events**: Separate tracking category

## 🎮 Key Features Explained

### Wizard-Based Data Entry
The application guides users through a logical workflow that matches the actual session process. Each step validates before allowing progression, ensuring data completeness. The wizard remembers your position if you need to go back, and all data is auto-saved locally.

### Birthday BOGO System
When you enter the number of birthdays in Step 1, the system automatically:
- Allocates 2 free Early Bird sheets per birthday
- Allocates 1 free 6-Face sheet per birthday
- Updates the POS door sales to reflect the BOGO count
- Adjusts inventory calculations accordingly

### Progressive Prize Calculation
The progressive game dynamically calculates prizes based on:
- Current jackpot amount (carried from previous session)
- Balls required to win (default: 48)
- Actual balls called when won
- Automatic determination of jackpot vs. consolation prize

### Money Count Reconciliation
The system provides separate counting areas for:
- **Bingo Drawer**: All denominations plus checks
- **Pull-Tab Drawer**: Cash only (no checks)
- **Automatic Calculations**: Running totals and deposit summary
- **Variance Detection**: Highlights discrepancies for review

## 🛡️ Security & Compliance

### Cache Management
Version 11.0.2 implements intelligent cache busting:
```javascript
// All assets versioned
<link rel="stylesheet" href="css/style.css?v=11.0.2">
<script src="js/app.js?v=11.0.2"></script>
```

### Data Integrity
- Local draft saving every field change
- Sync queue for offline changes
- Conflict resolution for multi-device edits
- Complete audit trail in Google Sheets

### MGC Compliance
- Session-based game configurations
- Prize limit enforcement
- Complete financial tracking
- Report generation capabilities

## 🚨 Troubleshooting

### Cache Issues (Fixed in v11.0.2)
The system now includes automatic cache busting. Users only need to refresh once to get updates.

### Common Solutions
| Issue | Solution |
|-------|----------|
| Old version showing | CTRL+F5 once, then normal |
| Sync not working | Check online status indicator |
| Data not saving | Verify browser storage permissions |
| Progressive not calculating | Enter all required fields |

## 📊 Database Schema

### Main Occasion Record
```javascript
{
  occasionId: 'OCC_[timestamp]',
  date: '2025-09-17',
  sessionType: '5-1',
  lionInCharge: 'John Smith',
  totalPeople: 150,
  birthdays: 3,
  progressive: {
    jackpot: 1500,
    ballsNeeded: 48,
    actualBalls: 50,
    actualPrize: 200,
    checkPayment: false
  }
}
```

### Complete Data Structure
The system tracks:
- Paper inventory (start/end/free/sold)
- POS door sales (10 categories)
- Electronic machine rentals
- 17 session games with winners
- Pull-tab games with serial tracking
- Complete money denomination counts
- Financial summary with reconciliation

## 🔄 Version History

### v11.0.2 (Current)
- Fixed dark mode readability issues
- Implemented cache busting strategy
- Added version checking system
- Enhanced service worker update logic

### v11.0.1
- Implemented complete wizard UI
- Added all missing JavaScript functions
- Created comprehensive offline support

### v11.0.0
- Complete backend rewrite
- Pull-tab library integration
- Multi-sheet data structure

## 📈 Performance Metrics

- **Initial Load**: <2s on 3G
- **Wizard Navigation**: Instant (all client-side)
- **Calculations**: Real-time (<10ms)
- **Offline Ready**: Full functionality
- **Sync Time**: <3s for complete session
- **Storage Usage**: ~5MB typical session

## 🤝 Contributing

### Development Setup
```bash
# Clone repository
git clone https://github.com/wewg24/rlc-bingo-manager.git
cd rlc-bingo-manager

# Update version in:
# - config.js (VERSION)
# - index.html (asset versions)
# - sw.js (CACHE_VERSION)
# - version.json

# Test locally
python -m http.server 8000
# Navigate to localhost:8000

# Deploy
git add .
git commit -m "Version 11.0.2 updates"
git push origin main
```

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Rolla Lions Club** - 100 years of community service
- **Missouri Gaming Commission** - Regulatory guidance
- **Contributors** - Volunteer developers and testers

## 📞 Support

### Resources
- [User Manual](USER-MANUAL.md) - Complete usage guide
- [Issue Tracker](https://github.com/wewg24/rlc-bingo-manager/issues)
- Technical Support: wewg24@github.com

### Quick Links
- **Production URL**: https://wewg24.github.io/rlc-bingo-manager/
- **Backend Script**: [Google Apps Script Project](https://script.google.com/home/projects/1W8URFctBaFd98FQpdzi7tI8h8OnUPi1rT-Et_SJRkKiMuVKra34pN5hU)
- **Data Spreadsheet**: [RLC Bingo Manager Database](https://docs.google.com/spreadsheets/d/1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc)

---

**Version**: 11.0.2  
**Status**: Production Ready  
**Last Updated**: September 2025  
**Next Session Type**: Auto-detected based on date  

© 2025 Rolla Lions Club. Built with ❤️ for community service.
