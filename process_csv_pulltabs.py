import csv
import json
import re

def clean_currency(value):
    """Clean currency string and convert to float"""
    if not value or value.strip() == '':
        return 0
    # Remove $ and commas, convert to float
    cleaned = re.sub(r'[\$,]', '', str(value).strip())
    try:
        return float(cleaned)
    except ValueError:
        return 0

def clean_number(value):
    """Clean number string and convert to int"""
    if not value or value.strip() == '':
        return 0
    # Remove commas and spaces
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

# Read CSV file
csv_file = r"C:\Users\bill.wiggins\OneDrive - Phelps County Bank\Lion's Club\Bingo\Project\rlc-bingo-manager\docs\legacy-forms\RLC Bingo Event Pull Tab Games Base Library.csv"

games = []
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)

    for row in reader:
        # Clean and process each field
        game_name = clean_string(row.get('Game', ''))
        form = clean_string(row.get('Form', '')) or None
        count = clean_number(row.get(' Count ', 0))  # Note the spaces in CSV header
        price_str = clean_string(row.get('Price', '$1'))
        price = clean_currency(price_str)
        if price == 0:  # Default to $1 if parsing fails
            price = 1
        ideal_profit = clean_currency(row.get('IdealProfit', 0))
        url = clean_string(row.get('URL', '')) or None

        if not game_name:  # Skip empty rows
            continue

        # Calculate additional fields
        revenue = count * price
        profit_margin = (ideal_profit / revenue * 100) if revenue > 0 else 0
        cost_basis = ((revenue - ideal_profit) / count) if count > 0 else 0

        # Create identifier
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

print(f"Processed {len(games)} games from CSV")

# Create comprehensive structure
comprehensive = {
    "metadata": {
        "lastUpdated": "2024-09-24T18:00:00.000Z",
        "totalGames": len(games),
        "source": "RLC Bingo Event Pull Tab Games Base Library.csv",
        "description": "Complete curated pull-tab games library with informational URLs"
    },
    "categories": {
        "byPrice": {
            "$1": [],
            "$2": [],
            "$5": []
        },
        "byProfit": {
            "low": {"range": "0-100", "games": []},
            "medium": {"range": "101-300", "games": []},
            "high": {"range": "301-500", "games": []},
            "veryHigh": {"range": "500+", "games": []}
        },
        "withUrls": [],
        "withoutUrls": []
    },
    "games": games,
    "adminFeatures": {
        "allowCustomGames": True,
        "allowPriceModification": True,
        "allowProfitAdjustment": True,
        "requireUrlValidation": False,
        "supportsBulkImport": True,
        "supportsExport": True,
        "auditTrail": True
    }
}

# Categorize games
for game in games:
    identifier = game["identifier"]
    price = game["price"]
    profit = game["idealProfit"]

    # Categorize by price
    price_key = f"${price}"
    if price_key in comprehensive["categories"]["byPrice"]:
        comprehensive["categories"]["byPrice"][price_key].append(identifier)

    # Categorize by profit
    if profit <= 100:
        comprehensive["categories"]["byProfit"]["low"]["games"].append(identifier)
    elif profit <= 300:
        comprehensive["categories"]["byProfit"]["medium"]["games"].append(identifier)
    elif profit <= 500:
        comprehensive["categories"]["byProfit"]["high"]["games"].append(identifier)
    else:
        comprehensive["categories"]["byProfit"]["veryHigh"]["games"].append(identifier)

    # Categorize by URL availability
    if game["url"]:
        comprehensive["categories"]["withUrls"].append(identifier)
    else:
        comprehensive["categories"]["withoutUrls"].append(identifier)

# Save comprehensive structure
with open('complete-pulltabs-library.json', 'w') as f:
    json.dump(comprehensive, f, indent=2, default=str)

# Print summary statistics
print(f"Total games: {len(comprehensive['games'])}")
print(f"Games with URLs: {len(comprehensive['categories']['withUrls'])}")
print(f"Games without URLs: {len(comprehensive['categories']['withoutUrls'])}")
print(f"$1 games: {len(comprehensive['categories']['byPrice']['$1'])}")
print(f"$2 games: {len(comprehensive['categories']['byPrice']['$2'])}")
print(f"$5 games: {len(comprehensive['categories']['byPrice']['$5'])}")
print("\nFirst 5 games:")
for i, game in enumerate(games[:5]):
    print(f"{i+1}. {game['name']} ({game['form']}) - {game['count']} @ ${game['price']} = ${game['idealProfit']} profit")