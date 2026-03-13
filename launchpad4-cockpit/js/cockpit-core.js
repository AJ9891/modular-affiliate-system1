const routes = {
  navigation: '/pages/navigation.html',
  propulsion: '/pages/propulsion.html',
  communications: '/pages/communications.html',
  fuel: '/pages/fuel.html',
  radar: '/pages/radar.html',
  intelligence: '/pages/intelligence.html',
  settings: '/pages/settings.html',
  domains: '/pages/navigation.html'
};

// Module configuration (derived from cockpitModules.ts)
const MODULES = [
  {
    id: 'vision',
    name: 'Launchpad 4 Vision',
    route: '#vision',
    position: { x: '69%', y: '8%' }, // right-side placement (using left %)
    shape: { width: '26%', height: '26%', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
    isVision: true
  },
  {
    id: 'radar',
    name: 'Radar',
    route: '/pages/radar.html',
    position: { x: '69%', y: '45%' },
    shape: { width: '23%', height: '28%' }
  },
  {
    id: 'settings',
    name: 'Settings',
    route: '/pages/settings.html',
    position: { x: '82%', y: '62%' },
    shape: { width: '10%', height: '14%' }
  },
  {
    id: 'communications',
    name: 'Communications',
    route: '/pages/communications.html',
    position: { x: '6%', y: '10%' },
    shape: { width: '24%', height: '24%' }
  },
  {
    id: 'fuel',
    name: 'Fuel',
    route: '/pages/fuel.html',
    position: { x: '9%', y: '38%' },
    shape: { width: '22%', height: '18%' }
  },
  {
    id: 'propulsion',
    name: 'Propulsion',
    route: '/pages/propulsion.html',
    position: { x: '34%', y: '42%' },
    shape: { width: '20%', height: '16%' }
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    route: '/pages/intelligence.html',
    position: { x: '46%', y: '42%' },
    shape: { width: '20%', height: '16%' }
  },
  {
    id: 'navigation',
    name: 'Navigation',
    route: '/pages/navigation.html',
    position: { x: '44%', y: '60%' },
    shape: { width: '12%', height: '18%' }
  }
];
const VOICE_KEY = 'lp4_voice';
const AUTO_VOICE_KEY = 'lp4_auto_voice';

const VOICE_META = {
  anchor: {
    icon: '⚓',
    label: 'Anchor',
    subhead: 'System Analysis'
  },
  rocket: {
    icon: '🚀',
    label: 'Rocket',
    subhead: 'Supporting Response'
  },
  glitch: {
    icon: '⚡',
    label: 'Glitch',
    subhead: 'Questionable Advice Department'
  }
};

const visionPanel = document.getElementById('visionPanel');
const cockpit = document.getElementById('cockpit');
let visionHotspot = null;
const closeVisionButton = document.getElementById('closeVision');
const expandVisionButton = document.getElementById('expandVision');
const strategyImage = document.getElementById('strategyImage');
const visionDock = document.getElementById('visionDock');

const visionModuleLabel = document.getElementById('visionModuleLabel');
const visionVoiceHeader = document.getElementById('visionVoiceHeader');
const visionVoiceSubhead = document.getElementById('visionVoiceSubhead');
const crewMembers = document.querySelectorAll('[data-crew]');

const chatArea = document.getElementById('chatArea');
const chatInput = document.getElementById('chatInput');
const sendMessageButton = document.getElementById('sendMessage');
const timelineTrack = document.querySelector('.timeline-track');
const dockInsights = document.getElementById('dockInsights');
const dockSavedIdeas = document.getElementById('dockSavedIdeas');
const dockAlerts = document.getElementById('dockAlerts');
const dockStrategy = document.getElementById('dockStrategy');

const voiceRadios = document.querySelectorAll('input[name="voiceProfile"]');
const autoVoiceToggle = document.getElementById('autoVoiceToggle');
const autoVoiceState = document.getElementById('autoVoiceState');

let defaultVoice = window.localStorage.getItem(VOICE_KEY) || 'rocket';
let activeVoice = defaultVoice;
let autoVoiceAdaptation = window.localStorage.getItem(AUTO_VOICE_KEY) !== 'off';
let pulseResetTimer = null;
let revertVoiceTimer = null;
let missionTimelineSteps = ['Launch', 'Funnel', 'Optimization'];
let missionActiveIndex = 0;
const LAYOUT_KEY = 'cockpitLayout';
const LAYOUT_POLY_KEY = 'cockpitLayoutPoly';
let editMode = false;
let dragState = null;
let dragMoveState = null;
let vertexDragState = null;

function getSelectedModuleVoice() {
  const stored = window.localStorage.getItem(VOICE_KEY);
  return VOICE_META[stored] ? stored : defaultVoice;
}

function shouldReferenceMemory(text) {
  return /(remember|previous|earlier|last time|again|still)/i.test(text);
}

function getMissionContextString() {
  return missionTimelineSteps.join(' → ');
}

function updateMissionTimeline(steps, activeIndex) {
  if (!timelineTrack || !Array.isArray(steps) || steps.length === 0) {
    return;
  }

  missionTimelineSteps = [...steps];
  missionActiveIndex = Math.max(0, Math.min(activeIndex, missionTimelineSteps.length - 1));

  timelineTrack.innerHTML = '';

  missionTimelineSteps.forEach((step, i) => {
    const node = document.createElement('span');
    node.className = 'timeline-node';

    if (i === missionActiveIndex) {
      node.classList.add('active');
    }

    node.textContent = step;
    timelineTrack.appendChild(node);

    if (i < missionTimelineSteps.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'timeline-arrow';
      arrow.textContent = '→';
      timelineTrack.appendChild(arrow);
    }
  });
}

function inferMissionActiveIndex(text) {
  const content = text.toLowerCase();

  if (/(strategy|adjust|optimi|improve|next move|plan)/.test(content)) {
    return 2;
  }

  if (/(funnel|landing page|conversion|checkout|drop[ -]?off)/.test(content)) {
    return 1;
  }

  if (/(launch|launched|deploy|go live|publish)/.test(content)) {
    return 0;
  }

  return missionActiveIndex;
}

function updateMissionTimelineFromConversation(text) {
  const nextIndex = inferMissionActiveIndex(text);
  const changed = nextIndex !== missionActiveIndex;
  updateMissionTimeline(missionTimelineSteps, nextIndex);
  return changed;
}

function setPersonality(mode) {
  const root = document.documentElement;

  const personalities = {
    strategic: 'rgba(0,255,255,0.9)',
    commander: 'rgba(0,120,255,0.9)',
    visionary: 'rgba(160,80,255,0.9)',
    guardian: 'rgba(0,200,140,0.9)',
    catalyst: 'rgba(255,170,0,0.9)'
  };

  if (personalities[mode]) {
    root.style.setProperty('--glow-color', personalities[mode]);
  }
}

function setMode(mode) {
  const root = document.documentElement;

  if (mode === 'glitch') {
    root.style.setProperty('--glow-color', 'rgba(255,0,255,0.9)');
    root.style.setProperty('--pulse-duration', '0.9s');
    document.body.classList.add('glitch-mode');
  }

  if (mode === 'anchor') {
    root.style.setProperty('--glow-color', 'rgba(0,180,160,0.9)');
    root.style.setProperty('--pulse-duration', '1.6s');
    document.body.classList.remove('glitch-mode');
  }

  if (mode === 'rocket') {
    root.style.setProperty('--glow-color', 'rgba(0,150,255,1)');
    root.style.setProperty('--pulse-duration', '0.8s');
    document.body.classList.remove('glitch-mode');
  }
}

function applyVoiceVisuals(voice) {
  const panel = document.querySelector('.vision-panel');
  if (!panel) {
    return;
  }

  panel.style.animation = '';

  if (voice === 'anchor') {
    panel.style.filter = 'brightness(0.9)';
    panel.style.setProperty('--scan-speed', '9s');
  }

  if (voice === 'rocket') {
    panel.style.filter = 'brightness(1.1)';
    panel.style.setProperty('--scan-speed', '7s');
  }

  if (voice === 'glitch') {
    panel.style.filter = 'brightness(1)';
    panel.style.setProperty('--scan-speed', '6s');
    panel.style.animation = 'glitchFlash 6s infinite';
  }
}

function applyVoiceIndicators(voice) {
  const meta = VOICE_META[voice] || VOICE_META.anchor;

  if (visionModuleLabel) {
    visionModuleLabel.textContent = `${meta.icon} Launchpad 4 Vision`;
  }

  if (visionVoiceHeader) {
    visionVoiceHeader.textContent = `${meta.icon} ${meta.label}`;
  }

  if (visionVoiceSubhead) {
    visionVoiceSubhead.textContent = meta.subhead;
  }

  crewMembers.forEach((member) => {
    const isActive = member.getAttribute('data-crew') === voice;
    member.classList.toggle('active', isActive);
  });
}

function setActiveVoice(voice) {
  if (!VOICE_META[voice]) {
    return;
  }
  activeVoice = voice;
  applyVoiceIndicators(activeVoice);
  applyVoiceVisuals(activeVoice);
}

function setVoice(voice) {
  if (!VOICE_META[voice]) {
    return;
  }

  defaultVoice = voice;
  window.localStorage.setItem(VOICE_KEY, voice);

  setMode(voice);
  setActiveVoice(voice);

  const visionModule = document.querySelector('.vision');
  if (visionModule) {
    visionModule.style.boxShadow = '0 0 35px var(--glow-color)';
    window.setTimeout(() => {
      visionModule.style.boxShadow = '';
    }, 500);
  }

  syncIntelligencePanel();
}

function setAutoVoiceAdaptation(isEnabled) {
  autoVoiceAdaptation = Boolean(isEnabled);
  window.localStorage.setItem(AUTO_VOICE_KEY, autoVoiceAdaptation ? 'on' : 'off');

  if (autoVoiceToggle) {
    autoVoiceToggle.checked = autoVoiceAdaptation;
  }

  if (autoVoiceState) {
    autoVoiceState.textContent = autoVoiceAdaptation ? 'ON' : 'OFF';
  }
}

function syncIntelligencePanel() {
  voiceRadios.forEach((radio) => {
    radio.checked = radio.value === defaultVoice;
  });

  if (autoVoiceToggle) {
    autoVoiceToggle.checked = autoVoiceAdaptation;
  }

  if (autoVoiceState) {
    autoVoiceState.textContent = autoVoiceAdaptation ? 'ON' : 'OFF';
  }
}

function stopVisionSignal() {
  const visionModule = document.querySelector('.vision');
  if (visionModule) {
    visionModule.style.animation = '';
  }

  if (pulseResetTimer) {
    window.clearTimeout(pulseResetTimer);
    pulseResetTimer = null;
  }
}

function hideVisionDock() {
  if (visionDock) {
    visionDock.style.display = 'none';
    visionDock.setAttribute('aria-hidden', 'true');
  }
}

function showVisionDock() {
  if (visionDock) {
    visionDock.style.display = 'flex';
    visionDock.setAttribute('aria-hidden', 'false');
  }
}

function openVision() {
  if (editMode) {
    return;
  }
  stopVisionSignal();
  visionPanel.classList.add('vision-open');
  visionPanel.classList.remove('vision-expanded');
  visionPanel.setAttribute('aria-hidden', 'false');
  cockpit.classList.remove('dimmed');
  hideVisionDock();
}

function closeVision() {
  visionPanel.classList.remove('vision-open');
  visionPanel.classList.remove('vision-expanded');
  visionPanel.setAttribute('aria-hidden', 'true');
  cockpit.classList.remove('dimmed');
  hideVisionDock();
}

function expandFull() {
  stopVisionSignal();
  visionPanel.classList.add('vision-open');
  visionPanel.classList.add('vision-expanded');
  cockpit.classList.add('dimmed');
  showVisionDock();
}

function openModule(module) {
  const route = routes[module];
  if (editMode) {
    return;
  }
  if (!route) {
    return;
  }

  window.location.href = route;
}

function openIntelligence() {
  openModule('intelligence');
}

function closeIntelligence() {
  return;
}

function expandImage() {
  expandFull();
  window.setTimeout(() => {
    openModule('radar');
  }, 800);
}

/* --------------------------
 * Layout editor (drag corners)
 * -------------------------- */
function percentifyRect(rect, parentRect) {
  return {
    left: ((rect.left - parentRect.left) / parentRect.width) * 100,
    top: ((rect.top - parentRect.top) / parentRect.height) * 100,
    width: (rect.width / parentRect.width) * 100,
    height: (rect.height / parentRect.height) * 100
  };
}

function applyLayoutToModule(module, layoutEntry) {
  if (!layoutEntry) return;
  module.style.left = `${layoutEntry.left}%`;
  module.style.top = `${layoutEntry.top}%`;
  module.style.width = `${layoutEntry.width}%`;
  module.style.height = `${layoutEntry.height}%`;
  module.style.right = '';
}

function saveLayout() {
  const layout = {};
  const parentRect = cockpit.getBoundingClientRect();
  document.querySelectorAll('.module').forEach((mod) => {
    const key = mod.dataset.key || mod.dataset.route || mod.dataset.action;
    if (!key) return;
    const rect = mod.getBoundingClientRect();
    layout[key] = percentifyRect(rect, parentRect);
  });
  window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
}

function loadLayout() {
  const saved = window.localStorage.getItem(LAYOUT_KEY);
  if (!saved) return;
  const layout = JSON.parse(saved);
  document.querySelectorAll('.module').forEach((mod) => {
    const key = mod.dataset.key || mod.dataset.route || mod.dataset.action;
    if (layout[key]) {
      applyLayoutToModule(mod, layout[key]);
    }
  });
}

function addHandles(module) {
  const positions = ['nw', 'ne', 'sw', 'se'];
  positions.forEach((pos) => {
    const handle = document.createElement('div');
    handle.className = `resize-handle ${pos}`;
    handle.dataset.dir = pos;
    module.appendChild(handle);
  });
}

function enableEditMode(flag) {
  editMode = flag;
  document.querySelectorAll('.module').forEach((mod) => {
    mod.classList.toggle('edit-mode', flag);
    if (flag && !mod.querySelector('.vertex-handle')) {
      addVertexHandles(mod);
    }
  });

  if (!flag) {
    dragState = null;
    dragMoveState = null;
    vertexDragState = null;
    document.removeEventListener('mousemove', onHandleMouseMove);
    document.removeEventListener('mouseup', onHandleMouseUp);
    document.removeEventListener('mousemove', onModuleMouseMove);
    document.removeEventListener('mouseup', onModuleMouseUp);
    document.removeEventListener('mousemove', onVertexMouseMove);
    document.removeEventListener('mouseup', onVertexMouseUp);
  }
}

function onHandleMouseDown(e) {
  if (!editMode) return;
  const handle = e.target;
  if (!handle.classList.contains('resize-handle')) return;
  const module = handle.closest('.module');
  if (!module) return;

  e.preventDefault();
  e.stopPropagation();

  const parentRect = cockpit.getBoundingClientRect();
  const modRect = module.getBoundingClientRect();

  dragState = {
    module,
    dir: handle.dataset.dir,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    startLeft: modRect.left,
    startTop: modRect.top,
    startWidth: modRect.width,
    startHeight: modRect.height,
    parentRect
  };

  document.addEventListener('mousemove', onHandleMouseMove);
  document.addEventListener('mouseup', onHandleMouseUp);
}

function onHandleMouseMove(e) {
  if (!dragState) return;

  const dx = e.clientX - dragState.startMouseX;
  const dy = e.clientY - dragState.startMouseY;
  let newLeft = dragState.startLeft;
  let newTop = dragState.startTop;
  let newWidth = dragState.startWidth;
  let newHeight = dragState.startHeight;

  if (dragState.dir.includes('e')) {
    newWidth = dragState.startWidth + dx;
  }
  if (dragState.dir.includes('s')) {
    newHeight = dragState.startHeight + dy;
  }
  if (dragState.dir.includes('w')) {
    newWidth = dragState.startWidth - dx;
    newLeft = dragState.startLeft + dx;
  }
  if (dragState.dir.includes('n')) {
    newHeight = dragState.startHeight - dy;
    newTop = dragState.startTop + dy;
  }

  // Clamp
  const minSize = 30;
  newWidth = Math.max(minSize, newWidth);
  newHeight = Math.max(minSize, newHeight);

  // Keep within cockpit
  const maxLeft = dragState.parentRect.left + dragState.parentRect.width - newWidth;
  const maxTop = dragState.parentRect.top + dragState.parentRect.height - newHeight;
  newLeft = Math.min(Math.max(newLeft, dragState.parentRect.left), maxLeft);
  newTop = Math.min(Math.max(newTop, dragState.parentRect.top), maxTop);

  const pct = percentifyRect(
    {
      left: newLeft,
      top: newTop,
      width: newWidth,
      height: newHeight
    },
    dragState.parentRect
  );

  const mod = dragState.module;
  mod.style.left = `${pct.left}%`;
  mod.style.top = `${pct.top}%`;
  mod.style.width = `${pct.width}%`;
  mod.style.height = `${pct.height}%`;
  mod.style.right = '';
}

function onHandleMouseUp() {
  document.removeEventListener('mousemove', onHandleMouseMove);
  document.removeEventListener('mouseup', onHandleMouseUp);
  if (dragState) {
    saveLayout();
  }
  dragState = null;
}

function onModuleMouseDown(e) {
  if (!editMode) return;
  const target = e.target;
  if (target.classList.contains('resize-handle')) return; // resize handled elsewhere
  const module = target.closest('.module');
  if (!module) return;

  e.preventDefault();
  e.stopPropagation();

  const parentRect = cockpit.getBoundingClientRect();
  const modRect = module.getBoundingClientRect();

  dragMoveState = {
    module,
    startMouseX: e.clientX,
    startMouseY: e.clientY,
    startLeft: modRect.left,
    startTop: modRect.top,
    width: modRect.width,
    height: modRect.height,
    parentRect
  };

  document.addEventListener('mousemove', onModuleMouseMove);
  document.addEventListener('mouseup', onModuleMouseUp);
}

function onModuleMouseMove(e) {
  if (!dragMoveState) return;

  const dx = e.clientX - dragMoveState.startMouseX;
  const dy = e.clientY - dragMoveState.startMouseY;

  let newLeft = dragMoveState.startLeft + dx;
  let newTop = dragMoveState.startTop + dy;

  // clamp within cockpit
  const { parentRect, width, height } = dragMoveState;
  const maxLeft = parentRect.left + parentRect.width - width;
  const maxTop = parentRect.top + parentRect.height - height;
  newLeft = Math.min(Math.max(newLeft, parentRect.left), maxLeft);
  newTop = Math.min(Math.max(newTop, parentRect.top), maxTop);

  const pct = percentifyRect(
    { left: newLeft, top: newTop, width, height },
    parentRect
  );

  const mod = dragMoveState.module;
  mod.style.left = `${pct.left}%`;
  mod.style.top = `${pct.top}%`;
  mod.style.width = `${pct.width}%`;
  mod.style.height = `${pct.height}%`;
  mod.style.right = '';
}

function onModuleMouseUp() {
  document.removeEventListener('mousemove', onModuleMouseMove);
  document.removeEventListener('mouseup', onModuleMouseUp);
  if (dragMoveState) {
    saveLayout();
  }
  dragMoveState = null;
}

function resetLayout() {
  window.localStorage.removeItem(LAYOUT_KEY);
  window.location.reload();
}

function initLayoutEditor() {
  // Layout is locked by default; we still load saved layout and vertex polygons for correctness.
  loadLayout();

  document.querySelectorAll('.module').forEach((mod) => {
    mod.addEventListener('mousedown', onModuleMouseDown);
    mod.addEventListener('mousedown', onVertexMouseDown);
    if (!mod.querySelector('.vertex-handle')) {
      addVertexHandles(mod);
    }
  });
}

/* ---------- Polygonal corner editing for warp-fit ---------- */
function getModuleKey(mod) {
  return mod.dataset.key || mod.dataset.route || mod.dataset.action;
}

function loadPolyLayout() {
  const saved = window.localStorage.getItem(LAYOUT_POLY_KEY);
  return saved ? JSON.parse(saved) : {};
}

function savePolyLayout(layout) {
  window.localStorage.setItem(LAYOUT_POLY_KEY, JSON.stringify(layout));
}

function getOrCreatePoly(mod, layout) {
  const key = getModuleKey(mod);
  if (!key) return null;
  if (layout[key]) return layout[key];

  const parentRect = cockpit.getBoundingClientRect();
  const rect = mod.getBoundingClientRect();
  const pct = percentifyRect(rect, parentRect);
  const poly = [
    { x: pct.left, y: pct.top },
    { x: pct.left + pct.width, y: pct.top },
    { x: pct.left + pct.width, y: pct.top + pct.height },
    { x: pct.left, y: pct.top + pct.height }
  ];
  layout[key] = poly;
  return poly;
}

function applyPoly(mod, poly) {
  if (!poly) return;
  // cover cockpit; polygon defines hit area
  mod.style.left = '0';
  mod.style.top = '0';
  mod.style.width = '100%';
  mod.style.height = '100%';

  const points = poly.map((p) => `${p.x}% ${p.y}%`).join(', ');
  mod.style.clipPath = `polygon(${points})`;
  mod.style.webkitClipPath = `polygon(${points})`;

  // center label at polygon centroid
  const label = mod.querySelector('span');
  if (label) {
    const cx = poly.reduce((s, p) => s + p.x, 0) / poly.length;
    const cy = poly.reduce((s, p) => s + p.y, 0) / poly.length;
    label.style.left = `${cx}%`;
    label.style.top = `${cy}%`;
    label.classList.add('label');
  }

  // vertex handles position
  const handles = mod.querySelectorAll('.vertex-handle');
  handles.forEach((h, idx) => {
    const pt = poly[idx];
    if (pt) {
      h.style.left = `${pt.x}%`;
      h.style.top = `${pt.y}%`;
    }
  });
}

function addVertexHandles(mod) {
  const layout = loadPolyLayout();
  const poly = getOrCreatePoly(mod, layout);
  savePolyLayout(layout);

  // only add once
  if (!mod.querySelector('.vertex-handle')) {
    for (let i = 0; i < 4; i += 1) {
      const handle = document.createElement('div');
      handle.className = 'vertex-handle';
      handle.dataset.vertex = String(i);
      mod.appendChild(handle);
    }
  }
  applyPoly(mod, poly);
}

function onVertexMouseDown(e) {
  if (!editMode) return;
  const handle = e.target;
  if (!handle.classList.contains('vertex-handle')) return;
  const module = handle.closest('.module');
  if (!module) return;

  e.preventDefault();
  e.stopPropagation();

  const layout = loadPolyLayout();
  const key = getModuleKey(module);
  const poly = getOrCreatePoly(module, layout);

  vertexDragState = {
    module,
    key,
    poly,
    index: Number(handle.dataset.vertex),
    parentRect: cockpit.getBoundingClientRect()
  };

  document.addEventListener('mousemove', onVertexMouseMove);
  document.addEventListener('mouseup', onVertexMouseUp);
}

function onVertexMouseMove(e) {
  if (!vertexDragState) return;
  const { parentRect, poly, index } = vertexDragState;
  const x = ((e.clientX - parentRect.left) / parentRect.width) * 100;
  const y = ((e.clientY - parentRect.top) / parentRect.height) * 100;

  poly[index] = {
    x: Math.min(Math.max(x, 0), 100),
    y: Math.min(Math.max(y, 0), 100)
  };

  applyPoly(vertexDragState.module, poly);
}

function onVertexMouseUp() {
  document.removeEventListener('mousemove', onVertexMouseMove);
  document.removeEventListener('mouseup', onVertexMouseUp);
  if (vertexDragState) {
    const layout = loadPolyLayout();
    layout[vertexDragState.key] = vertexDragState.poly;
    savePolyLayout(layout);
  }
  vertexDragState = null;
}

/* ---------- Render modules from config ---------- */
function renderModules() {
  if (!cockpit) return;

  // remove any existing module buttons (safety)
  cockpit.querySelectorAll('.module').forEach((m) => m.remove());

  MODULES.forEach((modConfig) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'module';
    btn.dataset.key = modConfig.id;
    if (modConfig.route) {
      btn.dataset.route = modConfig.route.replace('/pages/', '').replace('.html', '');
    }
    if (modConfig.isVision) {
      btn.dataset.action = 'vision';
      btn.classList.add('vision', 'vision-module');
    }

    // positioning
    if (modConfig.position?.x) btn.style.left = modConfig.position.x;
    if (modConfig.position?.y) btn.style.top = modConfig.position.y;
    if (modConfig.shape?.width) btn.style.width = modConfig.shape.width;
    if (modConfig.shape?.height) btn.style.height = modConfig.shape.height;

    // clip path from corners or provided clipPath
    if (modConfig.shape?.corners && modConfig.shape.corners.length === 4) {
      const pts = modConfig.shape.corners.map((c) => `${c.x}% ${c.y}%`).join(', ');
      btn.style.clipPath = `polygon(${pts})`;
      btn.style.webkitClipPath = `polygon(${pts})`;
    } else if (modConfig.shape?.clipPath) {
      btn.style.clipPath = modConfig.shape.clipPath;
      btn.style.webkitClipPath = modConfig.shape.clipPath;
    }

    const label = document.createElement('span');
    label.textContent = modConfig.name;
    btn.appendChild(label);

    // insert before vision panel so panel stays on top layer
    cockpit.insertBefore(btn, visionPanel);
  });
}

function inferAdaptiveVoice(message) {
  const text = message.toLowerCase();

  if (/(discouraged|quit|quitting|stuck|overwhelmed|drained|burned out)/.test(text)) {
    return 'rocket';
  }

  if (/(ridiculous|absurd|lol|haha|meme|chaos|joke)/.test(text)) {
    return 'glitch';
  }

  if (/(truth|direct|analy|break point|fix it)/.test(text)) {
    return 'anchor';
  }

  return null;
}

function buildVisionResponse(message, voice) {
  const text = message.toLowerCase();

  if (voice === 'rocket') {
    if (/(discouraged|quit|quitting|stuck|overwhelmed)/.test(text)) {
      return "Hey - that feeling is normal. Launching takes courage, and you did it. Let's regroup and choose the next move together.";
    }
    return 'Momentum is still alive. Take one clean step now and we build from there.';
  }

  if (voice === 'glitch') {
    if (/(ridiculous|absurd|joke|meme)/.test(text)) {
      return 'Because sometimes it is ridiculous. The internet is chaos in a suit. Where exactly did yours break?';
    }
    return 'Chaos acknowledged. Give me the exact leak point and we patch the weirdness.';
  }

  if (/(funnel|bombed|failed|broke|break point)/.test(text)) {
    return "Alright. The launch didn't land. That's feedback, not a crisis. Let's find the break point and fix it.";
  }

  return 'Direct read: isolate the bottleneck, simplify the next step, then relaunch with one controlled change.';
}

function scrollChatToBottom() {
  chatArea.scrollTop = chatArea.scrollHeight;
}

function appendUserMessage(text) {
  const row = document.createElement('p');
  const role = document.createElement('strong');
  role.textContent = 'You:';
  row.appendChild(role);
  row.append(` ${text}`);
  chatArea.appendChild(row);
  scrollChatToBottom();
}

function getTypingIndicatorText(voice) {
  if (voice === 'rocket') {
    return 'Rocket is responding...';
  }

  if (voice === 'glitch') {
    return 'Glitch is... doing something questionable...';
  }

  return 'Anchor is considering...';
}

function showTypingIndicator(voice) {
  const row = document.createElement('p');
  row.className = 'typing-indicator';
  row.textContent = getTypingIndicatorText(voice);
  chatArea.appendChild(row);
  scrollChatToBottom();
  return row;
}

function getTypingDelay(voice, char) {
  if (voice === 'anchor') {
    if (char === '.' || char === '!' || char === '?') {
      return 400;
    }
    return 45;
  }

  if (voice === 'rocket') {
    if (char === '.' || char === '!') {
      return 200;
    }
    return 30;
  }

  if (voice === 'glitch') {
    if (Math.random() < 0.1) {
      return 300;
    }
    return Math.round(10 + Math.random() * 50);
  }

  return 40;
}

function typeVisionMessage(text, voiceForMessage, onDone) {
  const meta = VOICE_META[voiceForMessage] || VOICE_META.anchor;
  const row = document.createElement('p');
  const role = document.createElement('strong');
  role.textContent = `${meta.icon} ${meta.label}:`;
  row.appendChild(role);
  row.append(' ');
  chatArea.appendChild(row);
  scrollChatToBottom();

  let index = 0;

  function typeNext() {
    if (index >= text.length) {
      if (onDone) {
        onDone();
      }
      return;
    }

    const char = text.charAt(index);
    row.append(char);
    index += 1;
    scrollChatToBottom();
    window.setTimeout(typeNext, getTypingDelay(voiceForMessage, char));
  }

  typeNext();
}

function typeMessage(text, voiceForMessage = activeVoice, onDone) {
  typeVisionMessage(text, voiceForMessage, onDone);
}

function addDockItem(listEl, text) {
  if (!listEl || !text) {
    return;
  }

  const item = document.createElement('li');
  item.textContent = text;
  listEl.prepend(item);

  while (listEl.children.length > 5) {
    listEl.removeChild(listEl.lastElementChild);
  }
}

function updateVisionDock(message) {
  const normalized = message.replace(/^Context memory:[^.]*\.\s*/i, '').trim();
  const lower = normalized.toLowerCase();

  if (/(alert|warning|risk|drop|decrease|issue|critical)/.test(lower)) {
    addDockItem(dockAlerts, normalized);
    return;
  }

  if (/(idea|test|try|experiment|consider|could)/.test(lower)) {
    addDockItem(dockSavedIdeas, normalized);
    return;
  }

  if (/(strategy|phase|plan|roadmap|next move|relaunch)/.test(lower)) {
    addDockItem(dockStrategy, normalized);
    return;
  }

  addDockItem(dockInsights, normalized);
}

function signalVisionMessage(voice = activeVoice) {
  const visionModule = document.querySelector('.vision');
  if (!visionModule || !visionPanel) {
    return;
  }

  if (visionPanel.classList.contains('vision-open')) {
    stopVisionSignal();
    return;
  }

  let animationName = '';

  if (voice === 'anchor') {
    animationName = 'pulse-anchor';
  }

  if (voice === 'rocket') {
    animationName = 'pulse-rocket';
  }

  if (voice === 'glitch') {
    animationName = 'pulse-glitch';
  }

  visionModule.style.animation = `${animationName} var(--pulse-duration) ease-in-out 2`;

  if (pulseResetTimer) {
    window.clearTimeout(pulseResetTimer);
  }

  pulseResetTimer = window.setTimeout(() => {
    visionModule.style.animation = '';
    pulseResetTimer = null;
  }, 2400);
}

function handleUserMessage() {
  const message = chatInput?.value.trim();
  if (!message) {
    return;
  }

  appendUserMessage(message);
  chatInput.value = '';

  const contextChanged = updateMissionTimelineFromConversation(message);
  const selectedVoice = getSelectedModuleVoice();
  defaultVoice = selectedVoice;
  let responseVoice = selectedVoice;

  if (autoVoiceAdaptation) {
    const inferred = inferAdaptiveVoice(message);
    if (inferred) {
      responseVoice = inferred;
    }
  }

  if (revertVoiceTimer) {
    window.clearTimeout(revertVoiceTimer);
    revertVoiceTimer = null;
  }

  setActiveVoice(responseVoice);

  const memoryReference = shouldReferenceMemory(message) || contextChanged;
  const baseResponse = buildVisionResponse(message, responseVoice);
  const response =
    memoryReference && missionTimelineSteps.length > 1
      ? `Context memory: ${getMissionContextString()}. ${baseResponse}`
      : baseResponse;
  const typingIndicator = showTypingIndicator(responseVoice);

  window.setTimeout(() => {
    typingIndicator.remove();
    typeVisionMessage(response, responseVoice, () => {
      updateVisionDock(response);
      signalVisionMessage(responseVoice);

      if (responseVoice !== getSelectedModuleVoice()) {
        revertVoiceTimer = window.setTimeout(() => {
          setActiveVoice(getSelectedModuleVoice());
          revertVoiceTimer = null;
        }, 1200);
      }
    });
  }, 180);
}

function newAIMessage(text = 'New mission signal received.') {
  updateMissionTimelineFromConversation(text);
  const selectedVoice = getSelectedModuleVoice();
  defaultVoice = selectedVoice;
  setActiveVoice(selectedVoice);
  const typingIndicator = showTypingIndicator(selectedVoice);
  window.setTimeout(() => {
    typingIndicator.remove();
    typeVisionMessage(text, selectedVoice, () => {
      updateVisionDock(text);
      signalVisionMessage(selectedVoice);
    });
  }, 150);
}

renderModules();
visionHotspot = document.querySelector('[data-action="vision"]');

visionHotspot?.addEventListener('click', openVision);
closeVisionButton?.addEventListener('click', closeVision);
expandVisionButton?.addEventListener('click', expandFull);
strategyImage?.addEventListener('click', expandImage);

sendMessageButton?.addEventListener('click', handleUserMessage);
chatInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleUserMessage();
  }
});

document.querySelectorAll('[data-route]').forEach((el) => {
  el.addEventListener('click', () => {
    const route = el.getAttribute('data-route');
    if (route) {
      openModule(route);
    }
  });
});

document.querySelector('form.grid')?.addEventListener('submit', (event) => {
  event.preventDefault();
});

voiceRadios.forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      setVoice(radio.value);
    }
  });
});

autoVoiceToggle?.addEventListener('change', () => {
  setAutoVoiceAdaptation(autoVoiceToggle.checked);
});

window.setPersonality = setPersonality;
window.setMode = setMode;
window.setVoice = setVoice;
window.setAutoVoiceAdaptation = setAutoVoiceAdaptation;
window.openIntelligence = openIntelligence;
window.closeIntelligence = closeIntelligence;
window.openModule = openModule;
window.signalVisionMessage = signalVisionMessage;
window.newAIMessage = newAIMessage;
window.typeMessage = typeMessage;

setMode(defaultVoice);
setActiveVoice(defaultVoice);
syncIntelligencePanel();
updateMissionTimeline(missionTimelineSteps, missionActiveIndex);
hideVisionDock();
initLayoutEditor();
