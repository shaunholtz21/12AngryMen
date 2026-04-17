/* ============================================================
   LOAD SEASONS (auto-detect all YYYY.json files)
   ============================================================ */
async function loadSeasons() {
  const container = document.getElementById("lms-container");

  try {
    const res = await fetch(".");
    const text = await res.text();

    // Match files like 2026.json but NOT 2026-teams.json
    const seasonFiles = [...text.matchAll(/(\d{4})\.json/g)].map(m => m[1]);

    // Sort newest → oldest
    const seasons = seasonFiles.sort((a, b) => b - a);

    return seasons;

  } catch (err) {
    container.innerHTML = "<p>Error loading seasons.</p>";
    console.error(err);
    return [];
  }
}

/* ============================================================
   RENDER COLLAPSIBLE SEASON BLOCKS
   ============================================================ */
function renderSeasonBlocks(seasons) {
  const container = document.getElementById("lms-container");
  container.innerHTML = ""; // Clear loading text

  seasons.forEach(season => {
    const block = document.createElement("div");
    block.className = "season-block";

    block.innerHTML = `
      <details class="season-collapse">
        <summary class="season-header">
          <span>${season} Last Man Standing</span>
        </summary>

        <div class="season-content" id="season-${season}">
          <p>Loading ${season} data…</p>
        </div>
      </details>
    `;

    container.appendChild(block);
  });
}

/* ============================================================
   LOAD JSON FOR A SEASON
   ============================================================ */
async function loadSeasonData(season) {
  try {
    const elimRes = await fetch(`${season}.json`);
    const elimData = await elimRes.json();

    const teamRes = await fetch(`${season}-teams.json`);
    const teamData = await teamRes.json();

    return { elimData, teamData };

  } catch (err) {
    console.error(`Error loading data for ${season}`, err);
    return null;
  }
}

/* ============================================================
   COMPUTE WINNER
   ============================================================ */
function computeWinner(elimData, teamList) {
  const eliminated = elimData.map(e => e.Team);
  const alive = teamList.filter(t => !eliminated.includes(t));
  return alive.length === 1 ? alive[0] : null;
}

/* ============================================================
   RENDER SEASON CONTENT
   ============================================================ */
function renderSeasonContent(season, elimData, teamData) {
  const container = document.getElementById(`season-${season}`);

  const winner = computeWinner(elimData, teamData);

  container.innerHTML = `
    <div class="lms-winner" style="margin-bottom:1rem;">
      <h3>🏆 Winner: ${winner || "Unknown"}</h3>
    </div>

    <div class="lms-tables" style="display:flex; gap:2rem;">
      <div class="lms-left" style="flex:1;">
        <h4>Eliminations</h4>
        <p>(Table coming next)</p>
      </div>

      <div class="lms-right" style="flex:1;">
        <h4>Still Alive</h4>
        <p>(Table coming next)</p>
      </div>
    </div>
  `;
}

/* ============================================================
   MAIN EXECUTION — THIS IS THE PART YOU WERE MISSING
   ============================================================ */
loadSeasons().then(async seasons => {
  renderSeasonBlocks(seasons);

  for (const season of seasons) {
    const data = await loadSeasonData(season);
    if (data) {
      renderSeasonContent(season, data.elimData, data.teamData);
    }
  }
});
