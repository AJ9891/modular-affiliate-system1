const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function initVoiceEngine(options = {}) {
  const { onCommand, onStatus } = options;

  if (!SpeechRecognition) {
    onStatus?.('Voice standby: unsupported in this browser.');
    return {
      isSupported: false,
      start() {},
      stop() {}
    };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.onstart = () => {
    onStatus?.('Listening for cockpit commands...');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    onStatus?.(`Heard: "${transcript}"`);
    onCommand?.(transcript);
  };

  recognition.onerror = (event) => {
    onStatus?.(`Voice error: ${event.error}`);
  };

  recognition.onend = () => {
    onStatus?.('Voice standby: ready.');
  };

  return {
    isSupported: true,
    start() {
      recognition.start();
    },
    stop() {
      recognition.stop();
    }
  };
}
