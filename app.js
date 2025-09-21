// Data and Storage
const API_BASE_URL = window.location.hostname.includes('localhost')
  ? 'http://localhost:3000'
  : 'https://gemini-backend-api.onrender.com';

const JOURNAL_KEY = 'irt:journal';
const SESS_KEY = 'irt:sessions';
const patientData = [
  { session: 1, avgTime: 3.5, errors: 7, range: 4 },
  { session: 2, avgTime: 3.1, errors: 5, range: 5 },
  { session: 3, avgTime: 2.8, errors: 4, range: 6 },
  { session: 4, avgTime: 2.5, errors: 3, range: 7 },
  { session: 5, avgTime: 2.3, errors: 2, range: 8 },
  { session: 6, avgTime: 2.1, errors: 1, range: 9 },
  { session: 7, avgTime: 2.0, errors: 1, range: 9 },
  { session: 8, avgTime: 1.9, errors: 0, range: 10 }
];

function loadJournal() { return JSON.parse(localStorage.getItem(JOURNAL_KEY) || '{}'); }
function saveJournal(j) { localStorage.setItem(JOURNAL_KEY, JSON.stringify(j)); }

function saveSession(s) {
  const arr = JSON.parse(localStorage.getItem(SESS_KEY) || '[]');
  arr.push(s);
  localStorage.setItem(SESS_KEY, JSON.stringify(arr));
}

function loadSessions(limit = 50) {
  const arr = JSON.parse(localStorage.getItem(SESS_KEY) || '[]');
  return arr.slice(-limit);
}

// Router
const app = document.getElementById('app');

function router() {
  const route = (location.hash || '#/dashboard').replace('#', '');
  let page;
  if (route.startsWith('/dashboard')) {
    page = DashboardPage();
  } else if (route.startsWith('/calendar')) {
    page = CalendarPage();
  } else if (route.startsWith('/results')) {
    page = ResultsPage();
  } else if (route.startsWith('/ai-insights')) {
    page = AI_InsightsPage();
  } else if (route.startsWith('/dragon-game')) {
    DragonGamePage();
  } else if (route.startsWith('/add-game')) {
    AddmoreGame();
  }
  else {
    app.innerHTML = `<section class="panel"><h1>Not Found</h1></section>`;
    return;
  }
  if (psge && typeof page.html == 'string' && typeof page.setup === 'function') {
    app.innerHTML = page.html;
    page.setup();

  } else if (page) {
    // For legacy pages that handle their own rendering
  }

  if (page && typeof page.html === 'string' && typeof page.setup === 'function') {
    app.innerHTML = page.html;
    page.setup();
  } else if (page) {
    // For legacy pages that handle their own rendering
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// -----------------------------------------------------------------------------
// Page Templates (The HTML for each page)
// -----------------------------------------------------------------------------
function DashboardPage() {
  app.innerHTML = `
      <section class="panel">
        <div class="row" style="justify-content:space-between; align-items:center;">
          <div><h1>Dashboard</h1><p>Select a game to play.</p></div>
        </div>

        <div class="card" style="margin-top:12px">
          <h2>Game Selection</h2>
          <div class="game-selection-grid">
          <div class="game-selection-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; padding: 20px;">
            <a href="#/dragon-game" class="game-icon-card">
              <img src="./img/dragon.jpg" alt="Dragon Game" style="width: 100px; height: 100px;">
              <h3>Dragon Game</h3>
            </a>
            <a href="#/add-game" class="game-icon-card">
              <img src="./img/add.png" alt="Add more Game" style="width: 100px; height: 100px;">
              <h3>Add More</h3>
            </a>
          </div>
        </div>
      </section>
    `;
  // No game initialization here, as the user needs to select one.
}

function DragonGamePage() {
  app.innerHTML = `
      <section class="panel">
        <div class="row" style="justify-content:space-between; align-items:center;">
          <div><h1>Dragon Game</h1><p>Control the dragon to hit the targets.</p></div>
          <a class="btn secondary" href="#/dashboard">Back to Dashboard</a>
        </div>
        <div class="card" style="margin-top:12px">
          <div class="row" style="justify-content:space-between; align-items:center;">
            <div class="row" style="gap:8px;">
              <h2 style="margin:0">Game</h2>
              <span class="badge">Live</span>
            </div>
            <button class="btn secondary" id="reset-game">Reset</button>
          </div>
          <div class="canvas-wrap" style="margin-top:8px">
            <div id="level-info"></div>
            <div id="reward-info"></div>
            <canvas id="game-canvas" width="960" height="420"></canvas>
            <button id="next-level-btn" class="btn">Next Level</button>
            <div id="stats"></div>
          </div>
        </div>
      </section>
    `;
  // Init game AFTER DOM is present
  if (typeof window.initInjuryGame === 'function') {
    window.initInjuryGame();
  } else {
    console.warn("initInjuryGame() not found. Ensure ./game/game.js defines it.");
  }

  // Optional session hook (your game may call this later)
  window.onGameSessionComplete = (payload) => {
    const s = {
      date: payload?.date || new Date().toISOString(),
      level: Number(payload?.level || 1),
      metrics: {
        avgSpeedSec: Number(payload?.avgSpeedSec || 0),
        errors: Number(payload?.errors || 0),
        romZones: Number(payload?.romZones || 0)
      },
      recoveryIndex: Number(payload?.recoveryIndex ?? 0.5)
    };
    saveSession(s);
    location.hash = '#/results';
  };
  // Makes the "Reset" button work
  document.getElementById('reset-game')?.addEventListener('click', () => {
    if (typeof window.initInjuryGame === 'function') window.initInjuryGame();
  });
}

function CalendarPage() {
  // ... (Your calendar code is good, no changes needed here) ...
  const today = ymd(new Date()); const j = loadJournal(); const selected = j[today] || { date: today, mood: 3, wellbeing: 'okay', pain: '', notes: '' };
  app.innerHTML = `<section class="panel"><div class="row" style="justify-content:space-between; align-items:center;"><div><h1>Calendar</h1><p>Track mood, wellbeing and pain daily.</p></div><a class="btn secondary" href="#/dashboard">Back to Game</a></div><div class="grid grid-2" style="margin-top:12px"><div class="card"><h2>Monthly View</h2><div id="calendar" class="calendar" style="margin-top:8px"></div></div><div class="card"><h2>Daily Check-in</h2><form id="checkin-form" class="grid" style="gap:10px"><div><label for="mood">Mood (1–5)</label><input id="mood" class="input" type="range" min="1" max="5" value="${selected.mood}" /><div class="row" style="justify-content:space-between;"><small>😞 1</small><small>😐 3</small><small>😊 5</small></div></div><div><label for="wellbeing">Wellbeing</label><select id="wellbeing" class="input">${['great', 'good', 'okay', 'meh', 'poor'].map(v => `<option ${v === selected.wellbeing ? 'selected' : ''}>${v}</option>`).join('')}</select></div><div><label for="pain">Pain (optional)</label><input id="pain" class="input" placeholder="e.g., left knee 3/10" value="${escapeHtml(selected.pain || '')}" /></div><div><label for="notes">Notes</label><textarea id="notes" rows="4" class="input" placeholder="How is everything going?">${escapeHtml(selected.notes || '')}</textarea></div><div class="row" style="justify-content:flex-end;"><button class="btn" type="submit">Save</button></div></form><div id="save-msg" style="margin-top:8px; color:#93c5fd;"></div></div></div></section>`;
  const calEl = document.getElementById('calendar'); const state = { cursor: new Date(), selected: new Date(today) }; drawCalendar(calEl, state, loadJournal());
  document.getElementById('checkin-form').addEventListener('submit', (e) => { e.preventDefault(); const day = ymd(state.selected); const journal = loadJournal(); journal[day] = { date: day, mood: Number(document.getElementById('mood').value), wellbeing: document.getElementById('wellbeing').value, pain: document.getElementById('pain').value.trim(), notes: document.getElementById('notes').value.trim() }; saveJournal(journal); document.getElementById('save-msg').textContent = `Saved ${day} ✔`; drawCalendar(calEl, state, journal); });
}

function ResultsPage() {
  const j = loadJournal();
  const days = Object.keys(j).sort();
  const latest = days.length ? j[days.at(-1)] : null;
  const sessions = loadSessions(30);

  app.innerHTML = `
      <section class="panel">
        <div class="row" style="justify-content:space-between;">
          <div><h1>Results</h1><p>Summary of your check-ins and recent game sessions.</p></div>
          <a class="btn secondary" href="#/dashboard">Dashboard</a>
        </div>
  
        <div class="grid grid-3" style="margin-top:12px">
          <div class="card"><h2>Latest Check-in</h2>${latest ? renderEntry(latest) : '<p>No entries yet.</p>'}</div>
          <div class="card"><h2>Average Mood</h2><p style="font-size:40px; margin: 12px 0;">${avg(Object.values(j).map(e => e.mood || 0)).toFixed(1)}</p><p class="badge">${Object.keys(j).length} days logged</p></div>
          <div class="card"><h2>Wellbeing Breakdown</h2>${renderWellbeingBars(Object.values(j))}</div>
        </div>
  
        <div class="card" style="margin-top:16px">
          <h2>Recent Game Sessions (last 10)</h2>
          ${sessions.length ? `<table class="table"><thead><tr><th>Date</th><th>Avg Speed (s)</th><th>Errors</th><th>ROM</th></tr></thead><tbody>${sessions.slice(-10).reverse().map(s => `<tr><td>${(s.date || '').slice(0, 10)}</td><td>${(s.metrics?.avgSpeedSec || 0).toFixed(2)}</td><td>${s.metrics?.errors || 0}</td><td>${s.metrics?.romZones || 0}</td></tr>`).join('')}</tbody></table>` : '<p>No sessions yet.</p>'}
        </div>

        <!-- NEW: CHART CONTAINERS -->
        <div class="grid grid-2" style="margin-top:16px">
            <div class="card">
                <h2>Error Rate Trend</h2>
                <canvas id="errorsChart"></canvas>
            </div>
            <div class="card">
                <h2>Average Speed Trend</h2>
                <canvas id="speedChart"></canvas>
            </div>
        </div>
      </section>
    `;

  // NEW: CHART DRAWING LOGIC
  // This code runs after the HTML is on the page
  if (sessions.length > 0) {
    const labels = sessions.map(s => (s.date || '').slice(5, 10)); // Format date as "MM-DD"
    const errorData = sessions.map(s => s.metrics?.errors || 0);
    const speedData = sessions.map(s => s.metrics?.avgSpeedSec || 0);

    // Create Error Chart
    const errorsCtx = document.getElementById('errorsChart').getContext('2d');
    new Chart(errorsCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Errors per Session',
          data: errorData,
          borderColor: '#f56565', // Red
          backgroundColor: 'rgba(245, 101, 101, 0.2)',
          fill: true,
          tension: 0.3
        }]
      }
    });

    // Create Speed Chart
    const speedCtx = document.getElementById('speedChart').getContext('2d');
    new Chart(speedCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Average Speed (s)',
          data: speedData,
          borderColor: '#4299e1', // Blue
          backgroundColor: 'rgba(66, 153, 225, 0.2)',
          fill: true,
          tension: 0.3
        }]
      }
    });
  }
}

// -----------------------------------------------------------------------------
// Helper Functions (Calendar, etc.)
// -----------------------------------------------------------------------------
function drawCalendar(root, state, journal) {
  const cur = new Date(state.cursor.getFullYear(), state.cursor.getMonth(), 1);
  const year = cur.getFullYear(); const month = cur.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = ymd(new Date());
  const selectedStr = ymd(state.selected);
  root.innerHTML = `<div class="cal-head"><button class="btn secondary" id="prev-month">◀</button><div><strong>${cur.toLocaleString(undefined, { month: 'long' })}</strong> ${year}</div><button class="btn secondary" id="next-month">▶</button></div><div class="cal-grid">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div class="cal-dow">${d}</div>`).join('')}${Array.from({ length: firstDow }).map(() => '<div></div>').join('')}${Array.from({ length: daysInMonth }, (_, i) => { const d = i + 1; const dateStr = ymd(new Date(year, month, d)); const has = Boolean(journal[dateStr]); const isToday = dateStr === todayStr; const isSel = dateStr === selectedStr; const cls = ['cal-cell', has ? 'has-entry' : '', isToday ? 'today' : '', isSel ? 'selected' : ''].join(' ').trim(); return `<div class="${cls}" data-date="${dateStr}">${d}</div>`; }).join('')}</div>`;
  root.querySelector('#prev-month').onclick = () => { state.cursor = new Date(year, month - 1, 1); drawCalendar(root, state, journal); }; root.querySelector('#next-month').onclick = () => { state.cursor = new Date(year, month + 1, 1); drawCalendar(root, state, journal); }; root.querySelectorAll('.cal-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const dateStr = cell.dataset.date; // e.g., "2025-09-07"
      // Manually parse the date string to ensure correct handling
      const parts = dateStr.split('-');
      const clickedDate = new Date(parts[0], parts[1] - 1, parts[2]); // Note: month is 0-indexed

      state.selected = clickedDate; // Update the selected date in the state

      const journalEntry = journal[dateStr] || { date: dateStr, mood: 3, wellbeing: 'okay', pain: '', notes: '' };

      document.getElementById('mood').value = journalEntry.mood;
      document.getElementById('wellbeing').value = journalEntry.wellbeing;
      document.getElementById('pain').value = journalEntry.pain || '';
      document.getElementById('notes').value = journalEntry.notes || '';

      drawCalendar(root, state, journal);
    });
  });
}
function ymd(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10); }
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function escapeHtml(s) { return (s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
function renderEntry(e) { return `<p><strong>${e.date}</strong></p><p>Mood: ${e.mood}/5</p><p>Wellbeing: ${e.wellbeing}</p><p>Pain: ${escapeHtml(e.pain || '—')}</p><p>Notes: ${escapeHtml(e.notes || '—')}</p>`; }
function renderWellbeingBars(entries) { if (!entries.length) return '<p>No data yet.</p>'; const counts = entries.reduce((acc, e) => (acc[e.wellbeing] = (acc[e.wellbeing] || 0) + 1, acc), {}); const all = ['great', 'good', 'okay', 'meh', 'poor']; const total = entries.length || 1; return all.map(k => { const n = counts[k] || 0; const pct = Math.round((n / total) * 100); return `<div style="margin:8px 0;"> <div class="row" style="justify-content:space-between;"> <span>${k}</span><span>${n} (${pct}%)</span> </div> <div style="height:8px; background:#0b1530; border:1px solid #203260; border-radius:999px; overflow:hidden;"> <div style="height:100%; width:${pct}%; background:#60a5fa;"></div> </div> </div>`; }).join(''); }
const toggleButton = document.getElementById('theme-toggle'); const themeIcon = document.getElementById('theme-icon'); if (toggleButton) { let isDark = document.body.classList.contains('dark-theme'); toggleButton.addEventListener('click', () => { isDark = !isDark; document.body.classList.toggle('dark-theme', isDark); document.body.classList.toggle('light-theme', !isDark); if (themeIcon) { themeIcon.src = isDark ? "./img/mode.png" : "./img/dark-mode.png"; } }); }

/*
function processPatientData() {
    // Check if the global variable exists and has data
    if (window.gameData && window.gameData.history.length > 0) {
        // Retrieve the data from the last completed level
        const patientData = window.gameData.history[window.gameData.history.length - 1];
        
        console.log("Patient Data for the last round:");
        console.log(`Level: ${patientData.level}`);
        console.log(`Average Speed: ${patientData.speed}s`);
        console.log(`Misses/Errors: ${patientData.accuracy}`);
        console.log(`Range of Motion: ${patientData.rangeOfMotion} zones`);
        
        // You can now use this data for your AI model or other processing
        // For example:
        // sendDataToAI(patientData); 
        // updateDashboard(patientData);
    } else {
        console.log("No game data available yet.");
    }
}

*/
// AI Insights Page (separate from chatbot)
function AI_InsightsPage() {
  const html = `
    <section class="panel">
      <h1>AI Insights: Correlations in Patient Activity</h1>
      <div class="button-row">
        <button id="analyze-btn">Analyze Data for Correlations</button>
        <button id="outliers-btn">Analyze Data for Outliers</button>
      </div>
      <div id="ai-analysis-output"></div>
    </section>
  `;

  const setup = () => {
    const outputDiv = document.getElementById("ai-analysis-output");
    const analyzeBtn = document.getElementById("analyze-btn");
    const outliersBtn = document.getElementById("outliers-btn");
    analyzeBtn.addEventListener("click", async () => {
      outputDiv.textContent = "Analyzing data with AI...";
      try {
          const response = await fetch(`${API_BASE_URL}/analyze-data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: patientData })
        });
        if (!response.ok) throw new Error('Server response was not ok');
        const result = await response.json();
        outputDiv.textContent = result.analysis;
      } catch (e) {
        outputDiv.textContent = "There was an error analyzing the data.";
        console.error("Fetch error:", e);
      }
    });

    outliersBtn.addEventListener("click", async () => {
      outputDiv.textContent = "Analyzing data for outliers...";
      try {
        const response = await fetch(`${API_BASE_URL}/analyze-outliers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: patientData })
        });
        if (!response.ok) throw new Error('Server response was not ok');
        const result = await response.json();
        if (result.analysis.summary) {
          let html = `<h3>${result.analysis.summary}</h3>`;
          if (result.analysis.outliers && result.analysis.outliers.length > 0) {
            html += "<h2>Outliers Found:</h2><ul>";
            result.analysis.outliers.forEach(outlier => {
              html += `<li><strong>Session ${outlier.session}</strong>: An unusual ${outlier.metric} was detected. Reason: ${outlier.reason}</li>`;
            });
            html += "</ul>";
          } else {
            html += "<p>No significant outliers were detected.</p>";
          }
          outputDiv.innerHTML = html;
        } else {
          outputDiv.textContent = JSON.stringify(result.analysis, null, 2);
        }
      } catch (e) {
        outputDiv.textContent = "There was an error analyzing the data for outliers.";
        console.error("Fetch error:", e);
      }
    });
  };

  return { html, setup };
}

// Initialize Floating Chatbot
function initFloatingChatbot() {
  const chatToggleBtn = document.getElementById('chat-toggle-btn');
  const chatbotContainer = document.getElementById('floating-chatbot-container');
  const chatInput = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const chatbox = document.getElementById('chatbox');
  let hasGreeted = false;

  // Chatbot toggle logic
  chatToggleBtn.addEventListener('click', () => {
    chatbotContainer.classList.toggle('is-visible');
  });

  // Helper function to add messages to the chatbox
  function addMessageToChatbox(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(sender === "user" ? "user-message" : "system-message");
    messageDiv.textContent = text;
    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
  }
  // Chatbot send message logic
  chatSendBtn.addEventListener("click", async () => {
    const userMessage = chatInput.value.trim();
    if (userMessage === "") return;

    if (!hasGreeted) {
      chatbox.innerHTML = "";
      hasGreeted = true;
    }

    addMessageToChatbox(userMessage, "user");
    chatInput.value = "";

    try {
      addMessageToChatbox("Typing...", "system");
        const response = await fetch(`${API_BASE_URL}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage, data: patientData })
      });

      const result = await response.json();
      chatbox.removeChild(chatbox.lastChild);
      addMessageToChatbox(result.response, "system");
    } catch (e) {
      chatbox.removeChild(chatbox.lastChild);
      addMessageToChatbox("Sorry, I could not process that request.", "system");
      console.error("Chatbot error:", e);
    }
  });

  chatInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      chatSendBtn.click();
    }
  });
}

function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const isDark = localStorage.getItem('theme') === 'dark';

  if (isDark) {
    document.body.classList.add('dark-theme');
    icon.innerHTML = `<path d="M12 2a9.99 9.99 0 0 1 8 4c-1.33 3.4-6 6-8 6s-6.67-2.6-8-6a9.99 9.99 0 0 1 8-4z" />`;
  } else {
    document.body.classList.add('light-theme');
    icon.innerHTML = `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/>`;
  }

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    if (currentTheme === 'dark') {
      icon.innerHTML = `<path d="M12 2a9.99 9.99 0 0 1 8 4c-1.33 3.4-6 6-8 6s-6.67-2.6-8-6a9.99 9.99 0 0 1 8-4z" />`;
    } else {
      icon.innerHTML = `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/>`;
    }
  });
}

window.addEventListener('load', () => {
  router();
  initFloatingChatbot();
  setupThemeToggle();
});