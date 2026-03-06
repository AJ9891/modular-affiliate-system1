const defaultEvents = [
  { time: 'T-06', text: 'Cockpit stack initialized' },
  { time: 'T-04', text: 'Voice matrix synchronized' },
  { time: 'T-02', text: 'Navigation vectors verified' }
];

export function initActivityLog(rootEl) {
  if (!rootEl) {
    throw new Error('Activity log root element is required.');
  }

  const listEl = document.createElement('ul');
  listEl.className = 'timeline';
  rootEl.appendChild(listEl);

  const events = [...defaultEvents];

  function render() {
    listEl.innerHTML = '';
    events
      .slice()
      .reverse()
      .forEach((event) => {
        const item = document.createElement('li');
        item.innerHTML = `<span class="time">${event.time}</span>${event.text}`;
        listEl.appendChild(item);
      });
  }

  function logEvent(text) {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    events.push({ time: timestamp, text });
    if (events.length > 12) {
      events.shift();
    }

    render();
  }

  render();

  return { logEvent };
}

const missionSteps = ['Launch', 'Funnel', 'Optimization'];

export function initMissionContext(rootEl) {
  if (!rootEl) {
    throw new Error('Mission context root element is required.');
  }

  const shellEl = document.createElement('div');
  shellEl.className = 'mission-context';

  const titleEl = document.createElement('p');
  titleEl.className = 'mission-context-title';
  titleEl.textContent = 'Mission Context';

  const stepsEl = document.createElement('ul');
  stepsEl.className = 'mission-context-steps';

  shellEl.appendChild(titleEl);
  shellEl.appendChild(stepsEl);
  rootEl.appendChild(shellEl);

  let activeStep = 0;

  function render() {
    stepsEl.innerHTML = '';

    missionSteps.forEach((step, index) => {
      const item = document.createElement('li');
      item.textContent = step;
      if (index === activeStep) {
        item.classList.add('active');
      }

      stepsEl.appendChild(item);

      if (index < missionSteps.length - 1) {
        const separator = document.createElement('li');
        separator.textContent = '→';
        separator.setAttribute('aria-hidden', 'true');
        stepsEl.appendChild(separator);
      }
    });
  }

  function updateFromTopic(text) {
    const lowerText = text.toLowerCase();

    if (/(launch|start|deploy|publish|go live)/.test(lowerText)) {
      activeStep = 0;
      render();
      return;
    }

    if (/(funnel|flow|landing|route|page)/.test(lowerText)) {
      activeStep = 1;
      render();
      return;
    }

    if (/(optimi|conversion|improve|scale|refine|analytics)/.test(lowerText)) {
      activeStep = 2;
      render();
    }
  }

  render();

  return {
    updateFromTopic,
    getActiveStep() {
      return missionSteps[activeStep];
    }
  };
}
