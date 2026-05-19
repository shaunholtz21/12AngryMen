// WEEKLY NOTES PAGE LOADER
document.addEventListener("DOMContentLoaded", () => {
  const seasonSelect = document.getElementById("wn-seasonSelect");
  const weekSelect = document.getElementById("wn-weekSelect");
  const loadBtn = document.getElementById("wn-loadRecapBtn");
  const contentDiv = document.getElementById("wn-content");
  const title = document.getElementById("weeklyRecapTitle");

  // If these elements don't exist, we're not on the Weekly Notes page
  if (!seasonSelect || !weekSelect || !loadBtn || !contentDiv) return;

  // ------------------------------
  // Load Seasons
  // ------------------------------
  async function loadSeasons() {
    try {
      const response = await fetch("../recaps/seasons.json");
      const data = await response.json();

      seasonSelect.innerHTML = "";

      data.seasons.forEach(season => {
        const opt = document.createElement("option");
        opt.value = season;
        opt.textContent = season;
        seasonSelect.appendChild(opt);
      });

      // Load weeks for the newest season
      loadWeeks(data.seasons[0]);
    } catch (err) {
      console.error("Failed to load seasons:", err);
    }
  }

  // ------------------------------
  // Load Weeks
  // ------------------------------
  async function loadWeeks(season) {
    try {
      const response = await fetch(`../recaps/${season}/weeks.json`);
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
  // Load Recap
  // ------------------------------
  async function loadRecap() {
    const season = seasonSelect.value;
    const week = weekSelect.value;

    const filePath = `../recaps/${season}/${week}.html`;

    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error("Not found");

      const html = await response.text();
      contentDiv.innerHTML = html;

      // Update title
      title.textContent = `Week ${week.replace("week", "")} — ${season} Recap`;

      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      contentDiv.innerHTML = `
        <p style="color: var(--muted);">
          No recap available for ${season} ${week.replace("week", "Week ")}.
        </p>
      `;
    }
  }

  // ------------------------------
  // Event Listeners
  // ------------------------------
  seasonSelect.addEventListener("change", () => {
    loadWeeks(seasonSelect.value);
  });

  loadBtn.addEventListener("click", loadRecap);

  // ------------------------------
  // Initialize
  // ------------------------------
  loadSeasons();
});
