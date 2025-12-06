document.addEventListener("DOMContentLoaded", function() {
    // -----------------------------
    // Admin credentials
    // -----------------------------
    const ADMIN_CREDENTIALS = {
        username: "Me Admin",
        password: "ad_min01"
    };

    // -----------------------------
    // Login / Logout
    // -----------------------------
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                localStorage.setItem('adminLoggedIn', 'true');
                showDashboard();
                alert("Login successful!");
            } else {
                alert("Invalid username or password");
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            showLogin();
            alert("You have been logged out");
        });
    }

    function showDashboard() {
        if (loginSection) loginSection.style.display = 'none';
        if (dashboardSection) dashboardSection.style.display = 'block';
    }

    function showLogin() {
        if (loginSection) loginSection.style.display = 'flex';
        if (dashboardSection) dashboardSection.style.display = 'none';
        const username = document.getElementById('username');
        const password = document.getElementById('password');
        if (username) username.value = '';
        if (password) password.value = '';
    }

    // Auto-show dashboard if already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    } else {
        showLogin();
    }

    // -----------------------------
    // Populate Students Table
    // -----------------------------
    const tableBody = document.getElementById("studentsTableBody");
    const loadingMessage = document.getElementById("loadingMessage");
    const noDataMessage = document.getElementById("noDataMessage");

    // Approve/Reject buttons
    const approveBtn = document.getElementById("approveBtn");
    const rejectBtn = document.getElementById("rejectBtn");

    function updateStatus(newStatus) {
        const selected = Array.from(document.querySelectorAll(".student-checkbox:checked"))
                              .map(cb => cb.value);

        if (selected.length === 0) {
            alert("Please select at least one student.");
            return;
        }

        fetch("/update_status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: selected, status: newStatus })
        })
        .then(res => res.json())
        .then(result => {
            console.log("Update result:", result);
            // Refresh table after update
            location.reload();
        })
        .catch(err => console.error("Error updating status:", err));
    }

    if (approveBtn) {
        approveBtn.addEventListener("click", () => updateStatus("Approved"));
    }
    if (rejectBtn) {
        rejectBtn.addEventListener("click", () => updateStatus("Rejected"));
    }

    if (tableBody) {
        fetch("/get_registrations")
            .then(response => response.json())
            .then(data => {
                console.log("Fetched data:", data); // Debugging
                if (loadingMessage) loadingMessage.style.display = "none";

                if (!data || data.length === 0) {
                    if (noDataMessage) noDataMessage.style.display = "block";
                    return;
                }

                data.forEach(student => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td><input type="checkbox" class="student-checkbox" value="${student.id}"></td>
                        <td>${student.id}</td>
                        <td>${student.full_name}</td>
                        <td>${student.email}</td>
                        <td>${student.strand}</td>
                        <td>${student.grade}</td>
                        <td>${student.dateofbirth}</td>
                        <td>${student.reg_date}</td>
                        <td><span class="status-label">${student.status}</span></td>
                    `;
                    tableBody.appendChild(row);
                });

                // Optional: master "select all" checkbox
                const selectAll = document.getElementById("selectAll");
                if (selectAll) {
                    selectAll.addEventListener("change", function() {
                        const checkboxes = document.querySelectorAll(".student-checkbox");
                        checkboxes.forEach(cb => cb.checked = this.checked);
                    });
                }
            })
            .catch(error => {
                if (loadingMessage) loadingMessage.style.display = "none";
                console.error("Error loading registrations:", error);
            });
    }
});
