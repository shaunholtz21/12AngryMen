document.addEventListener("DOMContentLoaded", () => {
  const seasonSelect = document.getElementById("seasonSelect");
  const weekSelect = document.getElementById("weekSelect");
  const loadBtn = document.getElementById("loadRecapBtn");
  const contentDiv = document.getElementById("content");

  if (!seasonSelect || !weekSelect || !loadBtn || !contentDiv) return;

  loadBtn.addEventListener("click", () => {
    const season = seasonSelect.value;
    const week = weekSelect.value;

    const filePath = `${season}/${week}.html`;

    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error("Recap not found");
        }
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
