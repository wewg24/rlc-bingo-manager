/**
 * PULL-TAB LIBRARY MODULE
 * Version: 1.0.0
 * 
 * This module contains the complete pull-tab game library data
 * and related utility functions. It's designed to be called from
 * Main.gs to keep the codebase modular and maintainable.
 * 
 * Total Games: 152
 * Data Source: BasePullTabLibrary.csv
 */

/**
 * Main class for managing pull-tab library data
 */
class PullTabLibrary {
  /**
   * Get the complete array of pull-tab games
   * Returns all 152 games with simplified structure
   * 
   * @returns {Array} Array of game arrays, each containing 6 fields
   */
static getAllGames() {
  return [
    // Game format: [Game, Form, Count, Price, Profit, URL]
    // Count = Total tickets in the deal
    // Price = Price per ticket (usually $1)
    // Profit = Ideal profit amount for the entire deal
    
    ['Beat the Clock 599', '7724H', 960, 1, 361, ''],
    ['Black Jack 175', '6916M', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Black Jack 200', '6779P', 300, 1, 100, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Black Jack 280', '6917M', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Black Jack 400', '6918M', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Black Jack 599', '6919M', 840, 1, 241, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Black Jack 700', '6268P', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Bubble Gum 100', '6906V', 150, 1, 50, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Bubble Gum 175', '6747U', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Bubble Gum 280', '6748U', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Bubble Gum 325', '6771V', 500, 1, 175, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Bubble Gum 400', '6749U', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Bubble Gum 599', '6750U', 840, 1, 241, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Bubble Gum 700', '6751U', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Chase Your Dreams 200', '', 300, 1, 100, ''],
    ['Chocolate 100', '6906V', 150, 1, 50, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Chocolate 175', '6747U', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Chocolate 280', '6748U', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Chocolate 325', '6771V', 500, 1, 175, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Chocolate 400', '6749U', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Chocolate 599', '6750U', 840, 1, 241, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Chocolate 700', '6751U', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Claw Enforcement 175', '', 280, 1, 105, ''],
    ['Cotton Candy 100', '6906V', 150, 1, 50, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Cotton Candy 175', '6747U', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Cotton Candy 280', '6748U', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Cotton Candy 325', '6771V', 500, 1, 175, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Cotton Candy 400', '6749U', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Cotton Candy 599', '6750U', 840, 1, 241, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Cotton Candy 700', '6751U', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Crap Shoot 175', '6916M', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Crap Shoot 200', '6779P', 300, 1, 100, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Crap Shoot 280', '6917M', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Crap Shoot 400', '6918M', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Crap Shoot 599', '6919M', 840, 1, 241, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Crap Shoot 700', '6268P', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Dabbin\' Dachsund 200', '', 300, 1, 100, ''],
    ['Dabbin\' Me Ma 200', '', 300, 1, 100, ''],
    ['Day Dabbin\' 200', '', 300, 1, 100, ''],
    ['Dig Life 200', '', 300, 1, 100, ''],
    ['Double Bubble 140', '5595Y', 200, 1, 60, 'https://www.arrowinternational.com/db/grafix/AIPDF/C5594Y.PDF'],
    ['Double Bubble 175', '5596Y', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C5594Y.PDF'],
    ['Double Bubble 280', '5597Y', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C5594Y.PDF'],
    ['Double Bubble 425', '5102Z', 600, 1, 175, 'https://www.arrowinternational.com/db/grafix/AIPDF/C5594Y.PDF'],
    ['Dumbo Dab 175', '6219H', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Fire Fighters 140', '', 225, 1, 85, ''],
    ['Fire Fighters 599', '5991FF', 960, 1, 361, ''],
    ['Flamingo Bingo 140', '', 230, 1, 90, ''],
    ['Funky Chicken 280', '', 445, 1, 165, ''],
    ['Gator Dab 175', '6219H', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Gator Dab 280', '6220H', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Gator Dab 280 (2)', '6220H', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Gator Dab 400', '6221H', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Gator Dab 400 (2)', '6221H', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Gator Dab 700', '6222H', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Gator Dab 700 (2)', '6222H', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Gotcha 140', '783Q', 200, 1, 60, 'https://www.arrowinternational.com/db/grafix/AIPDF/C785Q.PDF'],
    ['Gotcha 280', '784Q', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C785Q.PDF'],
    ['Gotcha 425', '785Q', 600, 1, 175, 'https://www.arrowinternational.com/db/grafix/AIPDF/C785Q.PDF'],
    ['Gum Drops 100', '6906V', 150, 1, 50, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Gum Drops 175', '6747U', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Gum Drops 280', '6748U', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Gum Drops 325', '6771V', 500, 1, 175, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Gum Drops 400', '6749U', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Gum Drops 599', '6750U', 840, 1, 241, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Gum Drops 700', '6751U', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Hiss & Make Up 350', '', 550, 1, 200, ''],
    ['Jack 280', '', 400, 1, 120, ''],
    ['Kick Grass 200', '', 300, 1, 100, ''],
    ['Life Happens 599', '7726H', 960, 1, 361, ''],
    ['Lion Dab 175', '6219H', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Lion Dab 280', '6220H', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Lion Dab 400', '6221H', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Lion Dab 700', '6222H', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Lollipops 100', '6906V', 150, 1, 50, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Lollipops 175', '6747U', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Lollipops 280', '6748U', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Lollipops 325', '6771V', 500, 1, 175, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Lollipops 400', '6749U', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Lollipops 599', '6750U', 840, 1, 241, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Lollipops 700', '6751U', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6747U.PDF'],
    ['Luckies 100', '55886', 140, 1, 40, 'https://www.arrowinternational.com/db/grafix/AIPDF/C55888.PDF'],
    ['Luckies 200', '55887', 300, 1, 100, 'https://www.arrowinternational.com/db/grafix/AIPDF/C55888.PDF'],
    ['Luckies 350', '55888', 550, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C55888.PDF'],
    ['Luckies 500', '55889', 770, 1, 270, 'https://www.arrowinternational.com/db/grafix/AIPDF/C55888.PDF'],
    ['Mewsical 350', '', 550, 1, 200, ''],
    ['Monkey in the Middle 210', '', 300, 1, 90, ''],
    ['Monkey See Monkey Do 200', '', 300, 1, 100, ''],
    ['Monopoly Chance It 140', '7973H', 230, 1, 90, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7972H.PDF'],
    ['Monopoly Chance It 280', '7975H', 440, 1, 160, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7972H.PDF'],
    ['Monopoly Chance It 400', '7976H', 660, 1, 260, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7972H.PDF'],
    ['Monopoly Chance It 599', '7177J', 960, 1, 361, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7972H.PDF'],
    ['Mouse Keeping 350', '', 550, 1, 200, ''],
    ['Panda Dab 175', '6219H', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Panda Dab 280', '6220H', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Panda Dab 400', '6221H', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Panda Dab 700', '6222H', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Parrot Party 140', '', 230, 1, 90, ''],
    ['Parrot Party 280', '', 445, 1, 165, ''],
    ['Patriot Bingo 140', '5096W', 200, 1, 60, 'https://www.arrowinternational.com/db/grafix/AIPDF/C5097W.PDF'],
    ['Patriot Bingo 280', '5097W', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C5097W.PDF'],
    ['Patriot Bingo 599', '5340W', 840, 1, 241, 'https://www.arrowinternational.com/db/grafix/AIPDF/C5097W.PDF'],
    ['Paws for the Cause 200', '', 300, 1, 100, ''],
    ['Pot of Gold 140', '7319D', 230, 1, 90, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7319D.PDF'],
    ['Pot of Gold 280', '7320D', 440, 1, 160, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7319D.PDF'],
    ['Pot of Gold 400', '7321D', 660, 1, 260, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7319D.PDF'],
    ['Purrsuasion 350', '', 550, 1, 200, ''],
    ['Quad Runner 100', '7357M', 150, 1, 50, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF'],
    ['Quad Runner 130', '7358M', 200, 1, 70, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF'],
    ['Quad Runner 140', '7359M', 200, 1, 60, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF'],
    ['Quad Runner 165', '7361M', 250, 1, 85, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF'],
    ['Quad Runner 175', '7360M', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF'],
    ['Quad Runner 210', '', 325, 1, 115, ''],
    ['Quad Runner 260', '7363M', 400, 1, 140, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF'],
    ['Quad Runner 280', '7362M', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF'],
    ['Quad Runner 390', '7364M', 600, 1, 210, 'https://www.arrowinternational.com/db/grafix/AIPDF/C7357M.PDF'],
    ['Quad Runner 500', '', 775, 1, 275, ''],
    ['Race Horse Downs 250', '354GA', 1000, 1, 330, 'https://www.arrowinternational.com/db/grafix/AIPDF/C354GA.PDF'],
    ['Race Horse Downs 521', '353GA', 2040, 1, 615, 'https://www.arrowinternational.com/db/grafix/AIPDF/C353GA.PDF'],
    ['Red Hot Cardinals 140', '', 230, 1, 90, ''],
    ['Rockin\' Robin 140', '7348J', 230, 1, 90, ''],
    ['Roulette 175', '6916M', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Roulette 200', '6779P', 300, 1, 100, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Roulette 280', '6917M', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Roulette 400', '6918M', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Roulette 599', '6919M', 840, 1, 241, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Roulette 700', '6268P', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Shake it Off 200', '', 300, 1, 100, ''],
    ['Slots 175', '6916M', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Slots 200', '6779P', 300, 1, 100, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Slots 280', '6917M', 400, 1, 120, ''],
    ['Slots 400', '6918M', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Slots 599', '6919M', 840, 1, 241, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Slots 700', '6268P', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Smack Dab 270', '', 450, 1, 180, ''],
    ['Small Ball 175', '6916M', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Small Ball 200', '6779P', 300, 1, 100, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Small Ball 280', '6917M', 400, 1, 120, ''],
    ['Small Ball 400', '6918M', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Small Ball 599', '6919M', 840, 1, 241, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Small Ball 700', '6268P', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6916M.PDF'],
    ['Snap Crackle Pop 270', '', 450, 1, 180, ''],
    ['Stones 599', '7728H', 960, 1, 361, ''],
    ['Tiger Dab 175', '6219H', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Tiger Dab 280', '6220H', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Tiger Dab 400', '6221H', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Tiger Dab 700', '6222H', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6219H.PDF'],
    ['Triple Twist 110', '6080J', 150, 1, 40, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6080J.PDF'],
    ['Triple Twist 175', '6081J', 250, 1, 75, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6080J.PDF'],
    ['Triple Twist 280', '6082J', 400, 1, 120, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6080J.PDF'],
    ['Triple Twist 400', '6083J', 600, 1, 200, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6080J.PDF'],
    ['Triple Twist 700', '6084J', 1000, 1, 300, 'https://www.arrowinternational.com/db/grafix/AIPDF/C6080J.PDF']
  ];
}
  
  /**
   * Get simplified pull-tab games for quick lookup
   * Returns an array of objects with essential properties only
   * 
   * @returns {Array} Array of game objects with name, topPrize, formNumber, ticketPrice
   */
  static getSimplifiedGames() {
    const games = this.getAllGames();
    return games.map(game => ({
      name: game[0],
      form: game[1],
      count: game[2],
      price: game[3],
      profit: game[4],
      url: game[5],
      // Calculated fields for frontend display
      idealSales: game[2] * game[3],
      idealPrizes: (game[2] * game[3]) - game[4],
      profitPercent: ((game[4] / (game[2] * game[3])) * 100).toFixed(1)
    }));
  }
  
  /**
   * Get column headers for the simplified pull-tab library sheet
   * Simplified structure for easier data entry and management
   * 
   * @returns {Array} Array of header names
   */
  static getHeaders() {
    return [
      'Game', 'Form', 'Count', 'Price', 'Profit', 'URL'
    ];
  }
  
  /**
   * Populate a sheet with the complete pull-tab library
   * This is used during initial setup or reset operations
   * 
   * @param {Sheet} sheet - The Google Sheet to populate
   * @returns {Object} Result object with success status and message
   */
  static populateSheet(sheet) {
    try {
      // Clear existing content
      sheet.clear();
      
      // Add headers
      const headers = this.getHeaders();
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
      
      // Get all games
      const games = this.getAllGames();
      
      // Add games to sheet in batches to avoid timeout
      const batchSize = 50;
      let currentRow = 2; // Start after header row
      
      for (let i = 0; i < games.length; i += batchSize) {
        const batch = games.slice(i, Math.min(i + batchSize, games.length));
        sheet.getRange(currentRow, 1, batch.length, batch[0].length).setValues(batch);
        currentRow += batch.length;
        
        // Flush changes periodically
        SpreadsheetApp.flush();
      }
      
      // Format columns
      sheet.getRange(2, 3, games.length, 1).setNumberFormat('#,##0'); // Count
      sheet.getRange(2, 4, games.length, 1).setNumberFormat('$#,##0.00'); // Price
      sheet.getRange(2, 5, games.length, 1).setNumberFormat('$#,##0.00'); // Profit
      
      // Auto-resize columns for better readability
      sheet.autoResizeColumns(1, headers.length);
      
      return {
        success: true,
        message: `Successfully populated ${games.length} pull-tab games`,
        gamesAdded: games.length
      };
      
    } catch (error) {
      console.error('Error populating pull-tab sheet:', error);
      return {
        success: false,
        message: 'Error populating sheet: ' + error.toString(),
        error: error
      };
    }
  }
  
  /**
   * Find games by name (supports partial matching)
   * 
   * @param {string} searchName - Name or partial name to search
   * @returns {Array} Array of matching games
   */
  static findGamesByName(searchName) {
    const games = this.getAllGames();
    const searchLower = searchName.toLowerCase();
    
    return games.filter(game => 
      game[0].toLowerCase().includes(searchLower)
    );
  }
  
  /**
   * Find games by form number
   * 
   * @param {string} formNumber - Form number to search
   * @returns {Array} Array of matching games (usually just one)
   */
  static findGameByFormNumber(formNumber) {
    const games = this.getAllGames();
    return games.filter(game => game[3] === formNumber);
  }
  
  /**
   * Get games within a specific payout range
   * 
   * @param {number} minPayout - Minimum payout amount
   * @param {number} maxPayout - Maximum payout amount
   * @returns {Array} Array of games within the range
   */
  static getGamesByPayoutRange(minPayout, maxPayout) {
    const games = this.getAllGames();
    return games.filter(game => 
      game[1] >= minPayout && game[1] <= maxPayout
    );
  }
  
  /**
   * Get unique game names (without variants)
   * 
   * @returns {Array} Array of unique game names
   */
  static getUniqueGameNames() {
    const games = this.getAllGames();
    const uniqueNames = new Set(games.map(game => game[0]));
    return Array.from(uniqueNames).sort();
  }
}

/**
 * Get pull-tab library for frontend
 * Returns simplified objects matching the PullTabLibrary class structure
 */
function getPullTabLibrary() {
    try {
        // Use the PullTabLibrary class to get all games
        const games = PullTabLibrary.getSimplifiedGames();
        
        // The getSimplifiedGames() method already returns objects with:
        // name, form, count, price, profit, url, idealSales, idealPrizes, profitPercent
        
        return games;
    } catch (error) {
        console.error('Error getting pull-tab library:', error);
        // Return empty array on error
        return [];
    }
}

/**
 * Get a specific pull-tab game by identifier
 * @param {string} identifier - Format: "GameName_FormNumber"
 */
function getPullTabByIdentifier(identifier) {
    try {
        const [gameName, formNumber] = identifier.split('_');
        const games = PullTabLibrary.getAllGames();
        
        // Find the game that matches both name and form
        const game = games.find(g => g[0] === gameName && g[1] === formNumber);
        
        if (game) {
            return {
                name: game[0],
                form: game[1],
                count: game[2],
                price: game[3],
                profit: game[4],
                url: game[5],
                idealSales: game[2] * game[3],
                idealPrizes: (game[2] * game[3]) - game[4]
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error getting pull-tab by identifier:', error);
        return null;
    }
}

/**
 * Save pull-tab usage for an occasion
 * This saves actual usage data, not library data
 */
function savePullTabUsage(occasionId, pullTabUsageData) {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('PullTabUsage');
    
    if (!sheet) {
        // Create the sheet with proper headers
        sheet = spreadsheet.insertSheet('PullTabUsage');
        const headers = [
            'Usage ID', 'Occasion ID', 'Game Name', 'Form Number', 'Serial Number',
            'Tickets Sold', 'Gross Sales', 'Prizes Paid', 'Net Revenue',
            'Last Sale Ticket', 'Created', 'Status'
        ];
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
        sheet.setFrozenRows(1);
    }
    
    const timestamp = new Date();
    const rows = [];
    
    pullTabUsageData.forEach(usage => {
        rows.push([
            Utilities.getUuid(),
            occasionId,
            usage.gameName,
            usage.formNumber,
            usage.serialNumber,
            usage.ticketsSold,
            usage.grossSales,
            usage.prizesPaid,
            usage.netRevenue,
            usage.lastSaleTicket || '',
            timestamp,
            'ACTIVE'
        ]);
    });
    
    if (rows.length > 0) {
        const lastRow = sheet.getLastRow();
        sheet.getRange(lastRow + 1, 1, rows.length, 12).setValues(rows);
    }
    
    return { success: true, rowsAdded: rows.length };
}