const visionMemory = {
  shortTerm: {},
  midTerm: {},
  longTerm: {}
};

function remember(type, key, value) {
  if (!visionMemory[type] || !key) {
    return;
  }

  visionMemory[type][key] = value;
  window.localStorage.setItem('visionMemory', JSON.stringify(visionMemory));
}

function loadMemory() {
  const saved = window.localStorage.getItem('visionMemory');
  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    Object.assign(visionMemory, parsed);
  } catch {
    // Ignore malformed local memory and keep defaults.
  }
}

function recall(type, key) {
  if (!visionMemory[type] || !key) {
    return undefined;
  }

  return visionMemory[type][key];
}

loadMemory();

window.visionMemory = visionMemory;
window.remember = remember;
window.loadMemory = loadMemory;
window.recall = recall;
