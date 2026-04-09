import { createVisionChat } from './vision-chat.js';
import { getVoice, setVoice, setAutoAdapt } from './voice-engine.js';

const app = document.getElementById('cockpitApp');
const overlay = document.getElementById('cockpitOverlay');
const visionConsole = document.getElementById('visionConsole');
const visionDock = document.getElementById('visionDock');
const settingsPanel = document.getElementById('settingsPanel');
const intelligencePanel = document.getElementById('intelligencePanel');
const voiceLabel = document.getElementById('visionVoiceLabel');
const visionIcon = document.getElementById('visionIcon');
const voiceSelect = document.getElementById('voiceSelect');
const autoAdaptToggle = document.getElementById('autoAdaptToggle');

const dockTargets = {
  insights: document.getElementById('dockInsights'),
  ideas: document.getElementById('dockIdeas'),
  alerts: document.getElementById('dockAlerts'),
  strategy: document.getElementById('dockStrategy')
};

let reminderTimer;
const scheduleReminder = () => {
  clearTimeout(reminderTimer);
  reminderTimer = setTimeout(() => {
    const pulseClass = getVoice().pulseClass;
    triggerPulse(pulseClass);
  }, 12000);
};

const triggerPulse = (pulseClass) => {
  const module = document.querySelector('.vision-module');
  module.classList.remove('pulse-anchor', 'pulse-rocket', 'pulse-glitch');
  module.classList.add(pulseClass);
  setTimeout(() => module.classList.remove(pulseClass), 2000);
};

const updateVoiceUI = (voice) => {
  voiceLabel.textContent = voice.label;
  visionIcon.textContent = voice.icon;
  voiceSelect.value = voice.key;
};

const chatSystem = createVisionChat({
  chatEl: document.getElementById('visionChat'),
  timelineEl: document.getElementById('missionTimeline'),
  onVoiceChange: updateVoiceUI,
  onPulse: () => {
    triggerPulse(getVoice().pulseClass);
    scheduleReminder();
  },
  dock: dockTargets
});

function togglePanel(panel) {
  [settingsPanel, intelligencePanel].forEach((p) => {
    if (p !== panel) p.classList.add('hidden');
  });
  panel.classList.toggle('hidden');
}

function setVisionOpen(open) {
  visionConsole.classList.toggle('open', open);
  if (!open) {
    visionConsole.classList.remove('command');
    overlay.classList.remove('command-mode');
    visionDock.classList.add('hidden');
  }
}

document.querySelectorAll('.hotspot').forEach((module) => {
  module.addEventListener('click', () => {
    const key = module.dataset.module;
    const route = module.dataset.route;

    if (key === 'vision') return setVisionOpen(!visionConsole.classList.contains('open'));
    if (key === 'settings') return togglePanel(settingsPanel);
    if (key === 'intelligence') return togglePanel(intelligencePanel);

    if (route) window.location.href = route;
  });
});

document.getElementById('visionClose').addEventListener('click', () => setVisionOpen(false));
document.getElementById('visionExpand').addEventListener('click', () => {
  const isCommand = visionConsole.classList.toggle('command');
  overlay.classList.toggle('command-mode', isCommand);
  visionDock.classList.toggle('hidden', !isCommand);
});

document.getElementById('visionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('visionInput');
  const value = input.value.trim();
  if (!value) return;
  input.value = '';
  await chatSystem.onUserMessage(value);
});

voiceSelect.addEventListener('change', () => {
  setVoice(voiceSelect.value);
  updateVoiceUI(getVoice());
});
autoAdaptToggle.addEventListener('change', () => setAutoAdapt(autoAdaptToggle.checked));

document.getElementById('themeToggle').addEventListener('change', (e) => {
  app.classList.toggle('theme-light', e.target.checked);
  app.classList.toggle('theme-dark', !e.target.checked);
});

updateVoiceUI(getVoice());
scheduleReminder();
