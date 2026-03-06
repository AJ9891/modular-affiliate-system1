const visionEvents = [];

function routeTo(path) {
  window.location.href = path;
}

function openNavigation() {
  routeTo('/pages/navigation.html');
}

function openFunnels() {
  routeTo('/pages/propulsion.html');
}

function openRadar() {
  routeTo('/pages/radar.html');
}

function openFuel() {
  routeTo('/pages/fuel.html');
}

function handleVisionEvent(event) {
  if (!event) {
    return false;
  }

  if (typeof window.addVisionMessage !== 'function' || !document.getElementById('chat-log')) {
    return false;
  }

  window.addVisionMessage(event.voice || '⚓ Anchor', event.message || 'New mission event received.', event.actions || []);

  if (typeof window.pulseVision === 'function') {
    window.pulseVision();
  }

  return true;
}

function emitVisionEvent(event) {
  visionEvents.push(event);

  if (!handleVisionEvent(event)) {
    return;
  }

  event.__delivered = true;
  window.dispatchEvent(new CustomEvent('vision:event', { detail: event }));
}

function flushVisionEvents() {
  if (typeof window.addVisionMessage !== 'function') {
    return;
  }

  visionEvents.forEach((event) => {
    if (!event || event.__delivered) {
      return;
    }

    if (handleVisionEvent(event)) {
      event.__delivered = true;
    }
  });
}

function setupDemoEventTriggers() {
  const page = window.location.pathname.split('/').pop().replace('.html', '');
  if (page === 'radar') {
    window.setTimeout(() => {
      emitVisionEvent({
        voice: '⚡ Glitch',
        message: "Traffic spike detected. Either you're going viral or the bots are partying again.",
        actions: [
          { label: 'Open Radar', handler: openRadar },
          { label: 'Check Funnels', handler: openFunnels }
        ]
      });
    }, 900);
  }

  if (page === 'fuel') {
    window.setTimeout(() => {
      emitVisionEvent({
        voice: '🚀 Rocket',
        message: 'Nice work! A new subscription just came in.',
        actions: [{ label: 'View Revenue', handler: openFuel }]
      });
    }, 900);
  }
}

window.emitVisionEvent = emitVisionEvent;
window.handleVisionEvent = handleVisionEvent;
window.visionEvents = visionEvents;

window.addEventListener('vision:ready', () => {
  flushVisionEvents();
  setupDemoEventTriggers();
});
