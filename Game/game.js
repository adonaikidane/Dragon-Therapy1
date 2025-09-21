    // 3. Save the updated array back to localStorage
    localStorage.setItem('levelHistory', JSON.stringify(levelHistory));
}


function giveReward() {
  currentReward = rewards[Math.min(level-1, rewards.length-1)];
  if (rewardInfo) rewardInfo.textContent = "Reward: " + currentReward;
}

// ---------------- One-time DOM binding ----------------
let _listenersBound = false;
function bindDomOnce() {
  if (_listenersBound) return;
  canvas.addEventListener('mousedown', startDrag);
  canvas.addEventListener('touchstart', startDrag, {passive:false});
  canvas.addEventListener('mousemove', dragOrb);
  canvas.addEventListener('touchmove', dragOrb, {passive:false});
  canvas.addEventListener('mouseup', endDrag);
  canvas.addEventListener('touchend', endDrag);
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener('click', () => {
      if (level < MAX_LEVEL) {
        level++;
        setupLevel(level);
        requestAnimationFrame(gameLoop);
      }
    });
  }
  _listenersBound = true;
}

// ---------------- Game Initialization ----------------
// This code will run automatically when the page loads.

document.addEventListener('DOMContentLoaded', () => {
    // Look up DOM elements
    canvas = document.getElementById('game-canvas');
    levelInfo = document.getElementById('level-info');
    rewardInfo = document.getElementById('reward-info');
    nextLevelBtn = document.getElementById('next-level-btn');
    statsDiv = document.getElementById('stats');
    ctx = canvas.getContext('2d');

    // Center dragon based on canvas size
    dragon.x = canvas.width / 2;
    dragon.y = canvas.height / 2;

    // Bind inputs and start the game
    bindDomOnce();
    setupLevel(level);
    gameActive = true;
    requestAnimationFrame(gameLoop);

    // --- ADD THIS to make the dashboard button work ---
    const viewDashboardBtn = document.getElementById('view-dashboard-btn');
    if (viewDashboardBtn) {
        viewDashboardBtn.addEventListener('click', () => {
            window.location.href = 'results.html';
        });
    }
});
  // Look up DOM every time in case the Dashboard re-rendered
  canvas = document.getElementById('game-canvas');
  levelInfo = document.getElementById('level-info');
  rewardInfo = document.getElementById('reward-info');
  nextLevelBtn = document.getElementById('next-level-btn');
  statsDiv = document.getElementById('stats');

  if (!canvas) {
    console.error('Game canvas not found. Ensure #game-canvas exists on the Dashboard.');
    return;
  }
  ctx = canvas.getContext('2d');

  // Center dragon based on current canvas size
  dragon.x = canvas.width / 2;
  dragon.y = canvas.height / 2;

  // Optional: respect preset start level
  if (typeof window.__IRT_START_LEVEL === 'number') {
    level = Math.max(1, Math.min(10, window.__IRT_START_LEVEL));
  } else {
    level = 1;
  }

  // Bind inputs once, then (re)start the game
  bindDomOnce();
  setupLevel(level);
  gameActive = true;
  requestAnimationFrame(gameLoop);
;

// ---------------- IMPORTANT ----------------
// Remove the old auto-start lines that were at the bottom:
//   setupLevel(level);
//   requestAnimationFrame(gameLoop);
//
// The game now starts when your Dashboard calls:
//   if (typeof window.initInjuryGame === 'function') window.initInjuryGame();
*/

// This is the complete, merged game file.
// It includes all your advanced features and is correctly structured to work with app.js.

// This is the complete, final game file.
// It includes all your advanced features and all the bug fixes.

// This is the complete, final game file.
// It includes all features and bug fixes, plus numbered orbs and supportive messages.

// This is the complete, final game file.
// It includes all features and bug fixes, plus the latest requests.

// This is the complete, final, and fully correct game file.

// This is the complete, final, and fully correct game file.

window.initInjuryGame = function () {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error("Game canvas not found!");
        return;
    }

    const ctx = canvas.getContext('2d');
    const levelInfo = document.getElementById('level-info');
    const rewardInfo = document.getElementById('reward-info');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const statsDiv = document.getElementById('stats');

    // --- Game Variables ---
    let currentLevel = 1;
    const MAX_LEVELS = 10;
    let orbs = [];
    let obstacles = [];
    let draggingOrb = null;
    let dragOffset = { x: 0, y: 0 };
    let dragon = { x: canvas.width / 2, y: canvas.height / 2, radius: 60 };
    let requiredSequenceIndex = 0;
    
    const supportiveMessages = [ "You're doing great, keep going!", "Excellent work!", "The dragon is getting stronger!", "Amazing focus!", "Look at that coordination!", "Fantastic progress!", "You've got this!", "Wonderful job!", "Almost there, keep it up!", "Final level! You can do it!" ];
    
    // Session-wide data collection
    let sessionData = { totalMisses: 0, allOrbTimes: [], romPoints: new Set() };
    // Per-level data collection
    let levelStats = {};
    
    let gameActive = false;
    // ADJUSTMENT: Variable to track current collision state
    let isColliding = false; 

    // --- Helper Functions ---
    function segmentHitsAnyRect(x1, y1, x2, y2, rects) {
        function segSeg(ax, ay, bx, by, cx, cy, dx, dy) {
            const s1x = bx - ax, s1y = by - ay;
            const s2x = dx - cx, s2y = dy - cy;
            const denom = (s2x * s1y - s2y * s1x);
            if (denom === 0) return false;
            const s = (-s1y * (ax - cx) + s1x * (ay - cy)) / denom;
            const t = (s2x * (ay - cy) - s2y * (ax - cx)) / denom;
            return s >= 0 && s <= 1 && t >= 0 && t <= 1;
        }
        for (const r of rects) {
            const rx = r.x, ry = r.y, rw = r.w, rh = r.h;
            if (segSeg(x1, y1, x2, y2, rx, ry, rx, ry + rh)) return true;
            if (segSeg(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh)) return true;
            if (segSeg(x1, y1, x2, y2, rx, ry, rx + rw, ry)) return true;
            if (segSeg(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh)) return true;
            if (x1 >= rx && x1 <= rx + rw && y1 >= ry && y1 <= ry + rh) return true;
        }
        return false;
    }

    function randomPos(radius) {
        const EXCLUDE_R = dragon.radius + Math.max(70, radius + 24);
        const inflated = obstacles.map(o => ({ x: o.x - (radius + 30), y: o.y - (radius + 24), w: o.w + 2 * (radius + 30), h: o.h + 2 * (radius + 24) }));

        function overlapsExisting(x, y) { for (const o of orbs) { if (!o.fed) { const dx = x - o.x, dy = y - o.y; const minD = (radius + o.radius + 10); if (dx * dx + dy * dy < minD * minD) return true; } } return false; }
        function insideInflatedObstacle(x, y) { return inflated.some(r => x + radius > r.x && x - radius < r.x + r.w && y + radius > r.y && y - radius < r.y + r.h); }
        function hasClearRayToDragon(x, y) { const R = Math.max(10, dragon.radius - 8); for (let k = 0; k < 12; k++) { const a = (Math.PI * 2) * (k / 12); const tx = dragon.x + R * Math.cos(a); const ty = dragon.y + R * Math.sin(a); if (!segmentHitsAnyRect(x, y, tx, ty, inflated)) return true; } return false; }

        for (let tries = 0; tries < 300; tries++) {
            const x = radius + 12 + Math.random() * (canvas.width - 2 * radius - 24);
            const y = radius + 12 + Math.random() * (canvas.height - 2 * radius - 24);
            const dx = x - dragon.x, dy = y - dragon.y;
            if ((dx * dx + dy * dy) < EXCLUDE_R * EXCLUDE_R) continue;
            if (insideInflatedObstacle(x, y)) continue;
            if (overlapsExisting(x, y)) continue;
            if (!hasClearRayToDragon(x, y)) continue;
            return { x, y };
        }
        return { x: radius + Math.random() * (canvas.width - radius * 2), y: radius + Math.random() * (canvas.height - radius * 2) };
    }

    // --- Game Flow ---
    function startLevel() {
        levelInfo.textContent = `Level: ${currentLevel} of ${MAX_LEVELS}`;
        if(nextLevelBtn) nextLevelBtn.style.display = 'none';
        if(statsDiv) statsDiv.innerHTML = '';
        if (rewardInfo) { rewardInfo.textContent = supportiveMessages[(currentLevel - 1) % supportiveMessages.length]; }
        
        levelStats = { speed: [], accuracy: 0, rangeOfMotion: new Set() };
        
        orbs = [];
        obstacles = [];
        requiredSequenceIndex = 0;
        let colorSequence = [];
        const orbRadius = Math.max(40 - currentLevel * 2, 20);

        if (currentLevel >= 3) {
            obstacles = [ { x: 320, y: 100, w: 80, h: 160, dx: 1.5, dir: 1 }, { x: 520, y: 200, w: 80, h: 100, dx: -1.5, dir: -1 } ];
            let colors = ['#ffd700', '#00e6ff', '#ff6b81'];
            for (let i = 0; i < currentLevel; i++) { colorSequence.push(colors[i % colors.length]); }
        }

        for (let i = 0; i < currentLevel; i++) {
            const newPos = randomPos(orbRadius);
            const color = currentLevel >= 3 ? colorSequence[i] : '#ffd700';
            orbs.push({ ...newPos, radius: orbRadius, color, fed: false, id: i, startTime: 0 });
            const posString = `${Math.round(newPos.x)},${Math.round(newPos.y)}`;
            sessionData.romPoints.add(posString);
            levelStats.rangeOfMotion.add(posString);
        }
        
        gameActive = true;
    }

    function showLevelStats() {
        if (!statsDiv) return;
        const speedAvg = levelStats.speed.length > 0 ? (levelStats.speed.reduce((a, b) => a + b, 0) / levelStats.speed.length).toFixed(2) : 0;
        const acc = levelStats.accuracy;
        const rom = levelStats.rangeOfMotion.size;
        statsDiv.innerHTML = `
            <strong>Level ${currentLevel} Complete!</strong><br>
            Avg Speed: <b>${speedAvg}s</b> | Errors: <b>${acc}</b> | Range of Motion: <b>${rom} zones</b>
        `;
    }

    function checkLevelEnd() {
        if (orbs.every(o => o.fed)) {
            gameActive = false;
            showLevelStats();
            if (currentLevel < MAX_LEVELS) {
                if(nextLevelBtn) nextLevelBtn.style.display = "inline-block";
            } else {
                finishSession();
            }
        }
    }

    if(nextLevelBtn) {
        nextLevelBtn.addEventListener('click', () => {
            currentLevel++;
            startLevel();
            requestAnimationFrame(gameLoop);
        });
    }

    function finishSession() {
        const totalTime = sessionData.allOrbTimes.reduce((a, b) => a + b, 0);
        const avgSpeedSec = totalTime / sessionData.allOrbTimes.length || 0;
        levelInfo.textContent = "Session Complete!";
        if(rewardInfo) rewardInfo.textContent = "🎉 Great work! Your results have been saved.";
        if(statsDiv) statsDiv.innerHTML = "";
        if (typeof window.onGameSessionComplete === 'function') {
            window.onGameSessionComplete({ date: new Date().toISOString(), level: MAX_LEVELS, avgSpeedSec: avgSpeedSec, errors: sessionData.totalMisses, romZones: sessionData.romPoints.size });
        }
    }

    // --- Drawing Logic ---
    function drawGame() {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(dragon.x, dragon.y, dragon.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#6c3ec1';
        ctx.shadowColor = "#8ee0ea";
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.font = "36px Comic Sans MS";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🐉", dragon.x, dragon.y);
        ctx.restore();

        obstacles.forEach(o => { ctx.save(); ctx.fillStyle = "#9b5ded"; ctx.globalAlpha = 0.7; ctx.fillRect(o.x, o.y, o.w, o.h); ctx.restore(); });

        orbs.forEach((orb) => {
            if (!orb.fed) {
                const base = orb.color || '#ffd700';
                const grad = ctx.createRadialGradient(orb.x - orb.radius*0.35, orb.y - orb.radius*0.35, orb.radius*0.2, orb.x, orb.y, orb.radius);
                grad.addColorStop(0, lighten(base, 0.35));
                grad.addColorStop(1, base);
                ctx.save();
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.shadowColor = lighten(base, 0.35);
                ctx.shadowBlur = 18;
                ctx.fill();
                ctx.lineWidth = Math.max(2, orb.radius * 0.12);
                ctx.strokeStyle = darken(base, 0.35);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(orb.x - orb.radius*0.35, orb.y - orb.radius*0.35, orb.radius*0.35, 0, Math.PI * 2);
                ctx.globalAlpha = 0.25;
                ctx.fillStyle = '#fff';
                ctx.fill();
                
                // ... (inside drawGame, within the orb drawing loop)
                if (currentLevel >= 3) {
                const label = String(orb.id + 1);
                ctx.font = `bold ${Math.round(orb.radius * 0.8)}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // --- New Outline Logic ---
                ctx.strokeStyle = 'black'; // The color of the outline
                ctx.lineWidth = 3;         // How thick the outline is
                ctx.strokeText(label, orb.x, orb.y); // Draw the outline

                // Shadow lines removed
                ctx.fillStyle = 'black';
                ctx.fillText(label, orb.x, orb.y);
                }
                ctx.restore();
            }
        });
    }

    // --- Animation & Event Logic ---
    function gameLoop() {
        if (!gameActive) return;
        obstacles.forEach(o => { o.x += o.dx * o.dir; if (o.x < 0 || o.x + o.w > canvas.width) o.dir *= -1; });
        drawGame();
        requestAnimationFrame(gameLoop);
    }
    
    canvas.addEventListener('mousedown', (e) => {
        if (!gameActive) return;
        const pos = getMousePos(e);
        let orb = orbs.find(o => !o.fed && dist(pos, o) <= o.radius);
        if (orb) {
            draggingOrb = orb;
            isColliding = false; // ADJUSTMENT: Reset the flag on new drag
            dragOffset.x = pos.x - orb.x;
            dragOffset.y = pos.y - orb.y;
            orb.startTime = Date.now();
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (draggingOrb) {
            e.preventDefault();
            const pos = getMousePos(e);
            let newX = pos.x - dragOffset.x;
            let newY = pos.y - dragOffset.y;
    
            const currentlyColliding = collidesWithObstacle(newX, newY, draggingOrb.radius);
    
            if (currentlyColliding) {
                // If we are colliding now but weren't before, count an error
                if (!isColliding) {
                    sessionData.totalMisses++;
                    levelStats.accuracy++;
                    isColliding = true; // Set the flag to prevent multiple counts
                }
                // NOTE: We don't update the orb's position if colliding
            } else {
                // If not colliding, update the orb's position and reset the flag
                draggingOrb.x = newX;
                draggingOrb.y = newY;
                isColliding = false;
            }
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (draggingOrb) {
            if (dist(draggingOrb, dragon) < dragon.radius - 10) {
                if (currentLevel >= 3 && draggingOrb.id !== requiredSequenceIndex) {
                    sessionData.totalMisses++;
                    levelStats.accuracy++;
                    const p = randomPos(draggingOrb.radius);
                    draggingOrb.x = p.x;
                    draggingOrb.y = p.y;
                } else {
                    const timeTaken = (Date.now() - draggingOrb.startTime) / 1000;
                    sessionData.allOrbTimes.push(timeTaken);
                    levelStats.speed.push(timeTaken);
                    draggingOrb.fed = true;
                    requiredSequenceIndex++;
                    drawGame();
                }
            } else {
                sessionData.totalMisses++;
                levelStats.accuracy++;
                const p = randomPos(draggingOrb.radius);
                draggingOrb.x = p.x;
                draggingOrb.y = p.y;
            }
            draggingOrb = null;
            checkLevelEnd();
        }
    });

    function collidesWithObstacle(x, y, radius) {
        return obstacles.some(o => x + radius > o.x && x - radius < o.x + o.w && y + radius > o.y && y - radius < o.y + o.h);
    }
    
    // --- Utility Functions ---
    function getMousePos(evt) { const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height; return { x: (evt.clientX - rect.left) * scaleX, y: (evt.clientY - rect.top) * scaleY }; }
    function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }
    function hexToRgb(hex) { const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); if (!m) return {r:255,g:215,b:0}; return { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) }; }
    function rgbToHex(r,g,b){ const c = v => ('0' + Math.max(0,Math.min(255, Math.round(v))).toString(16)).slice(-2); return '#' + c(r)+c(g)+c(b); }
    function lighten(hex, amt=0.2){ const {r,g,b} = hexToRgb(hex); return rgbToHex(r + (255 - r)*amt, g + (255 - g)*amt, b + (255 - b)*amt); }
    function darken(hex, amt=0.2){ const {r,g,b} = hexToRgb(hex); return rgbToHex(r*(1-amt), g*(1-amt), b*(1-amt)); }

    // --- Initial Game Start ---
    startLevel();
    requestAnimationFrame(gameLoop);
};

// my adjusted code
