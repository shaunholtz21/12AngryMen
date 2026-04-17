// Auto-detect seasons by scanning the LMS directory
async function loadSeasons() {
  const container = document.getElementById("lms-container");

  try {
    // Fetch directory listing (works on GitHub Pages)
    const res = await fetch(".");
    const text = await res.text();

    // Extract all filenames ending in .json but NOT -teams.json
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
