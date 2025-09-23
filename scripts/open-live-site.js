// Quick script to open project URLs
const { exec } = require('child_process');

const urls = [
    'https://wewg24.github.io/rlc-bingo-manager/',
    'https://github.com/wewg24/rlc-bingo-manager',
    'https://script.google.com/home/projects/1W8URFctBaFd98FQpdzi7tI8h8OnUPi1rT-Et_SJRkKiMuVKra34pN5hU/edit'
];

console.log('🌐 Opening RLC Bingo Manager project URLs...');

urls.forEach((url, index) => {
    setTimeout(() => {
        exec(`start ${url}`, (error) => {
            if (error) {
                console.error(`Error opening ${url}:`, error);
            } else {
                console.log(`✅ Opened: ${url}`);
            }
        });
    }, index * 1000); // Stagger opening by 1 second each
});