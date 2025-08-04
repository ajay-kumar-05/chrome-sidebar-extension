const fs = require('fs');
const path = require('path');

// Simple SVG-based icon generator
function createIcon(size) {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#3B82F6"/>
    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  
  return Buffer.from(svg);
}

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const iconBuffer = createIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), iconBuffer);
  console.log(`Created icon${size}.svg`);
});

console.log('Icons created successfully!');
