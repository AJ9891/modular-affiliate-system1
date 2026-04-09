import { buildReply, pickVoiceForMessage, setVoice, getVoice } from './voice-engine.js';
import { timelineByMessage, renderTimeline } from './mission-timeline.js';

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export function createVisionChat({ chatEl, timelineEl, onVoiceChange, onPulse, dock }) {
  const appendMessage = (kind, content, extraImage) => {
    const node = document.createElement('article');
    node.className = `msg ${kind}`;
    node.innerHTML = content;
    if (extraImage) {
      const img = document.createElement('img');
      img.src = extraImage;
      img.alt = 'AI generated visual suggestion';
      node.appendChild(img);
    }
    chatEl.appendChild(node);
    chatEl.scrollTop = chatEl.scrollHeight;
  };

  const typeMessage = async (text, speed, withImage) => {
    const typing = document.createElement('article');
    typing.className = 'msg ai';
    chatEl.appendChild(typing);

    for (let i = 0; i < text.length; i += 1) {
      typing.textContent += text[i];
      chatEl.scrollTop = chatEl.scrollHeight;
      await sleep(speed);
    }

    if (withImage) {
      const img = document.createElement('img');
      img.src = '../assets/dashboard-dark.png';
      img.alt = 'Inline tactical visual';
      typing.appendChild(img);
    }

    onPulse();
  };

  const addDockNote = (bucket, text) => {
    const li = document.createElement('li');
    li.textContent = text;
    dock[bucket].prepend(li);
  };

  const onUserMessage = async (input) => {
    appendMessage('user', input);

    const chosen = pickVoiceForMessage(input);
    setVoice(chosen);
    const voice = getVoice();
    onVoiceChange(voice);

    renderTimeline(timelineEl, timelineByMessage(input));

    const reply = buildReply(input, chosen);
    const includeImage = /(dashboard|visual|mockup|design)/i.test(input);
    await typeMessage(reply.text, reply.speed, includeImage);

    addDockNote('insights', `Voice ${reply.voiceLabel.split(' ')[1]}: ${reply.text.slice(0, 52)}...`);
    if (/idea|concept|build/i.test(input)) addDockNote('ideas', input);
    if (/risk|issue|problem|stuck/i.test(input)) addDockNote('alerts', 'Potential friction detected in mission flow.');
    addDockNote('strategy', timelineEl.textContent.replace('Mission Context', '').trim());
  };

  renderTimeline(timelineEl, { track: ['Launch', 'Funnel', 'Optimization'], current: 0 });
  appendMessage('ai', 'Welcome aboard. I am Vision. State mission priority.');

  return { onUserMessage };
}
