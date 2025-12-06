document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.getElementById("studentsTableBody");
    const loadingMessage = document.getElementById("loadingMessage");
    const noDataMessage = document.getElementById("noDataMessage");

    const strandFilter = document.getElementById("strandFilter");
    const gradeFilter = document.getElementById("gradeFilter");
    const statusFilter = document.getElementById("statusFilter");
    const sortBy = document.getElementById("sortBy");

    let allStudents = [];

    // -----------------------------
    // Render table
    // -----------------------------
    function renderTable(students) {
        tableBody.innerHTML = "";

        if (!students || students.length === 0) {
            noDataMessage.style.display = "block";
            return;
        } else {
            noDataMessage.style.display = "none";
        }

        students.forEach(student => {
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
    }

    // -----------------------------
    // Individual filter functions
    // -----------------------------
    function normalize(str) {
        return (str || "")
            .toLowerCase()
            .replace(/&/g, "and")   // unify "&" vs "and"
            .replace(/\s+/g, " ")   // collapse whitespace
            .trim();
    }

    function filterByStrand(students) {
        const val = strandFilter ? normalize(strandFilter.value) : "";
        if (!val) return students; // All Strands → no filter

        return students.filter(s => {
            const strandNorm = normalize(s.strand);

            // Handle TVL special case
            if (val.startsWith("tvl")) {
                return strandNorm.startsWith("tvl");
            }
            return strandNorm === val;
        });
    }

    function filterByGrade(students) {
        const val = gradeFilter ? gradeFilter.value : "";
        if (!val) return students;
        return students.filter(s => s.grade === val);
    }

    function filterByStatus(students) {
        const val = statusFilter ? statusFilter.value : "";
        if (!val) return students;
        return students.filter(s => s.status === val);
    }

    function sortStudents(students) {
        if (!sortBy) return students;
        const val = sortBy.value;
        let sorted = [...students];

        if (val === "newest") {
            sorted.sort((a, b) => new Date(b.reg_date) - new Date(a.reg_date));
        } else if (val === "oldest") {
            sorted.sort((a, b) => new Date(a.reg_date) - new Date(b.reg_date));
        } else if (val === "name") {
            sorted.sort((a, b) => a.full_name.localeCompare(b.full_name));
        }
        return sorted;
    }

    // -----------------------------
    // Apply filters in sequence
    // -----------------------------
    function applyAllFilters() {
        let filtered = filterByStrand(allStudents);
        filtered = filterByGrade(filtered);
        filtered = filterByStatus(filtered);
        filtered = sortStudents(filtered);
        renderTable(filtered);
    }

    // -----------------------------
    // Event listeners
    // -----------------------------
    if (strandFilter) strandFilter.addEventListener("change", applyAllFilters);
    if (gradeFilter) gradeFilter.addEventListener("change", applyAllFilters);
    if (statusFilter) statusFilter.addEventListener("change", applyAllFilters);
    if (sortBy) sortBy.addEventListener("change", applyAllFilters);

    // -----------------------------
    // Fetch students initially
    // -----------------------------
    if (tableBody) {
        fetch("/get_registrations")
            .then(response => response.json())
            .then(data => {
                loadingMessage.style.display = "none";
                allStudents = Array.isArray(data) ? data : [];
                applyAllFilters(); // initial render
            })
            .catch(error => {
                loadingMessage.style.display = "none";
                console.error("Error loading registrations:", error);
                noDataMessage.style.display = "block";
            });
    }
});
