/* ============================================================
   LOAD SEASONS (auto-detect all YYYY.json files)
   ============================================================ */
async function loadSeasons() {
  const container = document.getElementById("lms-container");

  try {
    // Fetch directory listing (works on GitHub Pages)
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
   MAIN EXECUTION
   ============================================================ */
loadSeasons().then(seasons => {
  renderSeasonBlocks(seasons);
});
