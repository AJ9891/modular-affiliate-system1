const fs = require('fs');
const path = require('path');

const errors = [];

// Recursive function to find all .tsx and .ts files
function findFiles(dir, ext = ['.tsx', '.ts']) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    
    // Skip node_modules and .next
    if (item.name === 'node_modules' || item.name === '.next' || item.name === '__tests__') {
      return;
    }
    
    if (item.isDirectory()) {
      files = files.concat(findFiles(fullPath, ext));
    } else if (ext.some(e => item.name.endsWith(e))) {
      files.push(fullPath);
    }
  });
  
  return files;
}

const files = findFiles('apps/web/src');

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for href attributes pointing to invalid paths
  const hrefMatches = content.match(/href=['"`]([^'"`]+)['"`]/g) || [];
  
  hrefMatches.forEach(match => {
    let href = match.replace(/href=['"`]|['"`]/g, '');
    
    // Skip external links and anchors
    if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) {
      return;
    }
    
    // Skip template variables
    if (href.includes('${') || href.includes('{')) {
      return;
    }
    
    // Remove query parameters for link validation
    const baseHref = href.split('?')[0];
    
    // Check if the route/file exists
    const targetPath = path.join('apps/web/src', baseHref);
    if (!fs.existsSync(targetPath) && !fs.existsSync(targetPath + '.tsx') && !fs.existsSync(targetPath + '/page.tsx')) {
      errors.push(`File: ${file}\n  Broken link: ${href}`);
    }
  });
});

if (errors.length > 0) {
  console.error('❌ Broken links found:\n');
  errors.forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log('✅ All links are valid!');
}
