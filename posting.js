async function loadAnnouncements(viewer = null) {
  let url = "/api/announcements";
  if (viewer) url += "?viewer=" + viewer;

  const res = await fetch(url);
  const announcements = await res.json();

  const container = document.getElementById("eventsContainer");
  container.innerHTML = ""; // clear old cards

  announcements.forEach(a => {
    const card = `
      <div class="event-card" data-category="${a.viewer.toLowerCase()}">
        <div class="event-image" style="background-image: url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2070&q=80')">
          <span class="event-badge badge-${a.viewer.toLowerCase()}">${a.viewer}</span>
        </div>
        <div class="event-content">
          <div class="event-date">
            <i class="far fa-calendar"></i> ${a.date_post}
          </div>
          <h3 class="event-title">${a.author}</h3>
          <p class="event-description">${a.info}</p>
          <div class="event-meta">
            <span class="event-category">${a.viewer} Announcement</span>
          </div>
        </div>
      </div>`;
    container.insertAdjacentHTML("beforeend", card);
  });
}

// Load all announcements on page load
loadAnnouncements();

// Hook up buttons
document.querySelector("button[data-category='all']").onclick = () => loadAnnouncements();
document.querySelector("button[onclick*='junior']").onclick = () => loadAnnouncements("junior");
document.querySelector("button[onclick*='senior']").onclick = () => loadAnnouncements("senior");
