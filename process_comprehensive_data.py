import json

# Load the extracted pulltabs data
with open('pulltabs_data.json', 'r') as f:
    raw_data = json.load(f)

# Create comprehensive structure
comprehensive = {
    "metadata": {
        "lastUpdated": "2024-09-24T18:00:00.000Z",
        "totalGames": len(raw_data),
        "source": "RLC Bingo Event Pull Tab Games Base Library.xlsx",
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
    "games": [],
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

# Process each game
for game_data in raw_data:
    if not game_data.get('Game'):  # Skip empty rows
        continue

    # Calculate additional fields
    count = game_data.get('Count', 0)
    price = game_data.get('Price', 1)
    profit = game_data.get('IdealProfit', 0)

    revenue = count * price
    profit_margin = (profit / revenue * 100) if revenue > 0 else 0
    cost_basis = ((revenue - profit) / count) if count > 0 else 0

    processed_game = {
        "name": game_data.get('Game', ''),
        "form": game_data.get('Form', ''),
        "count": count,
        "price": price,
        "idealProfit": profit,
        "url": game_data.get('URL'),
        "identifier": f"{game_data.get('Game', '')}_{game_data.get('Form', '')}",
        "profitMargin": round(profit_margin, 1),
        "costBasis": round(cost_basis, 3),
        "hasInformationalFlyer": bool(game_data.get('URL'))
    }

    comprehensive["games"].append(processed_game)

    # Categorize by price
    price_key = f"${price}"
    if price_key in comprehensive["categories"]["byPrice"]:
        comprehensive["categories"]["byPrice"][price_key].append(processed_game["identifier"])

    # Categorize by profit
    if profit <= 100:
        comprehensive["categories"]["byProfit"]["low"]["games"].append(processed_game["identifier"])
    elif profit <= 300:
        comprehensive["categories"]["byProfit"]["medium"]["games"].append(processed_game["identifier"])
    elif profit <= 500:
        comprehensive["categories"]["byProfit"]["high"]["games"].append(processed_game["identifier"])
    else:
        comprehensive["categories"]["byProfit"]["veryHigh"]["games"].append(processed_game["identifier"])

    # Categorize by URL availability
    if game_data.get('URL'):
        comprehensive["categories"]["withUrls"].append(processed_game["identifier"])
    else:
        comprehensive["categories"]["withoutUrls"].append(processed_game["identifier"])

# Save comprehensive structure
with open('comprehensive-pulltabs-library.json', 'w') as f:
    json.dump(comprehensive, f, indent=2, default=str)

print(f"Processed {len(comprehensive['games'])} games")
print(f"Games with URLs: {len(comprehensive['categories']['withUrls'])}")
print(f"Games without URLs: {len(comprehensive['categories']['withoutUrls'])}")
print(f"$1 games: {len(comprehensive['categories']['byPrice']['$1'])}")
print(f"$2 games: {len(comprehensive['categories']['byPrice']['$2'])}")
print(f"$5 games: {len(comprehensive['categories']['byPrice']['$5'])}")