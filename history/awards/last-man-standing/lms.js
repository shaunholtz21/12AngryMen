/* ============================================================
   AUTO-DETECT SEASONS (YYYY.json in current folder)
   ============================================================ */
async function loadSeasons() {
  try {
    const res = await fetch("seasons.json");
    const seasons = await res.json();
    return seasons.sort((a, b) => b - a);
  } catch (err) {
    console.error("Error loading seasons.json", err);
    return [];
  }
}

/* ============================================================
   LOAD DATA FOR ONE SEASON
   ============================================================ */
async function loadSeasonData(season) {
  try {
    const elimRes = await fetch(`${season}.json`);
    const elimData = await elimRes.json();

    const teamRes = await fetch(`${season}-teams.json`);
    const teamData = await teamRes.json();

    return { elimData, teamData };
  } catch (err) {
    console.error(`Error loading data for season ${season}`, err);
    return null;
  }
}

/* ============================================================
   RENDER ONE SEASON BLOCK
   ============================================================ */
function renderSeasonBlock(container, season) {
  const details = document.createElement("details");
  details.open = false;

  const summary = document.createElement("summary");
  summary.textContent = `${season} Last Man Standing`;
  details.appendChild(summary);

  const body = document.createElement("div");
  body.id = `season-${season}`;
  body.innerHTML = `<p>Loading ${season}…</p>`;
  details.appendChild(body);

  container.appendChild(details);
}

/* ============================================================
   COMPUTE WINNER + STATUS
   ============================================================ */
function computeSeasonStats(elimData, teamData) {
  // Map: team -> { week, score }
  const elimMap = new Map();
  for (const row of elimData) {
    elimMap.set(row.Team, { week: row.Week, score: row.Score });
  }

  const remainingTeams = teamData.filter(team => !elimMap.has(team));

  let winner = null;
  let status = "Completed";

  if (elimData.length === 0) {
    status = "Not started";
  } else if (remainingTeams.length === 0) {
    status = "Data error (no remaining team)";
  } else if (remainingTeams.length === 1) {
    winner = remainingTeams[0];
  } else {
    status = "In progress";
  }

  return { elimMap, remainingTeams, winner, status };
}

/* ============================================================
   RENDER WINNER PANEL
   ============================================================ */
function renderWinnerSection(season, mount, stats) {
  const { winner, status } = stats;

  const wrapper = document.createElement("div");
  wrapper.className = "lms-winner";

  if (winner) {
    wrapper.innerHTML = `
      <h4>🏆 Winner: <span class="lms-winner-name">${winner}</span></h4>
      <p class="lms-status">Season ${season} — ${status}</p>
    `;
  } else {
    wrapper.innerHTML = `
      <h4>🏆 Winner: <span class="lms-winner-name lms-winner-pending">TBD</span></h4>
      <p class="lms-status">Season ${season} — ${status}</p>
    `;
  }

  mount.appendChild(wrapper);
}

/* ============================================================
   RENDER ELIMINATIONS TABLE
   ============================================================ */
function renderEliminationsTable(mount, elimData) {
  const section = document.createElement("section");
  section.className = "lms-table-section";

  const title = document.createElement("h5");
  title.textContent = "Eliminations by Week";
  section.appendChild(title);

  if (!elimData.length) {
    section.innerHTML += `<p>No eliminations recorded yet.</p>`;
    mount.appendChild(section);
    return;
  }

  const table = document.createElement("table");
  table.className = "lms-table lms-table-elim";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Week</th>
      <th>Team</th>
      <th>Score</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  elimData
    .slice()
    .sort((a, b) => a.Week - b.Week)
    .forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.Week}</td>
        <td>${row.Team}</td>
        <td>${row.Score.toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });

  table.appendChild(tbody);
  section.appendChild(table);
  mount.appendChild(section);
}

/* ============================================================
   RENDER STILL-ALIVE TABLE
   ============================================================ */
function renderStillAliveTable(mount, teamData, stats) {
  const { elimMap, remainingTeams, winner } = stats;

  const section = document.createElement("section");
  section.className = "lms-table-section";

  const title = document.createElement("h5");
  title.textContent = "Still Alive / Eliminated";
  section.appendChild(title);

  const table = document.createElement("table");
  table.className = "lms-table lms-table-alive";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>Team</th>
      <th>Status</th>
      <th>Week Eliminated</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  teamData.forEach(team => {
    const tr = document.createElement("tr");

    let status = "Still Alive";
    let week = "";
    if (elimMap.has(team)) {
      status = "Eliminated";
      week = elimMap.get(team).week;
    }
    if (winner && team === winner) {
      status = "Winner";
    }

    tr.innerHTML = `
      <td>${team}</td>
      <td>${status}</td>
      <td>${week}</td>
    `;

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  section.appendChild(table);
  mount.appendChild(section);
}

/* ============================================================
   RENDER FULL SEASON CONTENT
   ============================================================ */
function renderSeasonContent(season, elimData, teamData) {
  const mount = document.getElementById(`season-${season}`);
  if (!mount) return;

  mount.innerHTML = "";

  const layout = document.createElement("div");
  layout.className = "lms-season-layout";

  const stats = computeSeasonStats(elimData, teamData);

  // Winner panel
  renderWinnerSection(season, mount, stats);

  // Two-column layout
  const columns = document.createElement("div");
  columns.className = "lms-columns";

  const leftCol = document.createElement("div");
  leftCol.className = "lms-col lms-col-left";

  const rightCol = document.createElement("div");
  rightCol.className = "lms-col lms-col-right";

  renderEliminationsTable(leftCol, elimData);
  renderStillAliveTable(rightCol, teamData, stats);

  columns.appendChild(leftCol);
  columns.appendChild(rightCol);
  mount.appendChild(columns);
}

/* ============================================================
   MAIN INITIALIZER
   ============================================================ */
async function initLms() {
  const container = document.getElementById("lms-container");
  if (!container) return;

  container.innerHTML = `<p>Loading Last Man Standing history…</p>`;

  const seasons = await loadSeasons();

  if (!seasons.length) {
    container.innerHTML = `<p>No Last Man Standing data found.</p>`;
    return;
  }

  container.innerHTML = "";
  seasons.forEach(season => renderSeasonBlock(container, season));

  for (const season of seasons) {
    const data = await loadSeasonData(season);
    if (!data) {
      const mount = document.getElementById(`season-${season}`);
      if (mount) {
        mount.innerHTML = `<p>Error loading data for ${season}.</p>`;
      }
      continue;
    }
    renderSeasonContent(season, data.elimData, data.teamData);
  }
}

/* ============================================================
   KICK IT OFF
   ============================================================ */
document.addEventListener("DOMContentLoaded", initLms);
