// Global application functions
function openModal() {
    document.getElementById('registrationModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('registrationModal').style.display = 'none';
}

function closeConfirmation() {
    document.getElementById('confirmationModal').style.display = 'none';
}

function closeApplications() {
    document.getElementById('applicationsModal').style.display = 'none';
}

function viewApplications() {
    try {
        const applications = getApplications();
        const applicationsList = document.getElementById('applicationsList');
        
        if (applications.length === 0) {
            applicationsList.innerHTML = '<p class="no-data">No applications found.</p>';
        } else {
            applicationsList.innerHTML = applications.map(app => `
                <div class="application-item">
                    <div class="application-header">
                        <span class="application-name">${escapeHtml(app.name)}</span>
                        <span class="application-date">${new Date(app.submitted_at).toLocaleDateString()}</span>
                    </div>
                    <div class="application-details">
                        <div class="application-detail">
                            <span class="detail-label">Email</span>
                            <span>${escapeHtml(app.email)}</span>
                        </div>
                        <div class="application-detail">
                            <span class="detail-label">Strand</span>
                            <span>${escapeHtml(app.strand)}</span>
                        </div>
                        <div class="application-detail">
                            <span class="detail-label">Grade Level</span>
                            <span>${escapeHtml(app.grade_level)}</span>
                        </div>
                        <div class="application-detail">
                            <span class="detail-label">Date of Birth</span>
                            <span>${app.dob}</span>
                        </div>
                        <div class="application-detail">
                            <span class="detail-label">Status</span>
                            <span class="status-pending">Pending</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        closeConfirmation();
        document.getElementById('applicationsModal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading applications:', error);
        showToast('Failed to load applications', 'error');
    }
}

function exportData() {
    try {
        const applications = getApplications();
        
        if (applications.length === 0) {
            showToast('No data to export', 'error');
            return;
        }

        const headers = ['ID', 'Name', 'Email', 'Strand', 'Grade Level', 'Date of Birth', 'Submitted At'];
        const csvRows = [headers.join(',')];

        applications.forEach(app => {
            const row = [
                app.id,
                `"${app.name.replace(/"/g, '""')}"`,
                app.email,
                app.strand,
                app.grade_level,
                app.dob,
                app.submitted_at
            ];
            csvRows.push(row.join(','));
        });

        const csvData = csvRows.join('\n');
        
        // Create download link
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student-applications-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Export failed: ' + error.message, 'error');
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = [
        'registrationModal',
        'confirmationModal',
        'applicationsModal'
    ];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            if (modalId === 'registrationModal') closeModal();
            if (modalId === 'confirmationModal') closeConfirmation();
            if (modalId === 'applicationsModal') closeApplications();
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing application');
    
    // Initialize database
    if (typeof initDatabase === 'function') {
        initDatabase();
    }
    
    // Setup form validation
    if (typeof setupFormValidation === 'function') {
        setTimeout(() => {
            setupFormValidation();
        }, 1000);
    }
    
    // Initialize strand toggle functionality (if exists)
    const strandCategories = document.querySelectorAll('.Strand-category h3');
    strandCategories.forEach(category => {
        category.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.classList.toggle('active');
        });
    });

    console.log('Application initialized successfully');
});

// Add CSS for status badges
const style = document.createElement('style');
style.textContent = `
    .status-pending { color: #ffc107; font-weight: bold; }
    .status-approved { color: #28a745; font-weight: bold; }
    .status-rejected { color: #dc3545; font-weight: bold; }
    .no-data { text-align: center; color: #6c757d; padding: 20px; }
`;
document.head.appendChild(style);