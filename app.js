// Confetti Particle System
class ConfettiParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 12 + 6;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 14 + 7;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - Math.random() * 5; // initial upward velocity
    this.gravity = 0.25;
    this.friction = 0.97;
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.01;
    
    this.color = color || `hsl(${Math.random() * 360}, 100%, 60%)`;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() * 12) - 6;
    this.shape = Math.random() > 0.5 ? 'circle' : 'square';
  }

  update() {
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    
    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }
    ctx.restore();
  }
}

// Application Constants & State
const DEFAULT_LABELS = {
  c1: "1",
  c2: "2",
  c3: "3",
  c4: "4"
};

const CORNER_COLORS = {
  1: "#ff3366", // Red/Pink
  2: "#3399ff", // Blue
  3: "#ffcc00", // Yellow
  4: "#00cc66"  // Green
};

let labels = { ...DEFAULT_LABELS };
let history = [];
let isSpinning = false;
let currentRotation = 0;
let isMuted = false;
let textSizeScale = "1.0";

// Web Audio API State
let audioCtx = null;

// Confetti Particles Array
let particles = [];
let canvas = null;
let ctx = null;
let confettiAnimId = null;

// DOM Elements
const gridBoard = document.getElementById('grid-board');
const spinBtn = document.getElementById('spin-button');
const arrowEl = document.getElementById('spinner-arrow');
const toggleSoundBtn = document.getElementById('toggle-sound');
const openSettingsBtn = document.getElementById('open-settings');
const openHistoryBtn = document.getElementById('open-history');


// Dialog elements
const settingsDialog = document.getElementById('settings-dialog');
const settingsForm = document.getElementById('settings-form');
const closeSettingsBtn = document.getElementById('close-settings');
const resetLabelsBtn = document.getElementById('reset-labels-btn');

const historyDialog = document.getElementById('history-dialog');
const closeHistoryBtn = document.getElementById('close-history');
const closeHistoryFooterBtn = document.getElementById('close-history-footer');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const historyListEl = document.getElementById('history-list');

// Initialize Web Audio Context
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Sound Synthesis: Click/Tick
function playTickSound() {
  if (isMuted) return;
  try {
    const context = getAudioContext();
    const osc = context.createOscillator();
    const gain = context.createGain();
    
    osc.connect(gain);
    gain.connect(context.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, context.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.12, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, context.currentTime + 0.05);
    
    osc.start(context.currentTime);
    osc.stop(context.currentTime + 0.06);
  } catch (err) {
    console.warn("Could not play sound: ", err);
  }
}

// Sound Synthesis: Victory Fanfare
function playVictorySound() {
  if (isMuted) return;
  try {
    const context = getAudioContext();
    const now = context.currentTime;
    
    const playNote = (freq, startTime, duration) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.connect(gain);
      gain.connect(context.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.005, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    playNote(261.63, now, 0.12);        // C4
    playNote(329.63, now + 0.10, 0.12);  // E4
    playNote(392.00, now + 0.20, 0.12);  // G4
    playNote(523.25, now + 0.30, 0.12);  // C5
    playNote(659.25, now + 0.40, 0.12);  // E5
    playNote(783.99, now + 0.50, 0.50);  // G5
  } catch (err) {
    console.warn("Could not play fanfare: ", err);
  }
}

// Init Canvas Confetti
function initConfetti() {
  canvas = document.getElementById('confetti-canvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

// Spark confetti from target element center
function spawnConfetti(originX, originY, color) {
  const count = 150;
  for (let i = 0; i < count; i++) {
    particles.push(new ConfettiParticle(originX, originY, color));
  }
  
  if (!confettiAnimId) {
    updateConfetti();
  }
}

function updateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw(ctx);
    
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
  
  if (particles.length > 0) {
    confettiAnimId = requestAnimationFrame(updateConfetti);
  } else {
    confettiAnimId = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Quadrant Resolver: Maps an angle in degrees to a corner ID
// Clockwise layout:
// Corner 2 (Top-Right): 0 to 90
// Corner 4 (Bottom-Right): 90 to 180
// Corner 3 (Bottom-Left): 180 to 270
// Corner 1 (Top-Left): 270 to 360
function getQuadrant(angle) {
  const normalized = ((angle % 360) + 360) % 360;
  if (normalized >= 0 && normalized < 90) return 2;
  if (normalized >= 90 && normalized < 180) return 4;
  if (normalized >= 180 && normalized < 270) return 3;
  return 1;
}

// Get center angle for each corner
function getCenterAngle(cornerId) {
  switch (cornerId) {
    case 1: return 315; // Top Left
    case 2: return 45;  // Top Right
    case 3: return 225; // Bottom Left
    case 4: return 135; // Bottom Right
    default: return 0;
  }
}

// Load labels from localStorage or use defaults
function loadLabels() {
  const stored = localStorage.getItem('four_corners_labels_fs');
  if (stored) {
    try {
      labels = JSON.parse(stored);
    } catch (e) {
      labels = { ...DEFAULT_LABELS };
    }
  } else {
    labels = { ...DEFAULT_LABELS };
  }

  // Load text size scale
  const storedScale = localStorage.getItem('four_corners_text_scale');
  if (storedScale) {
    textSizeScale = storedScale;
  } else {
    textSizeScale = "1.0";
  }
  document.documentElement.style.setProperty('--font-size-scale', textSizeScale);
  document.getElementById('select-text-size').value = textSizeScale;

  updateUIWithLabels();
}

// Save labels to localStorage
function saveLabels(newLabels) {
  labels = { ...newLabels };
  localStorage.setItem('four_corners_labels_fs', JSON.stringify(labels));
  updateUIWithLabels();
}

// Update DOM elements with active labels
function updateUIWithLabels() {
  document.querySelector('#corner-1 .corner-text').textContent = labels.c1;
  document.querySelector('#corner-2 .corner-text').textContent = labels.c2;
  document.querySelector('#corner-3 .corner-text').textContent = labels.c3;
  document.querySelector('#corner-4 .corner-text').textContent = labels.c4;

  // Pre-fill input fields
  document.getElementById('input-c1').value = labels.c1;
  document.getElementById('input-c2').value = labels.c2;
  document.getElementById('input-c3').value = labels.c3;
  document.getElementById('input-c4').value = labels.c4;
}

// Load Spin History
function loadHistory() {
  const stored = localStorage.getItem('four_corners_history');
  if (stored) {
    try {
      history = JSON.parse(stored);
    } catch (e) {
      history = [];
    }
  } else {
    history = [];
  }
  updateHistoryListUI();
}

// Add Selection to History
function addToHistory(cornerId, labelText) {
  const record = {
    cornerId,
    labelText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
  history.unshift(record);
  if (history.length > 50) {
    history.pop();
  }
  localStorage.setItem('four_corners_history', JSON.stringify(history));
  updateHistoryListUI();
}

// Update History List in DOM
function updateHistoryListUI() {
  historyListEl.innerHTML = '';
  
  if (history.length === 0) {
    historyListEl.innerHTML = '<li class="empty-history">No spins yet. Let\'s spin the wheel!</li>';
    return;
  }
  
  history.forEach(item => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `
      <div class="history-item-badge badge-c${item.cornerId}">${item.cornerId}</div>
      <span class="history-item-name">${item.labelText}</span>
      <span class="history-item-time">${item.timestamp}</span>
    `;
    historyListEl.appendChild(li);
  });
}

// Spin Easing function (cubic bezier approximation)
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Spin Execution
function startSpin() {
  if (isSpinning) return;
  
  getAudioContext();
  
  isSpinning = true;
  spinBtn.disabled = true;
  
  // Clear any existing selections
  gridBoard.classList.remove('has-selection');
  document.querySelectorAll('.corner-box').forEach(box => box.classList.remove('selected'));
  
  const winner = Math.floor(Math.random() * 4) + 1;
  const winnerCenter = getCenterAngle(winner);
  
  const offset = (Math.random() * 40) - 20;
  const targetOffset = winnerCenter + offset;
  
  const minSpins = 5;
  const spinDegrees = minSpins * 360;
  
  const currentRotationNormalized = currentRotation % 360;
  let rotationDifference = targetOffset - currentRotationNormalized;
  if (rotationDifference <= 0) {
    rotationDifference += 360;
  }
  
  const startRot = currentRotation;
  const targetRot = currentRotation + spinDegrees + rotationDifference;
  
  const duration = 4000;
  const startTime = performance.now();
  let lastQuadrant = getQuadrant(startRot);
  
  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easedProgress = easeOutCubic(progress);
    currentRotation = startRot + (targetRot - startRot) * easedProgress;
    
    arrowEl.style.setProperty('--arrow-rotation', `${currentRotation}deg`);
    
    const currentQuad = getQuadrant(currentRotation);
    if (currentQuad !== lastQuadrant) {
      playTickSound();
      lastQuadrant = currentQuad;
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      finalizeSpin(winner);
    }
  }
  
  requestAnimationFrame(animate);
}

// Selection handling
function finalizeSpin(winnerId) {
  isSpinning = false;
  spinBtn.disabled = false;
  
  // Highlight the winner corner and dim others
  gridBoard.classList.add('has-selection');
  const winnerBox = document.getElementById(`corner-${winnerId}`);
  winnerBox.classList.add('selected');
  
  // Get custom label
  const customLabel = labels[`c${winnerId}`];
  
  // Save to history log
  addToHistory(winnerId, customLabel);
  
  playVictorySound();
  
  const boxRect = winnerBox.getBoundingClientRect();
  const originX = boxRect.left + (boxRect.width / 2);
  const originY = boxRect.top + (boxRect.height / 2);
  const color = CORNER_COLORS[winnerId];
  
  spawnConfetti(originX, originY, color);
  

}



// Set up DOM interactions
function initEventListeners() {
  spinBtn.addEventListener('click', startSpin);

  // Space bar shortcut to spin
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === ' ') {
      const isDialogOpen = settingsDialog.open || historyDialog.open;
      const isFocusedInput = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
      
      if (!isSpinning && !isDialogOpen && !isFocusedInput) {
        e.preventDefault(); // Prevent standard page scroll
        startSpin();
      }
    }
  });
  


  // Tap a corner box to trigger a direct selection / preview confetti!
  document.querySelectorAll('.corner-box').forEach(box => {
    box.addEventListener('click', () => {
      if (isSpinning) return;
      
      gridBoard.classList.add('has-selection');
      document.querySelectorAll('.corner-box').forEach(b => b.classList.remove('selected'));
      box.classList.add('selected');
      
      playTickSound();
      
      const boxId = parseInt(box.dataset.corner);
      const boxRect = box.getBoundingClientRect();
      const originX = boxRect.left + (boxRect.width / 2);
      const originY = boxRect.top + (boxRect.height / 2);
      spawnConfetti(originX, originY, CORNER_COLORS[boxId]);
    });
  });
  
  // Sound toggle
  toggleSoundBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    const icon = toggleSoundBtn.querySelector('.icon-speaker');
    if (isMuted) {
      icon.classList.add('muted');
      toggleSoundBtn.title = "Unmute Sounds";
    } else {
      icon.classList.remove('muted');
      toggleSoundBtn.title = "Mute Sounds";
      getAudioContext();
      playTickSound();
    }
  });

  // Settings modals
  openSettingsBtn.addEventListener('click', () => {
    settingsDialog.showModal();
  });
  
  closeSettingsBtn.addEventListener('click', () => {
    settingsDialog.close();
  });

  settingsForm.addEventListener('submit', (e) => {
    const formData = new FormData(settingsForm);
    const newLabels = {
      c1: formData.get('c1').trim() || DEFAULT_LABELS.c1,
      c2: formData.get('c2').trim() || DEFAULT_LABELS.c2,
      c3: formData.get('c3').trim() || DEFAULT_LABELS.c3,
      c4: formData.get('c4').trim() || DEFAULT_LABELS.c4
    };
    saveLabels(newLabels);

    // Save text size selection
    const selectedScale = formData.get('textSize') || "1.0";
    textSizeScale = selectedScale;
    localStorage.setItem('four_corners_text_scale', textSizeScale);
    document.documentElement.style.setProperty('--font-size-scale', textSizeScale);
  });

  resetLabelsBtn.addEventListener('click', () => {
    saveLabels(DEFAULT_LABELS);
    
    // Reset text size scale
    textSizeScale = "1.0";
    localStorage.setItem('four_corners_text_scale', textSizeScale);
    document.documentElement.style.setProperty('--font-size-scale', textSizeScale);
    document.getElementById('select-text-size').value = textSizeScale;
    
    settingsDialog.close();
  });

  // History modals
  openHistoryBtn.addEventListener('click', () => {
    historyDialog.showModal();
  });
  
  closeHistoryBtn.addEventListener('click', () => {
    historyDialog.close();
  });
  
  closeHistoryFooterBtn.addEventListener('click', () => {
    historyDialog.close();
  });

  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('four_corners_history');
    updateHistoryListUI();
  });

  // Handle closing modal via clicking outside modal wrapper boundary
  [settingsDialog, historyDialog].forEach(dialog => {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && 
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && 
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  });
}

// Main Bootstrapping
window.addEventListener('DOMContentLoaded', () => {
  loadLabels();
  loadHistory();
  initConfetti();
  initEventListeners();
});
