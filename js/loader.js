document.addEventListener("DOMContentLoaded", () => {
  const seasonSelect = document.getElementById("seasonSelect");
  const weekSelect = document.getElementById("weekSelect");
  const loadBtn = document.getElementById("loadRecapBtn");
  const contentDiv = document.getElementById("content");

  // Load manifest
  fetch("recaps.json")
    .then(res => res.json())
    .then(manifest => {
      // Populate seasons
      Object.keys(manifest)
        .sort()
        .reverse()
        .forEach(season => {
          const opt = document.createElement("option");
          opt.value = season;
          opt.textContent = season;
          seasonSelect.appendChild(opt);
        });

      // Populate weeks when season changes
      seasonSelect.addEventListener("change", () => {
        const season = seasonSelect.value;
        const weeks = manifest[season] || [];

        weekSelect.innerHTML = "";
        weeks.forEach(w => {
          const opt = document.createElement("option");
          opt.value = w;
          opt.textContent = w.replace("week", "Week ");
          weekSelect.appendChild(opt);
        });
      });

      // Trigger initial load
      seasonSelect.dispatchEvent(new Event("change"));
    });

  // Load recap
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
