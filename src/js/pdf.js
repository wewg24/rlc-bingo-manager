// src/js/pdf.js
class PDFGenerator {
  constructor() {
    this.pdfMake = window.pdfMake;
  }

  generateOccasionReport(occasion, games, pullTabs, moneyCount) {
    const docDefinition = {
      pageSize: 'LETTER',
      pageMargins: [40, 60, 40, 60],
      
      header: this.createHeader(),
      footer: this.createFooter(),
      
      content: [
        this.createTitle('BINGO OCCASION REPORT'),
        this.createOccasionSection(occasion),
        this.createGamesSection(games),
        this.createPullTabsSection(pullTabs),
        this.createMoneySection(moneyCount),
        this.createSignatureSection()
      ],
      
      styles: this.getStyles()
    };
    
    return this.pdfMake.createPdf(docDefinition);
  }

  generateMGCForm104(occasion, data) {
    const docDefinition = {
      pageSize: 'LETTER',
      pageMargins: [30, 30, 30, 30],
      
      content: [
        {
          text: 'MISSOURI GAMING COMMISSION',
          style: 'header',
          alignment: 'center'
        },
        {
          text: 'FORM 104 - BINGO OCCASION REPORT',
          style: 'subheader',
          alignment: 'center',
          margin: [0, 10, 0, 20]
        },
        
        // Organization Information
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Organization:', bold: true },
                'Rolla Lions Club'
              ],
              [
                { text: 'License Number:', bold: true },
                '12345'
              ],
              [
                { text: 'Date of Occasion:', bold: true },
                occasion.date
              ],
              [
                { text: 'Session Type:', bold: true },
                occasion.sessionType
              ]
            ]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 20]
        },
        
        // Attendance
        {
          text: 'ATTENDANCE',
          style: 'sectionHeader'
        },
        {
          table: {
            widths: ['*', 100],
            body: [
              ['Total Players:', occasion.totalPlayers],
              ['Workers:', occasion.workersCount || 0],
              ['Birthday Free Plays:', occasion.birthdayBogos || 0]
            ]
          },
          margin: [0, 0, 0, 20]
        },
        
        // Games Summary
        {
          text: 'GAMES SUMMARY',
          style: 'sectionHeader'
        },
        this.createMGCGamesTable(data.games),
        
        // Pull-Tabs Summary
        {
          text: 'PULL-TABS SUMMARY',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10]
        },
        this.createMGCPullTabsTable(data.pullTabs),
        
        // Financial Summary
        {
          text: 'FINANCIAL SUMMARY',
          style: 'sectionHeader',
          margin: [0, 20, 0, 10]
        },
        this.createMGCFinancialTable(data.financial),
        
        // Certification
        {
          text: 'CERTIFICATION',
          style: 'sectionHeader',
          margin: [0, 30, 0, 10]
        },
        {
          text: 'I hereby certify that the information contained in this report is true and correct to the best of my knowledge.',
          margin: [0, 0, 0, 30]
        },
        
        // Signature lines
        {
          columns: [
            {
              width: '*',
              stack: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                { text: 'Signature of Person in Charge', fontSize: 10, margin: [0, 2, 0, 0] }
              ]
            },
            {
              width: '*',
              stack: [
                { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
                { text: 'Date', fontSize: 10, margin: [0, 2, 0, 0] }
              ]
            }
          ],
          columnGap: 20
        }
      ],
      
      styles: {
        header: {
          fontSize: 16,
          bold: true
        },
        subheader: {
          fontSize: 14,
          bold: true
        },
        sectionHeader: {
          fontSize: 12,
          bold: true,
          decoration: 'underline'
        }
      }
    };
    
    return this.pdfMake.createPdf(docDefinition);
  }

  createHeader() {
    return {
      columns: [
        {
          image: this.getLionsLogo(),
          width: 50,
          margin: [40, 20, 0, 0]
        },
        {
          text: 'ROLLA LIONS CLUB\nServing Since 1925',
          alignment: 'center',
          margin: [0, 30, 0, 0]
        },
        {
          text: '',
          width: 50
        }
      ]
    };
  }

  createFooter(currentPage, pageCount) {
    return {
      columns: [
        {
          text: `Generated: ${new Date().toLocaleString()}`,
          fontSize: 8,
          margin: [40, 0, 0, 0]
        },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'right',
          fontSize: 8,
          margin: [0, 0, 40, 0]
        }
      ]
    };
  }

  createTitle(title) {
    return {
      text: title,
      style: 'title',
      alignment: 'center',
      margin: [0, 20, 0, 20]
    };
  }

  createOccasionSection(occasion) {
    return [
      { text: 'OCCASION DETAILS', style: 'sectionHeader' },
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: 'Date:', bold: true },
              occasion.date,
              { text: 'Session:', bold: true },
              occasion.sessionType
            ],
            [
              { text: 'Lion in Charge:', bold: true },
              occasion.lionInCharge,
              { text: 'Total Players:', bold: true },
              occasion.totalPlayers
            ],
            [
              { text: 'Start Time:', bold: true },
              occasion.startTime || 'N/A',
              { text: 'End Time:', bold: true },
              occasion.endTime || 'N/A'
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 10, 0, 20]
      }
    ];
  }

  createGamesSection(games) {
    const gameRows = games.map(game => [
      game.gameNum,
      game.color,
      game.gameName,
      `$${game.prize}`,
      game.winners,
      `$${game.totalPaid}`
    ]);
    
    const totalPaid = games.reduce((sum, game) => sum + game.totalPaid, 0);
    
    return [
      { text: 'GAMES PLAYED', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: [30, 60, '*', 60, 50, 60],
          body: [
            [
              { text: '#', bold: true },
              { text: 'Color', bold: true },
              { text: 'Game', bold: true },
              { text: 'Prize', bold: true },
              { text: 'Winners', bold: true },
              { text: 'Total', bold: true }
            ],
            ...gameRows,
            [
              { text: 'TOTAL', bold: true, colSpan: 5 },
              {}, {}, {}, {},
              { text: `$${totalPaid.toFixed(2)}`, bold: true }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 10, 0, 20]
      }
    ];
  }

  createPullTabsSection(pullTabs) {
    if (!pullTabs || pullTabs.length === 0) {
      return [
        { text: 'PULL-TABS', style: 'sectionHeader' },
        { text: 'No pull-tab games played', margin: [0, 10, 0, 20] }
      ];
    }
    
    const pullTabRows = pullTabs.map(pt => [
      pt.name,
      pt.serial,
      pt.tabsSold,
      `$${pt.grossSales}`,
      `$${pt.prizesPaid}`,
      `$${pt.netRevenue}`
    ]);
    
    const totals = pullTabs.reduce((acc, pt) => ({
      sales: acc.sales + pt.grossSales,
      prizes: acc.prizes + pt.prizesPaid,
      net: acc.net + pt.netRevenue
    }), { sales: 0, prizes: 0, net: 0 });
    
    return [
      { text: 'PULL-TABS', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 80, 60, 60, 60, 60],
          body: [
            [
              { text: 'Game', bold: true },
              { text: 'Serial', bold: true },
              { text: 'Sold', bold: true },
              { text: 'Sales', bold: true },
              { text: 'Prizes', bold: true },
              { text: 'Net', bold: true }
            ],
            ...pullTabRows,
            [
              { text: 'TOTAL', bold: true, colSpan: 3 },
              {}, {},
              { text: `$${totals.sales.toFixed(2)}`, bold: true },
              { text: `$${totals.prizes.toFixed(2)}`, bold: true },
              { text: `$${totals.net.toFixed(2)}`, bold: true }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 10, 0, 20]
      }
    ];
  }

  createMoneySection(moneyCount) {
    return [
      { text: 'MONEY COUNT', style: 'sectionHeader' },
      {
        table: {
          widths: ['*', 100],
          body: [
            ['Starting Bank:', `$${moneyCount.startingBank}`],
            ['Total Cash:', `$${moneyCount.totalCash}`],
            ['Total Checks:', `$${moneyCount.totalChecks}`],
            ['Grand Total:', `$${moneyCount.grandTotal}`],
            ['Less Starting Bank:', `-$${moneyCount.startingBank}`],
            [
              { text: 'Deposit Amount:', bold: true },
              { text: `$${moneyCount.depositAmount}`, bold: true }
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 10, 0, 20]
      }
    ];
  }

  createSignatureSection() {
    return [
      { text: 'SIGNATURES', style: 'sectionHeader', margin: [0, 30, 0, 20] },
      {
        columns: [
          {
            width: '*',
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
              { text: 'Lion in Charge', fontSize: 10, margin: [0, 2, 0, 20] },
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
              { text: 'Money Counter #1', fontSize: 10, margin: [0, 2, 0, 0] }
            ]
          },
          {
            width: '*',
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
              { text: 'Date', fontSize: 10, margin: [0, 2, 0, 20] },
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 200, y2: 0, lineWidth: 1 }] },
              { text: 'Money Counter #2', fontSize: 10, margin: [0, 2, 0, 0] }
            ]
          }
        ],
        columnGap: 20
      }
    ];
  }

  createMGCGamesTable(games) {
    const rows = games.map(g => [
      g.number,
      g.name,
      g.prize,
      g.winners,
      g.total
    ]);
    
    return {
      table: {
        headerRows: 1,
        widths: [30, '*', 60, 50, 60],
        body: [
          ['#', 'Game', 'Prize', 'Winners', 'Total'],
          ...rows
        ]
      },
      layout: 'lightHorizontalLines'
    };
  }

  createMGCPullTabsTable(pullTabs) {
    const rows = pullTabs.map(pt => [
      pt.name,
      pt.form,
      pt.gross,
      pt.prizes,
      pt.net
    ]);
    
    return {
      table: {
        headerRows: 1,
        widths: ['*', 60, 60, 60, 60],
        body: [
          ['Game', 'Form #', 'Gross', 'Prizes', 'Net'],
          ...rows
        ]
      },
      layout: 'lightHorizontalLines'
    };
  }

  createMGCFinancialTable(financial) {
    return {
      table: {
        widths: ['*', 100],
        body: [
          ['Bingo Sales:', `$${financial.bingoSales}`],
          ['Pull-Tab Sales:', `$${financial.pullTabSales}`],
          ['Total Sales:', `$${financial.totalSales}`],
          ['', ''],
          ['Bingo Prizes:', `$${financial.bingoPrizes}`],
          ['Pull-Tab Prizes:', `$${financial.pullTabPrizes}`],
          ['Total Prizes:', `$${financial.totalPrizes}`],
          ['', ''],
          [{ text: 'Net Revenue:', bold: true }, { text: `$${financial.netRevenue}`, bold: true }]
        ]
      },
      layout: 'lightHorizontalLines'
    };
  }

  getStyles() {
    return {
      title: {
        fontSize: 18,
        bold: true
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5]
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        fillColor: '#f3f3f3'
      }
    };
  }

  getLionsLogo() {
    // Base64 encoded Lions logo (simplified version)
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  async download(pdf, filename) {
    pdf.download(filename);
  }

  async print(pdf) {
    pdf.print();
  }

  async getBase64(pdf) {
    return new Promise((resolve) => {
      pdf.getBase64((data) => {
        resolve(data);
      });
    });
  }
}

// Export for use
window.PDFGenerator = PDFGenerator;
