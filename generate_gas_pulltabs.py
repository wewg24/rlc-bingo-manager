import csv
import json
import re

def clean_currency(value):
    """Clean currency string and convert to float"""
    if not value or value.strip() == '':
        return 0
    cleaned = re.sub(r'[\$,]', '', str(value).strip())
    try:
        return float(cleaned)
    except ValueError:
        return 0

def clean_number(value):
    """Clean number string and convert to int"""
    if not value or value.strip() == '':
        return 0
    cleaned = re.sub(r'[,\s]', '', str(value).strip())
    try:
        return int(cleaned)
    except ValueError:
        return 0

def clean_string(value):
    """Clean string value"""
    if not value:
        return ""
    return str(value).strip()

# Read CSV file and generate Google Apps Script function
csv_file = r"C:\Users\bill.wiggins\OneDrive - Phelps County Bank\Lion's Club\Bingo\Project\rlc-bingo-manager\docs\legacy-forms\RLC Bingo Event Pull Tab Games Base Library.csv"

games = []
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)

    for row in reader:
        game_name = clean_string(row.get('Game', ''))
        form = clean_string(row.get('Form', '')) or None
        count = clean_number(row.get(' Count ', 0))
        price_str = clean_string(row.get('Price', '$1'))
        price = clean_currency(price_str)
        if price == 0:
            price = 1
        ideal_profit = clean_currency(row.get('IdealProfit', 0))
        url = clean_string(row.get('URL', '')) or None

        if not game_name:
            continue

        revenue = count * price
        profit_margin = (ideal_profit / revenue * 100) if revenue > 0 else 0
        cost_basis = ((revenue - ideal_profit) / count) if count > 0 else 0

        form_id = form if form else "None"
        identifier = f"{game_name}_{form_id}"

        game = {
            "name": game_name,
            "form": form,
            "count": count,
            "price": int(price),
            "idealProfit": int(ideal_profit),
            "url": url,
            "identifier": identifier,
            "profitMargin": round(profit_margin, 1),
            "costBasis": round(cost_basis, 3),
            "hasInformationalFlyer": bool(url)
        }

        games.append(game)

# Generate the Google Apps Script function
gas_function = '''function getDefaultPullTabsLibrary() {
  return {
    metadata: {
      lastUpdated: new Date().toISOString(),
      totalGames: 152,
      source: "RLC Bingo Event Pull Tab Games Base Library.csv",
      description: "Complete curated pull-tab games library with informational URLs"
    },
    categories: {
      byPrice: {
        "$1": [],
        "$2": [],
        "$5": []
      },
      byProfit: {
        low: {range: "0-100", games: []},
        medium: {range: "101-300", games: []},
        high: {range: "301-500", games: []},
        veryHigh: {range: "500+", games: []}
      },
      withUrls: [],
      withoutUrls: []
    },
    games: ['''

# Add all games to the function
for i, game in enumerate(games):
    comma = "," if i < len(games) - 1 else ""
    url_str = f'"{game["url"]}"' if game["url"] else "null"
    form_str = f'"{game["form"]}"' if game["form"] else "null"

    gas_function += f'''
      {{name: "{game['name']}", form: {form_str}, count: {game['count']}, price: {game['price']}, idealProfit: {game['idealProfit']}, url: {url_str}, identifier: "{game['identifier']}", profitMargin: {game['profitMargin']}, costBasis: {game['costBasis']}, hasInformationalFlyer: {str(game['hasInformationalFlyer']).lower()}}}{comma}'''

gas_function += '''
    ],
    adminFeatures: {
      allowCustomGames: true,
      allowPriceModification: true,
      allowProfitAdjustment: true,
      requireUrlValidation: false,
      supportsBulkImport: true,
      supportsExport: true,
      auditTrail: true
    }
  };
}'''

# Save the function
with open('gas_pulltabs_function.js', 'w') as f:
    f.write(gas_function)

print(f"Generated Google Apps Script function with {len(games)} games")
print("Saved to gas_pulltabs_function.js")

# Show first few games for verification
print("\nFirst 5 games:")
for i, game in enumerate(games[:5]):
    print(f"{i+1}. {game['name']} ({game['form']}) - {game['count']} @ ${game['price']} = ${game['idealProfit']} profit - URL: {bool(game['url'])}")