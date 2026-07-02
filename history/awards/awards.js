/* ============================================================
   SHARED AWARD PAGE RENDERER
   ------------------------------------------------------------
   One script powers every "single winner per year" award page
   (Iron Bank, Golden Ticket, King of the East/West, Punching Bag,
   Reach Around, Ring Seeker) and the "weekly winner" page
   (Fantasy Fiver).

   Each award page only needs:
     <body data-award="iron-bank">
   and the standard header/description/container markup below.
   All copy (title, emoji, blurb) lives in meta.json, and all
   available years live in seasons.json — update those two files
   and every award page picks it up automatically.

   Last Man Standing is intentionally NOT handled here — its data
   shape (eliminations + survivors) is different enough that it
   keeps its own dedicated lms.js.
   ============================================================ */

document.addEventListener("DOMContentLoaded", initAwardPage);

async function initAwardPage() {
  const awardKey = document.body.dataset.award;
  if (!awardKey) return; // not an award page, nothing to do

  const titleEl = document.getElementById("award-title");
  const metaEl = document.getElementById("award-meta");
  const descEl = document.getElementById("award-description");
  const container = document.getElementById("award-container");

  try {
    const [allMeta, seasons] = await Promise.all([
      fetchJSON("../meta.json"),
      fetchJSON("../seasons.json"),
    ]);

    const award = allMeta[awardKey];
    if (!award) {
      throw new Error(`No meta.json entry found for "${awardKey}"`);
    }

    // Populate header
    titleEl.textContent = award.emoji ? `${award.emoji} ${award.title}` : award.title;
    metaEl.textContent = award.meta || "";
    descEl.innerHTML = award.description || "";

    // Render history, newest year first
    const years = [...seasons].sort((a, b) => b - a);
    container.innerHTML = "";

    for (const year of years) {
      const data = await fetchJSON(`./${year}.json`).catch(() => null);
      if (!data) continue; // no file for that year yet

      if (award.type === "multi") {
        const block = renderMultiYearBlock(year, data);
        if (block) container.appendChild(block);
      } else {
        const row = renderSingleYearRow(year, data);
        if (row) container.appendChild(row);
      }
    }

    if (!container.children.length) {
      container.innerHTML = "<p>No history recorded yet.</p>";
    }
  } catch (err) {
    console.error("Error loading award page:", err);
    container.innerHTML = "<p>Unable to load award history right now.</p>";
  }
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

/* ---------- "single winner per year" awards ---------- */

function renderSingleYearRow(year, data) {
  const team = (data && data.Team) || "—";

  const row = document.createElement("div");
  row.style.padding = "0.5rem 0";
  row.style.borderBottom = "1px solid var(--border)";
  row.style.fontSize = "1.1rem";
  row.innerHTML = `<strong>${year}</strong> – ${team}`;
  return row;
}

/* ---------- Fantasy Fiver (weekly winners) ---------- */

function renderMultiYearBlock(year, data) {
  const weeks = data.filter(
    (row) =>
      row["Fantasy Fiver Award"] &&
      /^Week \d+/.test(row["Fantasy Fiver Award"]) &&
      row["Unnamed: 1"] // skip weeks that haven't been played yet
  );

  if (!weeks.length) return null;

  const block = document.createElement("div");
  block.className = "card collapse";
  block.style.marginBottom = "1.5rem";

  block.innerHTML = `
    <div class="collapse-toggle">
      <span>${year} Fantasy Fiver Winners</span>
      <span>▼</span>
    </div>
    <div class="collapse-content">
      <div style="
        background: var(--accent-soft);
        padding: 0.75rem 1rem;
        border-radius: 6px;
        margin-bottom: 1rem;
        font-weight: 600;
        color: var(--accent);
      ">
        🏆 Awarded Weekly — Highest Score Each Week
      </div>
      <table style="width:100%; border-collapse:collapse; margin-top:0.5rem;">
        <thead>
          <tr style="border-bottom:1px solid var(--border);">
            <th style="text-align:left; padding:0.5rem 0;">Week</th>
            <th style="text-align:left; padding:0.5rem 0;">Winner</th>
            <th style="text-align:left; padding:0.5rem 0;">Points</th>
          </tr>
        </thead>
        <tbody>
          ${weeks
            .map(
              (row) => `
            <tr>
              <td>${row["Fantasy Fiver Award"]}</td>
              <td>${row["Unnamed: 1"] || ""}</td>
              <td>${row["Unnamed: 2"] || ""}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  block.querySelector(".collapse-toggle").addEventListener("click", () => {
    block.classList.toggle("open");
  });

  return block;
}
