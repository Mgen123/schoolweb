document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById("studentsTableBody");
    const loadingMessage = document.getElementById("loadingMessage");
    const noDataMessage = document.getElementById("noDataMessage");

    fetch("/get_registrations")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok: " + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log("Fetched data:", data);
            // ... rest of your code
        })
        .catch(error => {
            loadingMessage.style.display = "none";
            console.error("Error loading registrations:", error);
            noDataMessage.style.display = "block";
            noDataMessage.textContent = "⚠️ Failed to load student data.";
        });

});
