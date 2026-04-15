// ------------------------------
// Auto‑detect Seasons
// ------------------------------
async function loadSeasons(seasonSelect) {
  try {
    const response = await fetch("recaps/seasons.json");
    const data = await response.json();

    seasonSelect.innerHTML = "";

    data.seasons.forEach(season => {
      const opt = document.createElement("option");
      opt.value = season;
      opt.textContent = season;
      seasonSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to load seasons:", err);
  }
}

// ------------------------------
// Auto‑detect Weeks
// ------------------------------
async function loadWeeks(season, weekSelect) {
  try {
    const response = await fetch(`recaps/${season}/weeks.json`);
    const data = await response.json();

    weekSelect.innerHTML = "";

    data.weeks.forEach(week => {
      const opt = document.createElement("option");
      opt.value = week;
      opt.textContent = week.replace("week", "Week ");
      weekSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Failed to load weeks:", err);
  }
}

// ------------------------------
// Main Loader
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const seasonSelect = document.getElementById("seasonSelect");
  const weekSelect = document.getElementById("weekSelect");
  const loadBtn = document.getElementById("loadRecapBtn");
  const contentDiv = document.getElementById("content");

  // Load seasons first
  loadSeasons(seasonSelect).then(() => {
    // After seasons load, load weeks for the first season
    loadWeeks(seasonSelect.value, weekSelect);
  });

  // When season changes, reload weeks
  seasonSelect.addEventListener("change", () => {
    loadWeeks(seasonSelect.value, weekSelect);
  });

  // Load recap on button click
  loadBtn.addEventListener("click", () => {
    const season = seasonSelect.value;
    const week = weekSelect.value;

    const filePath = `recaps/${season}/${week}.html`;

    fetch(filePath)
      .then(response => {
        if (!response.ok) throw new Error("Not found");
        return response.text();
      })
      .then(html => {
        contentDiv.innerHTML = html;
      })
      .catch(() => {
        contentDiv.innerHTML = `
          <p style="color: var(--muted);">
            No recap available for ${season} ${week.replace("week", "Week ")}.
          </p>
        `;
      });
  });
});
