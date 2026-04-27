const fs = require('fs');
const path = require('path');

const APP_SRC_DIR = 'apps/web/src';
const APP_ROUTE_DIR = path.join(APP_SRC_DIR, 'app');
const errors = new Set();

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

function isRouteFile(filePath) {
  return filePath.endsWith(`${path.sep}page.tsx`) || filePath.endsWith(`${path.sep}page.ts`);
}

function normalizeRoutePath(route) {
  if (!route) return '/';
  const trimmed = route.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function segmentToRegex(segment) {
  if (segment.startsWith('[[...') && segment.endsWith(']]')) return '(?:.*)?';
  if (segment.startsWith('[...') && segment.endsWith(']')) return '.+';
  if (segment.startsWith('[') && segment.endsWith(']')) return '[^/]+';
  return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pathToRouteInfo(pageFilePath) {
  const relativeDir = path.relative(APP_ROUTE_DIR, path.dirname(pageFilePath));
  const rawSegments = relativeDir === '' ? [] : relativeDir.split(path.sep).filter(Boolean);
  const segments = rawSegments.filter(seg => !seg.startsWith('(') && !seg.startsWith('@'));
  const route = segments.length ? `/${segments.join('/')}` : '/';
  const routeRegex = new RegExp(
    `^/${segments.map(segmentToRegex).join('/')}${segments.length ? '/?' : '?'}$`
  );

  return {
    route: normalizeRoutePath(route),
    routeRegex,
  };
}

const allSourceFiles = findFiles(APP_SRC_DIR);
const routeInfos = allSourceFiles
  .filter(isRouteFile)
  .map(pathToRouteInfo);
const files = allSourceFiles.filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for href attributes pointing to invalid paths
  const hrefMatches = content.match(/href=['"`]([^'"`]+)['"`]/g) || [];
  
  hrefMatches.forEach(match => {
    let href = match.replace(/href=['"`]|['"`]/g, '');
    
    // Skip external links and non-route hrefs
    if (
      href.startsWith('http') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      href.startsWith('#')
    ) {
      return;
    }
    
    // Skip template variables
    if (href.includes('${') || href.includes('{')) {
      return;
    }
    
    // Skip API links and non-root-relative hrefs
    if (!href.startsWith('/') || href.startsWith('/api/')) {
      return;
    }

    // Remove query/hash for route validation
    const baseHref = normalizeRoutePath(href.split('?')[0].split('#')[0]);

    const routeExists = routeInfos.some(({ route, routeRegex }) => {
      return route === baseHref || routeRegex.test(baseHref);
    });

    if (!routeExists) {
      errors.add(`File: ${file}\n  Broken link: ${href}`);
    }
  });
});

if (errors.size > 0) {
  console.error('❌ Broken links found:\n');
  Array.from(errors).sort().forEach(e => console.error(e));
  process.exit(1);
} else {
  console.log('✅ All links are valid!');
}
