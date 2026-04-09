const voiceMap = {
  anchor: {
    label: '⚓ Anchor',
    icon: '⚓',
    speed: 34,
    pulseClass: 'pulse-anchor',
    tone: (input) => `Direct read: ${input.includes('help') ? 'Focus on your bottleneck first.' : 'Be specific, then execute with discipline.'}`
  },
  rocket: {
    label: '🚀 Rocket',
    icon: '🚀',
    speed: 14,
    pulseClass: 'pulse-rocket',
    tone: () => 'You have momentum. Let’s turn this into a measurable win this week.'
  },
  glitch: {
    label: '⚡ Glitch',
    icon: '⚡',
    speed: 22,
    pulseClass: 'pulse-glitch',
    tone: () => 'Chaos report: your funnel is spicy, but we can still make it print.'
  }
};

let activeVoice = 'anchor';
let autoAdapt = false;

export function setVoice(voice) {
  if (voiceMap[voice]) activeVoice = voice;
}

export function getVoice() {
  return { key: activeVoice, ...voiceMap[activeVoice] };
}

export function setAutoAdapt(value) {
  autoAdapt = Boolean(value);
}

export function pickVoiceForMessage(message) {
  if (!autoAdapt) return activeVoice;
  const m = message.toLowerCase();
  if (/(stuck|discouraged|overwhelmed|tired)/.test(m)) return 'rocket';
  if (/(truth|brutal|honest|reality)/.test(m)) return 'anchor';
  if (/(lol|joke|funny|meme)/.test(m)) return 'glitch';
  return activeVoice;
}

export function buildReply(input, forcedVoice) {
  const v = voiceMap[forcedVoice || activeVoice];
  return {
    text: v.tone(input),
    speed: v.speed,
    pulseClass: v.pulseClass,
    voiceLabel: v.label,
    icon: v.icon
  };
}
