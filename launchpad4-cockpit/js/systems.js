const VOICE_KEY = 'lp4_voice';
const AUTO_VOICE_KEY = 'lp4_auto_voice';
const VALID_VOICES = ['anchor', 'rocket', 'glitch'];

function getSavedVoice() {
  const saved = window.localStorage.getItem(VOICE_KEY);
  return VALID_VOICES.includes(saved) ? saved : 'anchor';
}

function getAutoAdaptationState() {
  return window.localStorage.getItem(AUTO_VOICE_KEY) !== 'off';
}

function renderVoiceSelection(voice) {
  document.querySelectorAll('[data-voice-button]').forEach((button) => {
    const isActive = button.getAttribute('data-voice-button') === voice;
    button.classList.toggle('active', isActive);
  });

  const activeVoiceLabel = document.getElementById('activeVoiceValue');
  if (activeVoiceLabel) {
    activeVoiceLabel.textContent = voice.charAt(0).toUpperCase() + voice.slice(1);
  }
}

function renderAutoAdaptationState(isEnabled) {
  const toggle = document.getElementById('autoVoiceAdaptation');
  const state = document.getElementById('autoVoiceAdaptationState');

  if (toggle) {
    toggle.checked = isEnabled;
  }

  if (state) {
    state.textContent = isEnabled ? 'ON' : 'OFF';
  }
}

function setVoice(voice) {
  if (!VALID_VOICES.includes(voice)) {
    return;
  }

  window.localStorage.setItem(VOICE_KEY, voice);
  renderVoiceSelection(voice);
}

function setAutoVoiceAdaptation(isEnabled) {
  window.localStorage.setItem(AUTO_VOICE_KEY, isEnabled ? 'on' : 'off');
  renderAutoAdaptationState(Boolean(isEnabled));
}

function initIntelligenceControls() {
  const currentVoice = getSavedVoice();
  const autoState = getAutoAdaptationState();

  renderVoiceSelection(currentVoice);
  renderAutoAdaptationState(autoState);

  document.querySelectorAll('[data-voice-button]').forEach((button) => {
    button.addEventListener('click', () => {
      const voice = button.getAttribute('data-voice-button');
      if (voice) {
        setVoice(voice);
      }
    });
  });

  const toggle = document.getElementById('autoVoiceAdaptation');
  if (toggle) {
    toggle.addEventListener('change', () => {
      setAutoVoiceAdaptation(toggle.checked);
    });
  }
}

window.setVoice = setVoice;
window.setAutoVoiceAdaptation = setAutoVoiceAdaptation;

if (document.body.classList.contains('system-page')) {
  initIntelligenceControls();
}
