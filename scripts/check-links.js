const fs = require('fs');
const path = require('path');

const APP_SRC_DIR = 'apps/web/src';
const APP_ROUTE_DIR = path.join(APP_SRC_DIR, 'app');
const SOURCE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const ROUTE_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const errors = new Set();
const warnings = new Set();

function findFiles(dir, ext = SOURCE_EXTENSIONS) {
  let files = [];
  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);

    if (['node_modules', '.next', '__tests__', 'coverage', '.turbo'].includes(item.name)) {
      continue;
    }

    if (item.isDirectory()) files = files.concat(findFiles(fullPath, ext));
    else if (ext.some(e => item.name.endsWith(e))) files.push(fullPath);
  }

  return files;
}

function normalizeRoutePath(route) {
  if (!route) return '/';
  const withoutHash = route.split('#')[0];
  const withoutQuery = withoutHash.split('?')[0];
  const trimmed = withoutQuery.replace(/\/+$/, '').trim();
  return trimmed === '' ? '/' : trimmed;
}

function isExternalOrNonRoute(value) {
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:') ||
    value.startsWith('sms:') ||
    value.startsWith('javascript:') ||
    value.startsWith('#') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  );
}

function isDynamicValue(value) {
  return (
    value.includes('${') ||
    value.includes('{') ||
    value.includes('}') ||
    value.includes('` +') ||
    value.includes('+ `') ||
    value.includes('encodeURIComponent(')
  );
}

function segmentToRegex(segment) {
  if (segment.startsWith('[[...') && segment.endsWith(']]')) return '(?:.*)?';
  if (segment.startsWith('[...') && segment.endsWith(']')) return '.+';
  if (segment.startsWith('[') && segment.endsWith(']')) return '[^/]+';
  return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function appFileToRouteInfo(filePath) {
  const relativeDir = path.relative(APP_ROUTE_DIR, path.dirname(filePath));
  const rawSegments = relativeDir === '' ? [] : relativeDir.split(path.sep).filter(Boolean);
  const segments = rawSegments.filter(seg => !seg.startsWith('(') && !seg.startsWith('@'));
  const route = segments.length ? `/${segments.join('/')}` : '/';
  const dynamicCount = segments.filter(seg => seg.includes('[')).length;

  return {
    file: filePath,
    route: normalizeRoutePath(route),
    routeRegex: new RegExp(`^/${segments.map(segmentToRegex).join('/')}${segments.length ? '/?' : '?'}$`),
    segmentCount: segments.length,
    dynamicCount,
  };
}

function getExportedMethods(routeFilePath) {
  const content = fs.readFileSync(routeFilePath, 'utf8');
  const methods = new Set();

  for (const method of ROUTE_METHODS) {
    const declaration = new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\b|export\\s+const\\s+${method}\\b`);
    if (declaration.test(content)) methods.add(method);
  }

  return methods;
}

function buildRouteIndexes(allSourceFiles) {
  const pageRoutes = [];
  const apiRoutes = [];

  for (const file of allSourceFiles) {
    const base = path.basename(file);

    if (base === 'page.tsx' || base === 'page.ts') {
      pageRoutes.push(appFileToRouteInfo(file));
    }

    if ((base === 'route.ts' || base === 'route.js') && file.includes(`${path.sep}app${path.sep}api${path.sep}`)) {
      apiRoutes.push({
        ...appFileToRouteInfo(file),
        methods: getExportedMethods(file),
      });
    }
  }

  const bySpecificity = (a, b) =>
    a.dynamicCount - b.dynamicCount || b.segmentCount - a.segmentCount || a.route.localeCompare(b.route);

  return {
    pageRoutes: pageRoutes.sort(bySpecificity),
    apiRoutes: apiRoutes.sort(bySpecificity),
  };
}

function routeExists(routeInfos, value) {
  const baseValue = normalizeRoutePath(value);
  return routeInfos.some(({ route, routeRegex }) => route === baseValue || routeRegex.test(baseValue));
}

function apiRouteForPath(apiRoutes, value) {
  const baseValue = normalizeRoutePath(value);
  return (
    apiRoutes.find(({ route }) => route === baseValue) ||
    apiRoutes.find(({ routeRegex }) => routeRegex.test(baseValue)) ||
    null
  );
}

function collectStringMatches(content, regex, groupIndex = 1) {
  const values = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[groupIndex]) values.push(match[groupIndex]);
  }
  return values;
}

function collectPageLinks(content) {
  return [
    ...collectStringMatches(content, /href=['"`]([^'"`]+)['"`]/g),
    ...collectStringMatches(content, /to=['"`]([^'"`]+)['"`]/g),
    ...collectStringMatches(content, /router\.(?:push|replace)\(\s*['"`]([^'"`]+)['"`]\s*\)/g),
    ...collectStringMatches(content, /window\.location(?:\.href)?\s*=\s*['"`]([^'"`]+)['"`]/g),
    ...collectStringMatches(content, /window\.location\.(?:assign|replace)\(\s*['"`]([^'"`]+)['"`]\s*\)/g),
  ];
}

function collectApiCalls(content) {
  const calls = new Map();
  const addCall = (url, method, source) => {
    const normalizedMethod = method ? method.toUpperCase() : 'GET';
    calls.set(`${source}:${normalizedMethod}:${url}`, { url, method: normalizedMethod, source });
  };

  for (const match of content.matchAll(/fetch\(\s*['"`]([^'"`]+)['"`]\s*(?:,\s*(\{[\s\S]*?\}))?\s*\)/g)) {
    const options = match[2] || '';
    const methodMatch = options.match(/method\s*:\s*['"`]([A-Za-z]+)['"`]/);
    addCall(match[1], methodMatch ? methodMatch[1] : 'GET', 'fetch');
  }

  for (const match of content.matchAll(/\b(?:api|axios)\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)['"`]/g)) {
    addCall(match[2], match[1], 'client');
  }

  return Array.from(calls.values());
}

function validatePageLink(file, href, pageRoutes) {
  if (!href || isExternalOrNonRoute(href) || isDynamicValue(href)) return;
  if (!href.startsWith('/') || href.startsWith('/api/')) return;

  if (!routeExists(pageRoutes, href)) {
    errors.add(`File: ${file}\n  Broken page link: ${href}`);
  }
}

function validateApiCall(file, call, apiRoutes) {
  const { url, method, source } = call;
  if (!url || isExternalOrNonRoute(url) || isDynamicValue(url)) return;
  if (!url.startsWith('/api/')) return;

  const route = apiRouteForPath(apiRoutes, url);
  if (!route) {
    errors.add(`File: ${file}\n  Broken API endpoint: ${url}`);
    return;
  }

  if (route.methods.size === 0) {
    warnings.add(`File: ${route.file}\n  API route has no exported HTTP methods detected.`);
    return;
  }

  if (!route.methods.has(method)) {
    errors.add(
      `File: ${file}\n  API method mismatch: ${source} ${method} ${url}\n  Route file: ${route.file}\n  Available: ${Array.from(route.methods).sort().join(', ')}`
    );
  }
}

const allSourceFiles = findFiles(APP_SRC_DIR);
const { pageRoutes, apiRoutes } = buildRouteIndexes(allSourceFiles);
const files = allSourceFiles.filter(file => SOURCE_EXTENSIONS.some(ext => file.endsWith(ext)));

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  for (const href of collectPageLinks(content)) validatePageLink(file, href, pageRoutes);
  for (const call of collectApiCalls(content)) validateApiCall(file, call, apiRoutes);
}

if (warnings.size > 0) {
  console.warn('⚠️ Route warnings:\n');
  Array.from(warnings).sort().forEach(w => console.warn(w));
  console.warn('');
}

if (errors.size > 0) {
  console.error('❌ Broken internal links or endpoints found:\n');
  Array.from(errors).sort().forEach(e => console.error(e));
  process.exit(1);
}

console.log('✅ All internal page links and API endpoints are valid!');
