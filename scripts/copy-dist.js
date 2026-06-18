/**
 * Copy Distribution Files
 * Copies built files from dist/ to appropriate directories
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Copy files recursively
 */
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    ensureDir(dest);
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

/**
 * Main copy function
 */
function copyDistFiles() {
  console.log('Copying distribution files...');
  
  // Copy JS files
  const jsSource = path.join(distDir, 'js');
  const jsDest = path.join(rootDir, 'js');
  if (fs.existsSync(jsSource)) {
    copyRecursive(jsSource, jsDest);
    console.log('✓ JavaScript files copied');
  }
  
  // Copy CSS files
  const cssSource = path.join(distDir, 'css');
  const cssDest = path.join(rootDir, 'css');
  if (fs.existsSync(cssSource)) {
    copyRecursive(cssSource, cssDest);
    console.log('✓ CSS files copied');
  }
  
  // Copy image files
  const imgSource = path.join(distDir, 'img');
  const imgDest = path.join(rootDir);
  if (fs.existsSync(imgSource)) {
    copyRecursive(imgSource, imgDest);
    console.log('✓ Image files copied');
  }
  
  // Copy font files
  const fontSource = path.join(distDir, 'fonts');
  const fontDest = path.join(rootDir, 'css');
  if (fs.existsSync(fontSource)) {
    copyRecursive(fontSource, fontDest);
    console.log('✓ Font files copied');
  }
  
  // Copy HTML files
  const pagesSource = path.join(distDir, 'pages');
  const pagesDest = path.join(rootDir, 'pages');
  if (fs.existsSync(pagesSource)) {
    copyRecursive(pagesSource, pagesDest);
    console.log('✓ HTML files copied');
  }
  
  console.log('Distribution files copied successfully!');
}

// Run the copy operation
copyDistFiles();