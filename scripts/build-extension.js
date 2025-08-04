const fs = require('fs-extra');
const path = require('path');

async function buildExtension() {
  console.log('🚀 Building Chrome Extension...');
  
  const srcDir = path.join(__dirname, '..');
  const extensionDir = path.join(srcDir, 'extension-build');
  
  try {
    // Clean and create extension build directory
    await fs.remove(extensionDir);
    await fs.ensureDir(extensionDir);
    console.log('✅ Created clean extension build directory');
    
    // 1. Copy manifest template and update as needed
    await fs.copy(
      path.join(srcDir, 'src/extension/manifest.template.json'),
      path.join(extensionDir, 'manifest.json')
    );
    console.log('✅ Copied manifest.json');
    
    // 2. Copy sidebar files (with inlined CSS for Chrome extension compatibility)
    const sidebarSrcDir = path.join(srcDir, 'src/extension/sidebar');
    
    // Read the HTML template
    let htmlContent = await fs.readFile(path.join(sidebarSrcDir, 'index.html'), 'utf8');
    
    // Read and inline the CSS
    const cssContent = await fs.readFile(path.join(sidebarSrcDir, 'styles.css'), 'utf8');
    htmlContent = htmlContent.replace('<link rel="stylesheet" href="styles.css">', `<style>\n${cssContent}\n    </style>`);
    
    // Write the final HTML with inlined CSS
    await fs.writeFile(path.join(extensionDir, 'index.html'), htmlContent, 'utf8');
    console.log('✅ Generated index.html with inlined CSS');
    
    // Copy the JavaScript file
    await fs.copy(
      path.join(sidebarSrcDir, 'sidebar.js'),
      path.join(extensionDir, 'sidebar.js')
    );
    console.log('✅ Copied sidebar.js');
    
    // 3. Copy extension scripts
    await fs.copy(
      path.join(srcDir, 'src/extension/background.js'),
      path.join(extensionDir, 'background.js')
    );
    console.log('✅ Copied background.js');
    
    await fs.copy(
      path.join(srcDir, 'src/extension/content.js'),
      path.join(extensionDir, 'content.js')
    );
    console.log('✅ Copied content.js');
    
    await fs.copy(
      path.join(srcDir, 'src/extension/content.css'),
      path.join(extensionDir, 'content.css')
    );
    console.log('✅ Copied content.css');
    
    // 4. Create icons directory and generate placeholder icons
    const iconsDir = path.join(extensionDir, 'icons');
    await fs.ensureDir(iconsDir);
    
    const iconSizes = [16, 32, 48, 128];
    for (const size of iconSizes) {
      const iconPath = path.join(iconsDir, `icon${size}.png`);
      const iconData = generateSimpleIcon(size);
      await fs.writeFile(iconPath, iconData, 'base64');
    }
    console.log('✅ Generated placeholder icons');
    
    console.log('🎉 Extension build completed successfully!');
    console.log(`📁 Extension files are in: ${extensionDir}`);
    console.log('');
    console.log('📋 Generated files:');
    console.log('✅ manifest.json - Extension configuration');
    console.log('✅ index.html - Sidebar page (with inlined CSS)');
    console.log('✅ sidebar.js - Main sidebar functionality');
    console.log('✅ background.js - Extension background worker');
    console.log('✅ content.js - Content script for page interaction');
    console.log('✅ content.css - Content script styles');
    console.log('✅ icons/ - Extension icons');
    console.log('');
    console.log('📝 To install the extension:');
    console.log('1. Open Chrome and go to chrome://extensions/');
    console.log('2. Enable "Developer mode"');
    console.log('3. Click "Load unpacked"');
    console.log(`4. Select the folder: ${extensionDir}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

function generateSimpleIcon(size) {
  // Simple base64 PNG for a blue square icon
  const iconBase64 = {
    16: 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFESURBVDiNpZM9SwNBEIafgwiChYWFjYWFhYWNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Nj',
    32: 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFESURBVFiFpZc9SwNBEIafgwiChYWFjYWFhYWNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Nj',
    48: 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFESURBVGiF7Zc9SwNBEIafgwiChYWFjYWFhYWNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Nj',
    128: 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFESURBVHic7Zc9SwNBEIafgwiChYWFjYWFhYWNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Nj'
  };
  
  return iconBase64[size] || iconBase64[16];
}

if (require.main === module) {
  buildExtension();
}

module.exports = buildExtension;
