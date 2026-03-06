const cannedReplies = {
  radar: {
    text: 'Radar confirms traffic vectors are stable. Real-time conversion flow remains within target limits.'
  },
  funnel: {
    text: 'Funnel pressure point detected at mid-stage. Tighten the transition and simplify offer framing.'
  },
  optimization: {
    text: 'Optimization pass ready: prioritize headline clarity, then test CTA contrast and checkout pacing.'
  },
  image: {
    text: 'Visual snapshot loaded from cockpit feed.',
    imageSrc: 'assets/dashboard-dark.png',
    imageAlt: 'Cockpit dashboard snapshot'
  }
};

const pageContext =
  typeof window !== 'undefined'
    ? window.location.pathname.split('/').pop().replace('.html', '')
    : '';

const visionContext = {
  navigation: "You're managing domains and routing.",
  propulsion: 'Funnels control how customers move through your system.',
  communications: 'Email communications are active.',
  fuel: 'Subscription and billing systems are online.',
  radar: 'Real-time analytics radar is active.',
  intelligence: 'AI configuration and voice systems are available.',
  settings: 'System settings and mission controls are available.'
};

const visionFollowUp = {
  navigation: 'Need help validating routing and SSL readiness?',
  propulsion: 'Need help diagnosing a funnel break point?',
  communications: 'Need help planning your next broadcast sequence?',
  fuel: 'Want help reviewing revenue flow?',
  radar: 'Need help interpreting traffic signals?',
  intelligence: 'Need help tuning voice adaptation behavior?',
  settings: 'Need help calibrating notifications and AI behavior?'
};

function inferVoice(text) {
  const lcText = text.toLowerCase();

  if (/(discouraged|stuck|overwhelmed|can\'t|demotivated)/.test(lcText)) {
    return 'rocket';
  }

  if (/(brutal|truth|direct|honest|straight)/.test(lcText)) {
    return 'anchor';
  }

  if (/(joke|funny|meme|chaos|lol|haha)/.test(lcText)) {
    return 'glitch';
  }

  if (/(urgent|fast|now|boost|launch)/.test(lcText)) {
    return 'rocket';
  }

  return null;
}

function irregularDelay() {
  const bursts = [120, 180, 260, 430, 520];
  return bursts[Math.floor(Math.random() * bursts.length)];
}

function resolveTypingDelay(voiceId, typingSpeed) {
  if (voiceId === 'glitch') {
    return irregularDelay();
  }

  const map = { slow: 860, normal: 420, fast: 170 };
  return map[typingSpeed] || map.normal;
}

function buildReply(message) {
  const lower = message.toLowerCase();

  if (/(image|visual|screenshot|dashboard)/.test(lower)) {
    return cannedReplies.image;
  }

  if (/(funnel|landing|page|route)/.test(lower)) {
    return cannedReplies.funnel;
  }

  if (/(optimi|conversion|scale|improve)/.test(lower)) {
    return cannedReplies.optimization;
  }

  if (/(radar|traffic|analytics)/.test(lower)) {
    return cannedReplies.radar;
  }

  return {
    text: 'Vision acknowledges. Mission model updated with your latest operator input.'
  };
}

function styleByTone(text, tone) {
  if (tone === 'encouraging') {
    return `You have this. ${text}`;
  }

  if (tone === 'playful') {
    return `Chaotic-friendly note: ${text}`;
  }

  if (tone === 'direct') {
    return `Direct read: ${text}`;
  }

  return `Analysis: ${text}`;
}

export function initVisionChat(rootEl, options = {}) {
  if (!rootEl) {
    throw new Error('Vision chat root element is required.');
  }

  const {
    onChatActivity,
    onAutoVoiceSwitch,
    onTopicDetected,
    getActiveVoice,
    getVoiceConfig,
    isAutoAdaptationEnabled
  } = options;

  const logEl = document.createElement('div');
  logEl.className = 'chat-log';

  const formEl = document.createElement('form');
  formEl.className = 'chat-form';

  const inputEl = document.createElement('input');
  inputEl.type = 'text';
  inputEl.placeholder = 'Ask Vision...';
  inputEl.setAttribute('aria-label', 'Ask Launchpad 4 Vision');

  const submitEl = document.createElement('button');
  submitEl.type = 'submit';
  submitEl.textContent = 'Send';

  formEl.appendChild(inputEl);
  formEl.appendChild(submitEl);
  rootEl.appendChild(logEl);
  rootEl.appendChild(formEl);

  function pushMessage(role, payload, meta = {}) {
    const message = typeof payload === 'string' ? { text: payload } : payload;
    const row = document.createElement('article');
    row.className = 'chat-item';

    row.innerHTML = `<strong>${role}:</strong> ${message.text}`;

    if (message.imageSrc) {
      const image = document.createElement('img');
      image.src = message.imageSrc;
      image.alt = message.imageAlt || 'Vision response image';
      row.appendChild(image);
    }

    logEl.appendChild(row);
    logEl.scrollTop = logEl.scrollHeight;

    onChatActivity?.(role, message, meta);
  }

  function addTypingLine() {
    const typing = document.createElement('p');
    typing.className = 'typing-line';
    typing.innerHTML = 'Vision typing <span class="dots"><span></span><span></span><span></span></span>';
    logEl.appendChild(typing);
    logEl.scrollTop = logEl.scrollHeight;
    return typing;
  }

  pushMessage('Vision', 'Cockpit interface online. Awaiting your objective.', {
    isAi: true,
    voiceId: 'anchor'
  });

  formEl.addEventListener('submit', (event) => {
    event.preventDefault();

    const messageText = inputEl.value.trim();
    if (!messageText) {
      return;
    }

    pushMessage('You', messageText, { isAi: false });
    inputEl.value = '';

    onTopicDetected?.(messageText);

    const inferredVoice = inferVoice(messageText);
    if (isAutoAdaptationEnabled?.() && inferredVoice && inferredVoice !== getActiveVoice?.()) {
      onAutoVoiceSwitch?.(inferredVoice);
    }

    const voiceId = getActiveVoice?.() || 'anchor';
    const config = getVoiceConfig?.() || { tone: 'direct', typingSpeed: 'normal' };

    const typingLine = addTypingLine();
    const delay = resolveTypingDelay(voiceId, config.typingSpeed);

    window.setTimeout(() => {
      typingLine.remove();

      const reply = buildReply(messageText);
      pushMessage(
        'Vision',
        {
          ...reply,
          text: styleByTone(reply.text, config.tone)
        },
        {
          isAi: true,
          voiceId
        }
      );
    }, delay);
  });

  return {
    pushSystemMessage(text) {
      const voiceId = getActiveVoice?.() || 'anchor';
      pushMessage('Vision', text, { isAi: true, voiceId });
    }
  };
}

export function openNavigation() {
  window.location.href = '/pages/navigation.html';
}

export function openFunnels() {
  window.location.href = '/pages/propulsion.html';
}

export function openRadar() {
  window.location.href = '/pages/radar.html';
}

export function openFuel() {
  window.location.href = '/pages/fuel.html';
}

export function addVisionMessage(voice, text, actions = []) {
  const chat = document.getElementById('chat-log');
  if (!chat || !text) {
    return;
  }

  const msg = document.createElement('div');
  msg.className = 'vision-message';

  msg.innerHTML = `
    <div class="vision-voice">${voice}</div>
    <div class="vision-text">${text}</div>
  `;

  if (Array.isArray(actions) && actions.length) {
    const actionBar = document.createElement('div');
    actionBar.className = 'vision-actions';

    actions.forEach((action) => {
      const btn = document.createElement('button');
      btn.innerText = action.label;
      btn.onclick = action.handler;
      actionBar.appendChild(btn);
    });

    msg.appendChild(actionBar);
  }

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function getContextActions(context) {
  const map = {
    navigation: [
      { label: 'Open Navigation', handler: openNavigation },
      { label: 'Analyze Funnel', handler: openFunnels }
    ],
    propulsion: [
      { label: 'Analyze Funnel', handler: openFunnels },
      { label: 'View Traffic Radar', handler: openRadar },
      { label: 'Review Pricing', handler: openFuel }
    ],
    communications: [
      { label: 'Analyze Funnel', handler: openFunnels },
      { label: 'View Traffic Radar', handler: openRadar }
    ],
    fuel: [
      { label: 'Analyze Funnel', handler: openFunnels },
      { label: 'View Traffic Radar', handler: openRadar },
      { label: 'Review Pricing', handler: openFuel }
    ],
    radar: [
      { label: 'Open Funnels', handler: openFunnels },
      { label: 'Review Conversions', handler: openRadar }
    ],
    intelligence: [
      { label: 'Analyze Funnel', handler: openFunnels },
      { label: 'View Traffic Radar', handler: openRadar }
    ]
  };

  return map[context] || [];
}

export function visionGreeting() {
  const consoleEl = document.getElementById('vision-console');
  if (!consoleEl) {
    return;
  }

  const contextMessage = visionContext[pageContext];
  if (!contextMessage) {
    return;
  }

  // Avoid repeating the same greeting every time the panel is toggled.
  if (consoleEl.dataset.greetingContext === pageContext) {
    return;
  }

  const contextActions = getContextActions(pageContext);
  addVisionMessage('⚓ Anchor', contextMessage, contextActions);

  if (visionFollowUp[pageContext]) {
    addVisionMessage('⚓ Anchor', visionFollowUp[pageContext]);
  }

  if (pageContext === 'radar') {
    addVisionMessage('⚓ Anchor', 'Traffic spike detected in the last 2 hours.', [
      { label: 'Open Funnels', handler: openFunnels },
      { label: 'Review Conversions', handler: openRadar }
    ]);
  }

  consoleEl.dataset.greetingContext = pageContext;
}

export function openVision() {
  const consoleEl = document.getElementById('vision-console');
  if (!consoleEl) {
    return;
  }

  const wasClosed = !consoleEl.classList.contains('vision-open');
  consoleEl.classList.add('vision-open');
  consoleEl.setAttribute('aria-hidden', 'false');

  if (wasClosed) {
    visionGreeting();
  }
}

export function expandVision() {
  const consoleEl = document.getElementById('vision-console');
  if (!consoleEl) {
    return;
  }

  const wasClosed = !consoleEl.classList.contains('vision-open');
  consoleEl.classList.add('vision-open');
  consoleEl.classList.add('vision-expanded');
  consoleEl.setAttribute('aria-hidden', 'false');

  if (wasClosed) {
    visionGreeting();
  }
}

export function pulseVision() {
  const launcher = document.querySelector('.vision-launcher');
  if (!launcher) {
    return;
  }

  launcher.classList.add('vision-pulse');
  window.setTimeout(() => {
    launcher.classList.remove('vision-pulse');
  }, 2000);
}

if (typeof window !== 'undefined') {
  window.addVisionMessage = addVisionMessage;
  window.visionGreeting = visionGreeting;
  window.openNavigation = openNavigation;
  window.openFunnels = openFunnels;
  window.openRadar = openRadar;
  window.openFuel = openFuel;
  window.pulseVision = pulseVision;
  window.openVision = openVision;
  window.expandVision = expandVision;
}
