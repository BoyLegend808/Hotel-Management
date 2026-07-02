/**
 * Copy Distribution Files
 * Copies built files from dist/ to appropriate directories
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

/**
 * Ensure a resolved path stays within a trusted base directory.
 * Throws if the path escapes the base (path traversal guard).
 */
function assertSafe(base, target) {
  const rel = path.relative(base, target);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Path traversal attempt blocked: ${target}`);
  }
}

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  assertSafe(rootDir, dir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Copy files recursively
 */
function copyRecursive(src, dest) {
  // Resolve and guard both paths before touching the filesystem
  const resolvedSrc = path.resolve(src);
  const resolvedDest = path.resolve(dest);
  assertSafe(rootDir, resolvedSrc);
  assertSafe(rootDir, resolvedDest);

  const exists = fs.existsSync(resolvedSrc);
  const stats = exists && fs.statSync(resolvedSrc);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    ensureDir(resolvedDest);
    fs.readdirSync(resolvedSrc).forEach(childItemName => {
      // Skip hidden / dangerous names
      if (childItemName.startsWith('.') || childItemName.includes('..')) return;
      copyRecursive(
        path.join(resolvedSrc, childItemName),
        path.join(resolvedDest, childItemName)
      );
    });
  } else {
    ensureDir(path.dirname(resolvedDest));
    fs.copyFileSync(resolvedSrc, resolvedDest);
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