const fs = require('fs-extra');
const path = require('path');

async function buildExtension() {
  console.log('🚀 Building Chrome Extension...');
  
  const srcDir = path.join(__dirname, '..');
  const outDir = path.join(srcDir, 'out');
  const extensionDir = path.join(srcDir, 'extension-build');
  
  try {
    // Clean extension build directory
    await fs.remove(extensionDir);
    await fs.ensureDir(extensionDir);
    
    // Check if Next.js build output exists
    if (await fs.pathExists(outDir)) {
      console.log('✅ Found Next.js build output');
      
      // Copy Next.js build output with better filtering
      await fs.copy(outDir, extensionDir, {
        filter: (src, dest) => {
          const basename = path.basename(src);
          const relativePath = path.relative(outDir, src);
          
          // Skip trace files and unnecessary chunks
          if (basename === 'trace' || 
              basename.includes('trace') ||
              relativePath.includes('trace') ||
              basename.startsWith('_next/static/chunks/pages/_app') ||
              basename.startsWith('_next/static/chunks/pages/_error') ||
              basename.startsWith('_next/static/chunks/pages/_document')) {
            return false;
          }
          
          return true;
        }
      });
      console.log('✅ Copied Next.js build files');
    } else {
      console.error('❌ Next.js build output not found. Run "npm run build" first.');
      process.exit(1);
    }
    
    // Copy manifest.json
    await fs.copy(
      path.join(srcDir, 'public/manifest.json'),
      path.join(extensionDir, 'manifest.json')
    );
    console.log('✅ Copied manifest.json');
    
    // Copy extension scripts
    await fs.copy(
      path.join(srcDir, 'src/extension/background.js'),
      path.join(extensionDir, 'background.js')
    );
    await fs.copy(
      path.join(srcDir, 'src/extension/content.js'),
      path.join(extensionDir, 'content.js')
    );
    console.log('✅ Copied extension scripts');
    
    // Copy icons if they exist
    const iconsDir = path.join(srcDir, 'public/icons');
    const targetIconsDir = path.join(extensionDir, 'icons');
    if (await fs.pathExists(iconsDir)) {
      await fs.copy(iconsDir, targetIconsDir);
      console.log('✅ Copied icons');
    } else {
      // Create placeholder icons
      await fs.ensureDir(targetIconsDir);
      const iconSizes = [16, 32, 48, 128];
      
      for (const size of iconSizes) {
        const iconContent = createPlaceholderIcon(size);
        await fs.writeFile(
          path.join(targetIconsDir, `icon${size}.png`),
          iconContent,
          'base64'
        );
      }
      console.log('✅ Created placeholder icons');
    }
    
    // Create content.css if it doesn't exist
    const contentCssPath = path.join(extensionDir, 'content.css');
    if (!await fs.pathExists(contentCssPath)) {
      const contentCss = `
/* Content script styles */
#ai-sidebar-float-btn {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

#ai-sidebar-selection-popup {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
      `;
      await fs.writeFile(contentCssPath, contentCss.trim());
      console.log('✅ Created content.css');
    }
    
    // Update manifest.json paths for production
    const manifestPath = path.join(extensionDir, 'manifest.json');
    const manifest = await fs.readJson(manifestPath);
    
    // Update side panel path
    manifest.side_panel.default_path = 'index.html';
    
    await fs.writeJson(manifestPath, manifest, { spaces: 2 });
    console.log('✅ Updated manifest paths');
    
    console.log('🎉 Extension build completed!');
    console.log(`📁 Extension files are in: ${extensionDir}`);
    console.log('\n📝 To install the extension:');
    console.log('1. Open Chrome and go to chrome://extensions/');
    console.log('2. Enable "Developer mode"');
    console.log('3. Click "Load unpacked"');
    console.log(`4. Select the folder: ${extensionDir}`);
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

function createPlaceholderIcon(size) {
  // Simple placeholder icon as base64 PNG
  // This is a minimal 16x16 blue square icon
  const iconData = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFESURBVDiNpZM9SwNBEIafgwiChYWFjYWFhYWNjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Nj';
  return iconData;
}

if (require.main === module) {
  buildExtension();
}

module.exports = buildExtension;
