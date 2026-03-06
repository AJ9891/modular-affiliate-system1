(function bootstrapVision() {
  const root = document.getElementById('vision-root');
  if (!root) {
    return;
  }

  const componentPaths = ['/components/vision.html', './components/vision.html', '../components/vision.html'];

  function openVision() {
    const consoleEl = document.getElementById('vision-console');
    if (!consoleEl) {
      return;
    }

    const wasClosed = !consoleEl.classList.contains('vision-open');
    consoleEl.classList.add('vision-open');
    consoleEl.setAttribute('aria-hidden', 'false');

    if (wasClosed && typeof window.visionGreeting === 'function') {
      window.visionGreeting();
    }
  }

  function expandVision() {
    const consoleEl = document.getElementById('vision-console');
    if (!consoleEl) {
      return;
    }

    const wasClosed = !consoleEl.classList.contains('vision-open');
    consoleEl.classList.add('vision-open');
    consoleEl.classList.add('vision-expanded');
    consoleEl.setAttribute('aria-hidden', 'false');

    if (wasClosed && typeof window.visionGreeting === 'function') {
      window.visionGreeting();
    }
  }

  function closeVisionOverlay() {
    const consoleEl = document.getElementById('vision-console');
    if (!consoleEl) {
      return;
    }

    consoleEl.classList.remove('vision-open');
    consoleEl.classList.remove('vision-expanded');
    consoleEl.setAttribute('aria-hidden', 'true');
  }

  window.openVision = window.openVision || openVision;
  window.expandVision = window.expandVision || expandVision;
  window.closeVisionOverlay = window.closeVisionOverlay || closeVisionOverlay;

  function wireVisionConsole() {
    const sendButton = document.getElementById('vision-send');
    const input = document.getElementById('vision-input');
    const chatLog = document.getElementById('chat-log');
    const launcher = document.querySelector('.vision-launcher');

    if (launcher && !document.body.classList.contains('system-page')) {
      launcher.style.display = 'none';
    }

    if (!sendButton || !input || !chatLog) {
      return;
    }

    function send() {
      const message = input.value.trim();
      if (!message) {
        return;
      }

      if (typeof window.addVisionMessage === 'function') {
        window.addVisionMessage('You', message);
        window.addVisionMessage('⚓ Anchor', 'Signal received. Processing mission context.');
      } else {
        const userRow = document.createElement('p');
        userRow.innerHTML = `<strong>You:</strong> ${message}`;
        chatLog.appendChild(userRow);

        const aiRow = document.createElement('p');
        aiRow.innerHTML = '<strong>Vision:</strong> Signal received. Processing mission context.';
        chatLog.appendChild(aiRow);
      }

      input.value = '';
      chatLog.scrollTop = chatLog.scrollHeight;
    }

    sendButton.addEventListener('click', send);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        send();
      }
    });
  }

  function fetchComponent(index) {
    if (index >= componentPaths.length) {
      return Promise.reject(new Error('Vision component could not be loaded.'));
    }

    return fetch(componentPaths[index]).then((response) => {
      if (!response.ok) {
        return fetchComponent(index + 1);
      }

      return response.text();
    });
  }

  fetchComponent(0)
    .then((html) => {
      root.innerHTML = html;
      wireVisionConsole();
      window.dispatchEvent(new CustomEvent('vision:ready'));
    })
    .catch(() => {
      root.innerHTML = '';
    });
})();
