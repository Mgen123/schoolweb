// Delete button
const deleteBtn = document.getElementById("deleteBtn");

function deleteStudents() {
    const selected = Array.from(document.querySelectorAll(".student-checkbox:checked"))
                          .map(cb => cb.value);

    if (selected.length === 0) {
        alert("Please select at least one student to delete.");
        return;
    }

    if (!confirm("Are you sure you want to delete the selected student(s)?")) {
        return;
    }

    fetch("/delete_students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected })
    })
    .then(res => res.json())
    .then(result => {
        console.log("Delete result:", result);
        // Refresh table after delete
        location.reload();
    })
    .catch(err => console.error("Error deleting students:", err));
}

if (deleteBtn) {
    deleteBtn.addEventListener("click", deleteStudents);
}
