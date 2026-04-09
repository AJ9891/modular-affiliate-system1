const missionSets = {
  launch: ['Launch', 'Funnel', 'Optimization'],
  growth: ['Traffic', 'Conversion', 'Retention'],
  strategy: ['Positioning', 'Offer', 'Scale']
};

export function timelineByMessage(message) {
  const m = message.toLowerCase();
  if (/(traffic|ads|audience|email)/.test(m)) return { track: missionSets.growth, current: 0 };
  if (/(offer|strategy|brand|position)/.test(m)) return { track: missionSets.strategy, current: 1 };
  return { track: missionSets.launch, current: 1 };
}

export function renderTimeline(el, timeline) {
  const steps = timeline.track
    .map((step, idx) => `<span class="timeline-step ${idx === timeline.current ? 'active' : ''}">${step}</span>`)
    .join(' → ');
  el.innerHTML = `<strong>Mission Context</strong><div>${steps}</div>`;
}
