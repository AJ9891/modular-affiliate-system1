const fs = require('fs');
const path = require('path');
const glob = require('glob');

const errors = [];

// Find all .tsx and .ts files
glob.sync('apps/web/src/**/*.{tsx,ts}', { ignore: 'node_modules/**' }).forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for href attributes pointing to invalid paths
  const hrefMatches = content.match(/href=['"`]([^'"`]+)['"`]/g) || [];
  
  hrefMatches.forEach(match => {
    const href = match.replace(/href=['"`]|['"`]/g, '');
    
    // Skip external links and anchors
    if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('#')) {
      return;
    }
    
    // Check if the route/file exists
    const targetPath = path.join('apps/web/src', href);
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
