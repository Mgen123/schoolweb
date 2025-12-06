function openAnnouncementModal() {
    document.getElementById("announcementModal").style.display = "block";
}

function closeAnnouncementModal() {
    document.getElementById("announcementModal").style.display = "none";
}

// Attach event listeners after DOM loads
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("postAnnouncementBtn")
        .addEventListener("click", openAnnouncementModal);

    document.querySelector("#announcementModal .close")
        .addEventListener("click", closeAnnouncementModal);
});

