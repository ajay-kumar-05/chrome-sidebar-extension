/* Standalone microphone-permission helper page.
 * Runs in a normal extension tab (chrome-extension://<id>/request-mic.html),
 * where Chrome can reliably show the mic permission prompt. The granted
 * permission persists for the extension origin, so the side panel's speech
 * recognition works afterwards. */
const statusEl = document.getElementById('status');
const retryEl = document.getElementById('retry');
const hintEl = document.getElementById('hint');

async function ask() {
  statusEl.textContent = 'Requesting microphone access…';
  statusEl.className = 'status';
  retryEl.hidden = true;
  hintEl.textContent = '';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    statusEl.textContent = 'Microphone enabled. You can close this tab and use voice input in the side panel.';
    statusEl.className = 'status ok';
  } catch (err) {
    statusEl.textContent = 'Microphone access was blocked.';
    statusEl.className = 'status err';
    hintEl.textContent =
      'Click the microphone icon in the address bar (or open Site settings) and set Microphone to "Allow", then press Try again.';
    retryEl.hidden = false;
  }
}

retryEl.addEventListener('click', ask);
ask();
