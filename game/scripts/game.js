/* =====================================================
   J's Game — game.js
   Simplified: Dustin in Hawkins only
   Top-5 Leaderboard with name entry
   Black & White HUD
   ===================================================== */

const canvas         = document.getElementById('canvas');
const ctx            = canvas.getContext('2d');

const titleScreen    = document.getElementById('title-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const titleButton    = document.getElementById('title-button');
const restartButton  = document.getElementById('restart-button');
const finalScoreEl   = document.getElementById('final-score-display');
const nameEntry      = document.getElementById('name-entry');
const playerNameEl   = document.getElementById('player-name');
const submitBtn      = document.getElementById('submit-score-btn');
const hsList         = document.getElementById('hs-list');

// ── Canvas B&W filter ─────────────────────────────────────────
canvas.style.filter = 'grayscale(100%) contrast(1.1)';

// ── Game state ────────────────────────────────────────────────
const cWidth  = canvas.width;
const cHeight = canvas.height;

let frames     = 0;
let score      = 0;
let levels     = 1;
let player;
let gravity;
let obstacles  = [];   // ALL enemies go here (see spawn fns)
let bats       = [];   // unused but kept for compat
let slimes     = [];
let dogs       = [];
let demogorgons = [];
let gameSpeed;
let keys       = {};
let interval   = null;
let isRunning  = false;
let spawnObst  = false;
let spawnSlim  = false;
let spawnDog   = false;
let spawnDemon = false;
let spawn2Bat  = false;
let lastScore  = 0;
let lastLevel  = 1;
let upsideDown = false; // kept for compat with other scripts

const initialSpawnTimer = 220;
let spawnTimer = initialSpawnTimer;

// ── Font ──────────────────────────────────────────────────────
ctx.font = "bold 18px 'Space Mono', monospace";

// ── Music ──────────────────────────────────────────────────────
let song = new Audio('./docs/assets/sounds/som_1.mp3');
song.loop = true;

// ── Controls ───────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'Space') keys['KeyZ'] = true;
  // Start from title with Space / Enter
  if (!isRunning && !titleScreen.classList.contains('hidden')) {
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyZ') {
      e.preventDefault();
      beginGame();
    }
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  if (e.code === 'Space') keys['KeyZ'] = false;
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (player && isRunning) player.jump();
}, { passive: false });

titleScreen.addEventListener('touchstart', () => {
  if (!titleScreen.classList.contains('hidden')) beginGame();
});

// ── Begin game ────────────────────────────────────────────────
titleButton.addEventListener('click', beginGame);

function beginGame() {
  if (isRunning) return;
  song.currentTime = 0;
  song.play().catch(() => {});
  titleScreen.classList.add('hidden');
  canvas.classList.remove('hidden');
  startDustinHawkins();
}

function startDustinHawkins() {
  // Reset all state
  frames     = 0;
  score      = 0;
  levels     = 1;
  spawnTimer = initialSpawnTimer;
  spawnObst  = false;
  spawnSlim  = false;
  spawnDog   = false;
  spawnDemon = false;
  spawn2Bat  = false;
  obstacles  = [];
  upsideDown = false;

  isRunning  = true;
  gameSpeed  = 15;
  gravity    = 0.9;

  // x=125 fixed, y=10 (near top — falls to ground), size 60x90
  player = new Dustin(125, 10, 60, 90);
  interval = setInterval(update, 1000 / 60);
}

// ── Game Over ─────────────────────────────────────────────────
function triggerGameOver() {
  clearInterval(interval);
  isRunning  = false;
  lastScore  = Math.round(score);
  lastLevel  = levels;

  // Reset arrays
  obstacles  = [];
  spawnDemon = false;
  spawnSlim  = false;
  spawnObst  = false;
  spawnDog   = false;
  spawn2Bat  = false;
  spawnTimer = initialSpawnTimer;
  gameSpeed  = 15;
  levels     = 1;
  frames     = 0;

  canvas.classList.add('hidden');
  song.pause();

  // Show final score
  finalScoreEl.textContent = `Score: ${lastScore}  ·  Level: ${lastLevel}`;

  // Show name entry only if qualifies for top 5
  const scores = getScores();
  const isTopFive = scores.length < 5 || lastScore > scores[scores.length - 1].score;

  if (isTopFive) {
    nameEntry.style.display  = 'flex';
    playerNameEl.value = '';
    setTimeout(() => playerNameEl.focus(), 150);
  } else {
    nameEntry.style.display = 'none';
  }

  renderLeaderboard();
  gameOverScreen.classList.remove('hidden');
}

// ── Leaderboard ───────────────────────────────────────────────
function getScores() {
  try {
    return JSON.parse(localStorage.getItem('jsgame_scores') || '[]');
  } catch { return []; }
}

function saveScore(name, score, level) {
  let scores = getScores();
  scores.push({
    name: (name || 'ANON').trim().toUpperCase().slice(0, 12),
    score,
    level
  });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 5);
  localStorage.setItem('jsgame_scores', JSON.stringify(scores));
  return scores;
}

function renderLeaderboard() {
  const scores = getScores();
  hsList.innerHTML = '';
  if (!scores.length) {
    hsList.innerHTML = '<li style="color:var(--mid-grey);font-size:11px;letter-spacing:.2em;justify-content:center;border:none;">BE THE FIRST ON THE BOARD</li>';
    return;
  }
  scores.forEach((entry, i) => {
    const li = document.createElement('li');
    li.style.animationDelay = `${i * 0.07}s`;
    li.innerHTML = `
      <span class="hs-name">${entry.name}</span>
      <span class="hs-score">${entry.score}</span>
      <span class="hs-level">LV ${entry.level}</span>
    `;
    hsList.appendChild(li);
  });
}

submitBtn.addEventListener('click', submitScore);
playerNameEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitScore();
  e.stopPropagation(); // prevent game start key from firing
});

function submitScore() {
  const name = playerNameEl.value.trim() || 'ANON';
  saveScore(name, lastScore, lastLevel);
  nameEntry.style.display = 'none';
  renderLeaderboard();
}

restartButton.addEventListener('click', () => {
  gameOverScreen.classList.add('hidden');
  titleScreen.classList.remove('hidden');
});

// ── Main Update Loop ──────────────────────────────────────────
function update() {
  if (!isRunning) return;
  frames++;
  ctx.clearRect(0, 0, cWidth, cHeight);

  score = frames / 10;

  // ── Draw ground line ─────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, cHeight - 1);
  ctx.lineTo(cWidth, cHeight - 1);
  ctx.stroke();

  // ── HUD ──────────────────────────────────────────────────
  ctx.font = "bold 20px 'Space Mono', monospace";

  const scoreText = `SCORE  ${Math.round(score)}`;
  const levelText = `LV ${levels}`;

  // Score bg + text (top-left)
  const sw = ctx.measureText(scoreText).width;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(8, 8, sw + 22, 32);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(scoreText, 19, 31);

  // Level bg + text (top-right)
  const lw = ctx.measureText(levelText).width;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(cWidth - lw - 28, 8, lw + 20, 32);
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText(levelText, cWidth - lw - 18, 31);

  // ── Spawn timer ───────────────────────────────────────────
  spawnTimer--;
  if (spawnTimer <= 0) {
    if (spawnObst)  spawnObstacle();
    if (spawnSlim)  spawnSlimes();
    if (spawnDog)   spawnDogs();
    if (spawnDemon) spawnDemogorgon();
    if (spawn2Bat)  spawnNextBat();
    spawnBats();

    spawnTimer = initialSpawnTimer - gameSpeed * 5500;
    if (spawnTimer < 150) {
      spawnDemon = true;
      spawnTimer = 150;
      if (frames > 250)  spawnTimer = 125;
      if (frames > 500)  { spawnTimer = 100; levels = 2; spawn2Bat = true; }
      if (frames > 1000) { spawnDemon = false; spawnDog = true; spawnTimer = 90; levels = 3; }
      if (frames > 1500) { spawnTimer = 80; levels = 4; spawn2Bat = false; }
      if (frames > 2000) { spawnDog = false; spawnSlim = true; spawnTimer = 70; levels = 5; }
      if (frames > 2500) { spawnTimer = 60; levels = 6; }
      if (frames > 3000) { spawnSlim = false; spawnObst = true; spawnTimer = 55; levels = 7; spawn2Bat = true; }
      if (frames > 5000) { spawnObst = false; spawnDog = true; spawnTimer = 50; levels = 8; spawn2Bat = false; }
      if (frames > 6666) { spawnDog = false; spawnDemon = true; spawnTimer = 45; levels = 9; spawn2Bat = true; }
      if (frames > 9999) { spawnTimer = 40; levels = 10; }
    }
  }

  // ── Obstacle collision & update ───────────────────────────
  // All enemies go into 'obstacles' array (see spawn functions)
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
      continue;
    }
    if (player.colision(obs)) {
      triggerGameOver();
      return;
    }
    obs.update();
  }

  // ── Player ─────────────────────────────────────────────────
  player.animate();
  player.playerDraw(frames);
  gameSpeed += 0.010;
}