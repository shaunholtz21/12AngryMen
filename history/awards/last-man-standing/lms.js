function debug(msg) {
  const el = document.getElementById("lms-container");
  el.innerHTML += `<div style="color:red; font-weight:bold;">DEBUG: ${msg}</div>`;
}

/* ============================================================
   LOAD SEASONS
   ============================================================ */
async function loadSeasons() {
  debug("loadSeasons() started");

  try {
    const res = await fetch(".");
    const text = await res.text();

    debug("Fetched directory listing");

    const seasonFiles = [...text.matchAll(/(\d{4})\.json/g)].map(m => m[1]);

    debug("Detected seasons: " + JSON.stringify(seasonFiles));

    return seasonFiles.sort((a, b) => b - a);

  } catch (err) {
    debug("ERROR in loadSeasons: " + err);
    return [];
  }
}

/* ============================================================
   RENDER COLLAPSIBLES
   ============================================================ */
function renderSeasonBlocks(seasons) {
  debug("renderSeasonBlocks() with seasons: " + JSON.stringify(seasons));

  const container = document.getElementById("lms-container");
  container.innerHTML = "";

  seasons.forEach(season => {
    container.innerHTML += `
      <details>
        <summary>${season} Last Man Standing</summary>
        <div id="season-${season}">Loading ${season}…</div>
      </details>
    `;
  });
}

/* ============================================================
   LOAD SEASON DATA
   ============================================================ */
async function loadSeasonData(season) {
  debug(`Loading JSON for ${season}`);

  try {
    const elimRes = await fetch(`${season}.json`);
    const elimData = await elimRes.json();

    const teamRes = await fetch(`${season}-teams.json`);
    const teamData = await teamRes.json();

    debug(`Loaded elim + team data for ${season}`);

    return { elimData, teamData };

  } catch (err) {
    debug(`ERROR loading season ${season}: ${err}`);
    return null;
  }
}

/* ============================================================
   RENDER CONTENT
   ============================================================ */
function renderSeasonContent(season, elimData, teamData) {
  debug(`Rendering content for ${season}`);

  const container = document.getElementById(`season-${season}`);

  if (!container) {
    debug(`ERROR: container season-${season} not found`);
    return;
  }

  container.innerHTML = `
    <h3>Winner placeholder</h3>
    <p>Eliminations table coming next</p>
    <p>Still alive table coming next</p>
  `;
}

/* ============================================================
   MAIN EXECUTION
   ============================================================ */
debug("Script started");

loadSeasons().then(async seasons => {
  debug("Seasons loaded: " + JSON.stringify(seasons));

  renderSeasonBlocks(seasons);

  for (const season of seasons) {
    debug("Processing season: " + season);

    const data = await loadSeasonData(season);

    if (!data) {
      debug(`Skipping ${season} due to load error`);
      continue;
    }

    renderSeasonContent(season, data.elimData, data.teamData);
  }

  debug("DONE");
});
