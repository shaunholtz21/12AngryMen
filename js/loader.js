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

    return data.seasons; // return list so we can pick newest
  } catch (err) {
    console.error("Failed to load seasons:", err);
    return [];
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

    return data.weeks; // return list so we know the latest week
  } catch (err) {
    console.error("Failed to load weeks:", err);
    return [];
  }
}

// ------------------------------
// Load Recap Helper
// ------------------------------
function loadRecap(seasonSelect, weekSelect, contentDiv) {
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
  loadSeasons(seasonSelect).then(seasons => {
    if (seasons.length > 0) {
      // Auto-select the newest season (first in sorted list)
      const newestSeason = seasons[0];
      seasonSelect.value = newestSeason;

      // Load weeks for that season
      loadWeeks(newestSeason, weekSelect).then(weeks => {
        if (weeks.length > 0) {
          // Auto-select the newest week
          const latestWeek = weeks[weeks.length - 1];
          weekSelect.value = latestWeek;

          // Auto-load the latest recap
          loadRecap(seasonSelect, weekSelect, contentDiv);
        }
      });
    }
  });

  // When season changes, reload weeks and auto-load latest
  seasonSelect.addEventListener("change", () => {
    loadWeeks(seasonSelect.value, weekSelect).then(weeks => {
      if (weeks.length > 0) {
        weekSelect.value = weeks[weeks.length - 1];
        loadRecap(seasonSelect, weekSelect, contentDiv);
      }
    });
  });

  // Manual load button
  loadBtn.addEventListener("click", () => {
    loadRecap(seasonSelect, weekSelect, contentDiv);
  });
});
