const fs = require('fs');
const path = require('path');

const extensionDir = path.join(__dirname, '..', 'extension-build');

console.log('🔍 Checking Chrome Extension Build...\n');

// Required files for Chrome extension
const requiredFiles = [
  'manifest.json',
  'index.html',
  'background.js',
  'content.js',
  'content.css',
  'sidebar.js',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(extensionDir, file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('\n📋 Manifest Validation...');

try {
  const manifestPath = path.join(extensionDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Check required manifest fields
  const requiredFields = ['manifest_version', 'name', 'version', 'side_panel'];
  
  requiredFields.forEach(field => {
    if (manifest[field]) {
      console.log(`✅ ${field}: ${typeof manifest[field] === 'object' ? JSON.stringify(manifest[field]) : manifest[field]}`);
    } else {
      console.log(`❌ ${field} - MISSING`);
      allFilesExist = false;
    }
  });
  
  // Check if side panel path exists
  if (manifest.side_panel && manifest.side_panel.default_path) {
    const sidePanel = path.join(extensionDir, manifest.side_panel.default_path);
    if (fs.existsSync(sidePanel)) {
      console.log(`✅ Side panel file: ${manifest.side_panel.default_path}`);
    } else {
      console.log(`❌ Side panel file: ${manifest.side_panel.default_path} - MISSING`);
      allFilesExist = false;
    }
  }
  
} catch (error) {
  console.log(`❌ manifest.json - Invalid JSON: ${error.message}`);
  allFilesExist = false;
}

console.log('\n🎯 Installation Instructions:');
console.log('1. Open Chrome and go to chrome://extensions/');
console.log('2. Enable "Developer mode" (toggle in top right)');
console.log('3. Click "Load unpacked"');
console.log(`4. Select this folder: ${extensionDir}`);

if (allFilesExist) {
  console.log('\n🎉 Extension is ready to install!');
  console.log('\n⚠️  Don\'t forget to:');
  console.log('   • Get your OpenAI API key from https://platform.openai.com/api-keys');
  console.log('   • Configure the API key in the extension settings');
} else {
  console.log('\n❌ Extension has missing files and may not work properly.');
}

console.log('\n📁 Extension location:', extensionDir);
