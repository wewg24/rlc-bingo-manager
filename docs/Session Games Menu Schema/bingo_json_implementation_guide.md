# Rolla Lions Club Bingo JSON Refactoring Implementation Guide

## Overview
This document provides complete implementation guidance for refactoring the Rolla Lions Club bingo session JSON structure to accurately reflect the printed session game menus with the requested schema changes.

## Field-Level Documentation and Mapping

### Source Data Mapping Table

| Original Source | Transformation Rule | Destination Field |
|----------------|--------------------|--------------------|
| Session Games Menu.txt - Game Name | Direct copy with exact spelling | `games[].name` |
| Session Games Menu.txt - Sheet Color | Direct copy, use "N/A" for Early Bird/Pull-Tab/Progressive | `games[].color` |
| Session Games Menu.txt - Prize | Convert to integer for fixed amounts, keep as string for variable | `games[].payout` |
| Session Games Menu.txt - Category | Direct copy with proper casing | `games[].category` |
| Session Games Menu.txt - Game Number | Direct copy as integer | `games[].gameNumber` |
| PDF Menu Files | Cross-validation and verification source | All fields |

### Schema Changes Implementation

#### Removed Fields
- **`pattern`**: Replaced with `color` field to reflect actual sheet color coding system
- **`description`**: Replaced with `name` field containing exact game names from printed menus

#### New/Modified Fields  
- **`name`** (String): Exact game name from printed menu
  - Data Type: String
  - Validation: Must match printed menu exactly
  - Example: "Hard Way Bingo No Free Space", "3 on Top Row & 3 on Bottom Row"

- **`color`** (String): Sheet color designation from menu
  - Data Type: String  
  - Validation: Must be valid color name or "N/A"
  - Allowed Values: Blue, Orange, Green, Yellow, Pink, Gray, Olive, Brown, Red, Purple, Black, Aqua, N/A

#### Enhanced Fields
- **`timing`** (String): Game session timing classification
  - Values: "Pre-Regular Session", "Pre-Intermission", "Intermission", "Post-Intermission", "Mid-Session", "Post-Progressive", "Final Game"

## Component Configuration Documentation

### JSON Structure Configuration

#### Root Level Configuration
```json
{
  "metadata": {
    "organization": "Rolla Lions Club",
    "venue": "Rolla Lions Club Bingo Hall", 
    "schedule": "Mondays at 6:45 PM",
    "eventGamesStart": "5:00 PM",
    "closetOpens": "5:45 PM", 
    "bingoStarts": "6:45 PM",
    "minimumAge": 16,
    "lastUpdated": "101622",
    "prizePayoutDisclaimer": "We reserve the right to reduce the prize payout consistent with the number of patrons playing each evening"
  }
}
```

**Rationale**: Centralized metadata provides operational context and regulatory information required for bingo operations.

#### Session Type Configuration
```json
"sessionTypes": {
  "[session-id]": {
    "sessionName": "[descriptive name]",
    "description": "[full description from menu]",
    "totalGames": 17,
    "totalPrizeValue": 2650,
    "games": [...]
  }
}
```

**Configuration Parameters**:
- `session-id`: Format "X-Y" where X is sequence number, Y is week identifier
- `totalGames`: Always 17 (3 Early Bird + 5 Pre-Intermission + 1 Intermission + 4 Post-Intermission + 1 Progressive + 3 Post-Progressive + 1 Final)
- `totalPrizeValue`: Sum of all fixed prize amounts (excludes progressive and variable prizes)

#### Game Object Configuration
```json
{
  "gameNumber": [1-17],
  "category": "[Early Bird|Regular|Pull-Tab|Progressive]",
  "color": "[Color Name|N/A]", 
  "name": "[Exact Menu Name]",
  "payout": [Amount|"Varies"|"Progressive Prize Details"],
  "order": [1-17],
  "timing": "[Session Phase]",
  "notes": "[Optional additional information]"
}
```

## Implementation Guidance

### Step 1: Data Validation and Cross-Reference
1. **Primary Source**: Use Session Games Menu.txt as authoritative source
2. **Validation Source**: Cross-reference with PDF menu files for accuracy
3. **Verification Process**:
   - Compare game names character-for-character
   - Verify prize amounts match exactly
   - Confirm color coding consistency
   - Validate game numbering sequence

### Step 2: Schema Migration Process

#### 2.1 Field Replacement Implementation
```javascript
// Transform from old schema to new schema
function transformGameObject(oldGame, menuData) {
  return {
    gameNumber: oldGame.gameNumber,
    category: oldGame.category,
    color: menuData.sheetColor, // NEW FIELD - replaces 'pattern'
    name: menuData.gameName,    // NEW FIELD - replaces 'description'
    payout: oldGame.payout,
    order: oldGame.order,
    timing: determineGameTiming(oldGame.gameNumber)
  };
}
```

#### 2.2 Data Mapping Implementation
```javascript
// Session-specific game mapping
const sessionGameMappings = {
  "5-1": [
    { gameNumber: 1, name: "Hard Way Bingo No Free Space", color: "N/A", payout: 100 },
    { gameNumber: 2, name: "Diagonal & Outside Corners", color: "N/A", payout: 100 },
    // ... continue for all 17 games
  ]
};
```

### Step 3: Validation Rules Implementation

#### 3.1 Data Integrity Checks
- **Game Number Validation**: Must be sequential 1-17 for each session
- **Color Validation**: Must be valid color name or "N/A"
- **Payout Validation**: Must be positive integer or approved variable text
- **Category Validation**: Must be one of four approved categories

#### 3.2 Cross-Session Consistency Checks  
- Early Bird games (1-3): Identical across all sessions
- Progressive game (13): Identical structure across all sessions
- Final game (17): Always "Coverall" with $500 payout

### Step 4: Testing and Verification

#### Test Cases for Implementation
1. **Positive Test Cases**:
   - Verify each session has exactly 17 games
   - Confirm all game names match printed menus
   - Validate color assignments match menu specifications
   - Test payout calculations for fixed-amount games

2. **Negative Test Cases**:
   - Invalid color assignments should be rejected
   - Duplicate game numbers within session should be rejected
   - Mismatched game names should be flagged
   - Invalid payout formats should be rejected

## Error Handling Documentation

### Common Error Scenarios

| Error Scenario | Resolution Steps | Escalation Procedure |
|---------------|------------------|---------------------|
| Game name mismatch between sources | 1. Compare all source documents<br>2. Use most recent printed menu<br>3. Document discrepancy | Contact Lions Club for clarification |
| Color code inconsistency | 1. Verify against physical game sheets<br>2. Check PDF clarity<br>3. Use most legible source | Update from authoritative printed menu |
| Prize amount discrepancy | 1. Cross-reference all sources<br>2. Calculate totals<br>3. Verify mathematical consistency | Financial validation required |
| Progressive game details unclear | 1. Reference hall signage<br>2. Check recent game records<br>3. Use documented increment rules | Contact game coordinator |

### Troubleshooting Decision Tree

```
Data Discrepancy Found
├── Is it in printed menu?
│   ├── Yes → Use printed menu value
│   └── No → Check PDF source
│       ├── Clear in PDF → Use PDF value
│       └── Unclear → Flag for manual review
└── Multiple sources conflict
    ├── Financial data → Use most conservative value
    ├── Game names → Use most recent printed version  
    └── Operational details → Contact Lions Club
```

## Integration Documentation

### Power Platform Integration Touchpoints
- **Power Apps**: Game selection and display functionality
- **Power Automate**: Session management and prize calculations
- **Dataverse**: Historical game data storage with bt_ prefix convention
- **Power BI**: Prize payout reporting and analytics

### Data Flow Requirements
1. **Session Selection**: JSON provides available sessions for current month
2. **Game Display**: Real-time game information during bingo session  
3. **Prize Management**: Accurate payout calculations and tracking
4. **Progressive Tracking**: Weekly jackpot progression management

## Security and Compliance Considerations

### Data Security Implementation
- **Access Control**: Limit JSON modification to authorized personnel
- **Change Tracking**: Log all modifications with timestamp and user
- **Backup Requirements**: Daily backup of current session configurations
- **Version Control**: Maintain historical versions for audit purposes

### Regulatory Compliance  
- **Age Verification**: Minimum age 16 enforced in metadata
- **Prize Payout**: Disclaimer included for patron count adjustments
- **Game Integrity**: Ball validation rules documented and enforced

## Performance Optimization

### JSON Structure Optimization
- **Flat Game Array**: Direct access to games without nested categories
- **Indexed Access**: Games accessible by gameNumber for O(1) lookup
- **Minimal Redundancy**: Shared metadata separated from game-specific data

### Caching Strategy
- **Session Data**: Cache current month's session data
- **Progressive Updates**: Real-time updates for jackpot amounts
- **Static Data**: Cache game rules and metadata for session duration

## Completeness Verification Checklist

### Pre-Implementation Verification
- [ ] All four session types (5-1, 6-2, 7-3, 8-4) included
- [ ] Each session contains exactly 17 games
- [ ] All game names match printed menus exactly
- [ ] Color assignments verified against source documents
- [ ] Prize amounts cross-validated between sources
- [ ] Progressive game details consistent across sessions

### Post-Implementation Verification  
- [ ] JSON validates against schema requirements
- [ ] All test cases pass successfully
- [ ] Cross-references validated between sessions
- [ ] Integration touchpoints identified and documented
- [ ] Error handling procedures tested
- [ ] Performance benchmarks met

### Ongoing Maintenance Requirements
- [ ] Monthly validation against current printed menus
- [ ] Progressive jackpot updates reflected accurately  
- [ ] Session rotation schedule maintained
- [ ] Historical data preserved for audit purposes

## Code Implementation Examples

### JSON Validation Function
```javascript
function validateBingoSession(sessionData) {
  const requiredFields = ['gameNumber', 'category', 'color', 'name', 'payout', 'order'];
  const validCategories = ['Early Bird', 'Regular', 'Pull-Tab', 'Progressive'];
  const validColors = ['Blue', 'Orange', 'Green', 'Yellow', 'Pink', 'Gray', 'Olive', 'Brown', 'Red', 'Purple', 'Black', 'Aqua', 'N/A'];
  
  return sessionData.games.every(game => {
    return requiredFields.every(field => game.hasOwnProperty(field)) &&
           validCategories.includes(game.category) &&
           validColors.includes(game.color) &&
           game.gameNumber >= 1 && game.gameNumber <= 17;
  });
}
```

### Session Selection Function
```javascript
function getCurrentSession() {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const mondaysInMonth = getMondaysInMonth(today);
  
  if (dayOfMonth <= mondaysInMonth[0]) return "5-1"; // 1st Monday
  if (dayOfMonth <= mondaysInMonth[1]) return "6-2"; // 2nd Monday  
  if (dayOfMonth <= mondaysInMonth[2]) return "7-3"; // 3rd Monday
  if (dayOfMonth <= mondaysInMonth[3]) return "8-4"; // 4th Monday
  return "5-1"; // 5th Monday (if exists) uses same as 1st
}
```

This implementation guide provides complete documentation for the JSON refactoring project, ensuring maintainable, accurate representation of the Rolla Lions Club bingo sessions with full traceability to source documents and comprehensive error handling procedures.