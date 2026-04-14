document.addEventListener("DOMContentLoaded", () => {
  const seasonSelect = document.getElementById("seasonSelect");
  const weekSelect = document.getElementById("weekSelect");
  const loadBtn = document.getElementById("loadRecapBtn");
  const contentDiv = document.getElementById("content");

  if (!seasonSelect || !weekSelect || !loadBtn || !contentDiv) return;

  // 🔹 Seasons you support (only touch this once a year)
  const seasons = ["2025", "2024"];

  // 🔹 How many regular season weeks you want
  const MAX_WEEKS = 18;

  // Populate seasons
  seasons.forEach(season => {
    const opt = document.createElement("option");
    opt.value = season;
    opt.textContent = season;
    seasonSelect.appendChild(opt);
  });

  // Populate weeks
  function populateWeeks() {
    weekSelect.innerHTML = "";
    for (let i = 1; i <= MAX_WEEKS; i++) {
      const value = `week${i}`;
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = `Week ${i}`;
      weekSelect.appendChild(opt);
    }
  }

  populateWeeks();

  // Load recap on click
  loadBtn.addEventListener("click", () => {
    const season = seasonSelect.value;
    const week = weekSelect.value;

    const filePath = `${season}/${week}.html`;

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
