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
const visionHotspot = document.querySelector('[data-action="vision"]');
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

let defaultVoice = window.localStorage.getItem(VOICE_KEY) || 'anchor';
let activeVoice = defaultVoice;
let autoVoiceAdaptation = window.localStorage.getItem(AUTO_VOICE_KEY) !== 'off';
let pulseResetTimer = null;
let revertVoiceTimer = null;
let missionTimelineSteps = ['Launch', 'Funnel', 'Optimization'];
let missionActiveIndex = 0;

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
