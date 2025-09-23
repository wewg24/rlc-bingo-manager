# RLC Bingo Manager System Overview

## System Architecture

### Google Sheets Infrastructure
```
RLC-Bingo-Data (Spreadsheet ID: 1Tj9s4vol2nELlz-znKz3XMjn5Lv8E_zqc7E2ngRSGIc)
├── Occasions (Main record sheet)
├── SessionGames (Game definitions by session)
├── PullTabLibrary (Complete game inventory)
├── PullTabUsage (Track serial numbers used)
├── FinancialSummary (Aggregated financials)
├── Metrics (Performance analytics)
└── Configuration (System settings)
```

### Drive Structure
```
RLC Bingo Manager/ (ID: 13y-jTy3lcFazALyI4DrmeaQx8kLkCY-a)
├── Photos/ (ID: 1g0lfGUqI_dCeqv41ZxLaTyZqDAXt5Iyv)
│   ├── 2025/ (ID: 1Vh01-jrJTx_BrOjtfaqdbFfZ8KT0ZI7_)
│   │   ├── Q1/ (ID: 1lyMJql351ozfgd70_ch7JtQFiygam4TI)
│   │   │   ├── 01/ (ID: 19cmHCwS0QTnz64QjkYY5oJZcHfr3uBGz)
│   │   │   ├── 02/ (ID: 1vA-V4poFNGf8txYSYL3viR7D9CESAkAO)
│   │   │   └── 03/ (ID: 14RZRx6S4ke4GzNZVSFYPXWqkSFAsW_Ci)
│   │   ├── Q2/ (ID: 1k2tL0O9oQ6N4iN4XDsiq9is9R0IQOLtx)
│   │   │   ├── 04/ (ID: 1Mg2WbPeqYv231xVMLU5TZSrPouoXGb77)
│   │   │   ├── 05/ (ID: 1z_laVWnRn2T_CUQfbzlefHqq2mskEaIT)
│   │   │   └── 06/ (ID: 1ueiPxftiEpovJaz2syHVOtJmQ-2Jqp6P)
│   │   ├── Q3/ (ID: 1mCnJOyowXskWPDOhzS--zCZlMi6z3iLE)
│   │   │   ├── 07/ (ID: 1xTCTf97uD6ygRNUqx57LvyAlcgepiOyJ)
│   │   │   ├── 08/ (ID: 1XzFkSsfhZ5BQdDbnDprbuPV4VOnTPQ09)
│   │   │   └── 09/ (ID: 19q0YawI0DMR6uFxxQUh1v0OKhqU31_cq)
│   │   └── Q4/ (ID: 1z-k6JLLR5Rzl-t4CX8-VbD6tMNpmyo4C)
│   │       ├── 10/ (ID: 1ecJU6tjjqqT7mOXLqp8CxpgF36jNqKZW)
│   │       ├── 11/ (ID: 1NEwnCnA4l_Bnf3ix9ukjpOXIrr2ZO1TK)
│   │       └── 12/ (ID: 1yCdzlSK8C2gpRSFkCjvQJOd3qQrC6TJ5)
├── Backups/ (ID: 1f_TDuTEvSEm7Fut7aXsX0H-GG6LJFWtg)
├── Reports/ (ID: 1KiT6GB8onDmXxwNYpi9npsBzxOvDvxz4)
└── System/ (ID: 1eSAAgyI-Z2bSBlSCNadeVEDtubdPexbk)
```

### Technical Configuration
- **API Key**: AIzaSyCPcWHEm0KLyp-8DVKfEm_gYn9pfyxBmmQ
- **Project**: RLC Bingo Backend
- **Container**: RLC Bingo Manager Database
- **Script ID**: 1W8URFctBaFd98FQpdzi7tI8h8OnUPi1rT-Et_SJRkKiMuVKra34pN5hU
- **Deployment ID**: AKfycbzQj-363T7fBf198d6e5uooia0fTLq1dNcdaVcjABZNz9EElL4cZhLXEz2DdfH0YzAYcA
- **Web App URL**: https://script.google.com/macros/s/AKfycbzQj-363T7fBf198d6e5uooia0fTLq1dNcdaVcjABZNz9EElL4cZhLXEz2DdfH0YzAYcA/exec
- **Library URL**: https://script.google.com/macros/library/d/1W8URFctBaFd98FQpdzi7tI8h8OnUPi1rT-Et_SJRkKiMuVKra34pN5hU/16
- **GitHub WebApp URL**: https://wewg24.github.io/rlc-bingo-manager

## Data Structure

### Main Occasion Record Schema
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
  },
  paperInventory: {
    startCounts: {},
    endCounts: {},
    freeSheets: {},
    soldSheets: {}
  },
  posSales: {
    // 10 categories of door sales
  },
  electronicRentals: {},
  sessionGames: [
    // 17 games with winners and payouts
  ],
  pullTabGames: [
    // Variable number with serial tracking
  ],
  moneyCount: {
    bingoDrawer: {},
    pullTabDrawer: {},
    totalDeposit: {},
    variance: {}
  }
}
```

### Occasion Configuration
| Session Type | Schedule | Games | Description |
|--------------|----------|-------|-------------|
| **5-1** | 1st/5th Monday | 17 games | Standard configuration |
| **6-2** | 2nd Monday | 17 games | Alternate prizes |
| **7-3** | 3rd Monday | 17 games | Varied patterns |
| **8-4** | 4th Monday | 17 games | Mixed configuration |

### Progressive Game Rules
- **Starting Seed**: $1,000
- **Weekly Increment**: $100 if not won
- **Balls to Win**: 48 (configurable)
- **Consolation Prize**: $200 (if won after 48 balls)

### Pull-Tab Library Structure
- **Total Games**: 152 pre-loaded games
- **Auto-populate**: Select from dropdown interface
- **Tracked Fields**: Name, Form Number, Ticket Count, Price, Ideal Profit, Image URL
- **Special Events**: Separate tracking category for tournaments/events

## Mobile-Responsive Design Architecture

### Design Requirements Implementation
1. **Entry Form Optimization**
   - Large touch targets (minimum 44px)
   - Section collapsing for vertical space management
   - Auto-save functionality on every field change
   - Progressive disclosure of form sections
   - Wizard-based 6-step workflow

2. **Navigation Structure**
   - Progress bar showing current step and completion status
   - Hamburger menu for reports and occasions view
   - Consistent navigation patterns across all views
   - Click-to-navigate between completed steps

3. **Admin Dashboard Layout**
   - Occasions list view for historical data
   - Reports generation interface
   - Dark/Light mode toggle
   - Touch-optimized control interfaces
   - Contextual action buttons

4. **Report Generation System**
   - PDF generation for occasion summaries
   - Email-friendly formatting templates
   - Native share button integration
   - Export capabilities for multiple formats
   - Real-time financial calculations and variance detection

## Admin Dashboard Architecture

### Access Control
- **Authentication**: No authentication required (internal use only)
- **Access Path**: /admin route accessible via hamburger menu
- **Permission Model**: Full access to all administrative functions

### Administrative Structure
```
/admin
├── Occasion Management
│   ├── View/Edit Past Occasions
│   │   ├── Search by date range
│   │   ├── Filter by session type
│   │   └── Bulk edit capabilities
│   ├── Bulk Import from Photos
│   │   ├── OCR integration for form recognition
│   │   ├── Batch processing workflows
│   │   └── Validation and error handling
│   └── Reconciliation Tools
│       ├── Variance analysis
│       ├── Cross-reference validation
│       └── Audit trail generation
├── Pull-Tab Management
│   ├── Game Library Editor
│   │   ├── Add/edit/delete games
│   │   ├── Image upload management
│   │   └── Pricing and profit calculations
│   ├── Serial Number Tracking
│   │   ├── Usage history logging
│   │   ├── Inventory status monitoring
│   │   └── Reorder point alerts
│   └── Inventory Reports
│       ├── Stock level analysis
│       ├── Performance metrics
│       └── Profitability analysis
├── Reports
│   ├── Financial Summaries
│   │   ├── Monthly aggregation
│   │   ├── Yearly comparisons
│   │   └── Trend analysis
│   ├── Tax Reports
│   │   ├── MGC Form 104 generation
│   │   ├── IRS compliance reporting
│   │   └── Audit documentation
│   ├── Performance Metrics
│   │   ├── Attendance tracking
│   │   ├── Revenue per occasion
│   │   └── Prize-to-sales ratios
│   └── Custom Date Ranges
│       ├── Flexible reporting periods
│       ├── Comparative analysis
│       └── Export functionality
└── System
    ├── Configuration
    │   ├── Session type management
    │   ├── Progressive game settings
    │   └── Email notification setup
    ├── Data Export
    │   ├── Complete database backup
    │   ├── Selective data export
    │   └── Format conversion options
    └── Backup/Restore
        ├── Automated backup scheduling
        ├── Point-in-time recovery
        └── Data integrity verification
```

## Offline/Online Sync Strategy

### Local Storage Architecture
```javascript
// Complete form data structure in browser localStorage
{
  draftOccasion: {
    // Current occasion being entered
    occasionInfo: {},
    paperSales: {},
    gameResults: {},
    pullTabs: {},
    moneyCount: {},
    completed: false
  },
  syncQueue: [
    // Pending submissions when offline
    {
      id: 'queue_[timestamp]',
      data: {},
      retryCount: 0,
      timestamp: '2025-09-22T10:00:00Z'
    }
  ],
  cachedLibrary: {
    pullTabGames: [],
    occasionConfigs: {},
    lastUpdated: '2025-09-22T09:00:00Z'
  }
}
```

### Queue System Implementation
1. **Offline Detection**: Browser navigator.onLine API monitoring
2. **Queue Management**: Automatic queuing of submissions when offline
3. **Retry Logic**: Exponential backoff for failed sync attempts
4. **Conflict Resolution**: Timestamp-based with manual override options
5. **Progress Tracking**: Visual indicators for sync progress

### Auto-Sync Process
1. **Connection Restoration**: Event listener for online status change
2. **Background Sync**: Service worker handles sync when connection returns
3. **Data Validation**: Server-side validation before accepting queued data
4. **Confirmation System**: Local data retained until server confirmation
5. **Error Handling**: Failed syncs moved to manual review queue

### Visual Status Indicators
- **🟢 Online**: Connected to internet, real-time sync enabled
- **🔴 Offline**: Working locally, data queued for later sync
- **🟡 Syncing**: Data upload in progress
- **⚠️ Sync Error**: Manual intervention required

## Performance Specifications

### Loading Performance
- **Initial Load**: <2 seconds on 3G connection
- **Wizard Navigation**: Instant (client-side routing)
- **Calculations**: Real-time (<10ms response)
- **Offline Ready**: Full functionality without connection

### Storage Requirements
- **Typical Occasion**: ~5MB local storage
- **Complete Cache**: ~15MB for full offline capability
- **Photo Storage**: Handled via Google Drive API

### Compatibility Requirements
- **Minimum Browser**: Chrome 80+, Safari 13+, Edge 80+
- **Mobile Support**: iOS 13+, Android 8+
- **Tablet Optimization**: iPad and Android tablets 10" and larger
- **Desktop Support**: Windows 10+, macOS 10.14+

## Integration Points

### Google Services Integration
1. **Google Sheets API**: Primary data storage and retrieval
2. **Google Drive API**: Photo upload and document management
3. **Google Apps Script**: Server-side processing and calculations
4. **Gmail API**: Automated report distribution

### External Dependencies
- **Progressive Web App**: Service worker for offline capability
- **Local Storage**: Browser-based data persistence
- **Responsive Framework**: CSS Grid and Flexbox layouts
- **Touch Events**: Native touch gesture support

## Security and Compliance

### Data Security
- **No Authentication**: Internal use system (club members only)
- **HTTPS Only**: All communications encrypted in transit
- **Local Encryption**: Sensitive data encrypted in browser storage
- **API Key Security**: Server-side key management

### Missouri Gaming Commission Compliance
- **Required Data Fields**: All MGC Form 104 fields captured
- **Audit Trail**: Complete transaction logging
- **Report Generation**: Automated compliance reporting
- **Data Retention**: Historical data maintained per MGC requirements

### Backup and Recovery
- **Automated Backups**: Daily Google Sheets snapshots
- **Photo Backups**: Redundant Google Drive storage
- **Local Recovery**: Browser storage backup capabilities
- **Manual Export**: Complete data export functionality
