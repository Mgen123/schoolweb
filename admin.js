// Admin Dashboard Manager
class AdminDashboard {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentApplications = [];
        this.filteredApplications = [];
        this.currentSort = 'newest';
        this.currentStrandFilter = '';
        this.currentGradeFilter = '';
        this.currentSearch = '';
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadApplications();
        this.updateStatistics();
        this.renderTable();
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        // Search input
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.filterAndSortApplications();
        });

        // Strand filter
        document.getElementById('strandFilter').addEventListener('change', (e) => {
            this.currentStrandFilter = e.target.value;
            this.filterAndSortApplications();
        });

        // Grade level filter
        document.getElementById('gradeFilter').addEventListener('change', (e) => {
            this.currentGradeFilter = e.target.value;
            this.filterAndSortApplications();
        });

        // Sort by
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.filterAndSortApplications();
        });

        // Export CSV
        document.getElementById('exportCSV').addEventListener('click', () => {
            this.exportToCSV();
        });
    }

    async loadApplications() {
        try {
            this.showLoading(true);
            const applications = getApplications();
            this.currentApplications = applications;
            this.filterAndSortApplications();
        } catch (error) {
            console.error('Error loading applications:', error);
            this.showToast('Failed to load application data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    filterAndSortApplications() {
        let filtered = [...this.currentApplications];

        // Apply search filter
        if (this.currentSearch) {
            const searchTerm = this.currentSearch.toLowerCase();
            filtered = filtered.filter(application => 
                application.name.toLowerCase().includes(searchTerm) ||
                application.email.toLowerCase().includes(searchTerm)
            );
        }

        // Apply strand filter
        if (this.currentStrandFilter) {
            filtered = filtered.filter(application => 
                application.strand === this.currentStrandFilter
            );
        }

        // Apply grade level filter
        if (this.currentGradeFilter) {
            filtered = filtered.filter(application => 
                application.grade_level === this.currentGradeFilter
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return new Date(b.submitted_at) - new Date(a.submitted_at);
                case 'oldest':
                    return new Date(a.submitted_at) - new Date(b.submitted_at);
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        this.filteredApplications = filtered;
        this.currentPage = 1;
        this.renderTable();
        this.updateStatistics();
    }

    renderTable() {
        const tbody = document.getElementById('studentsTableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        
        if (this.filteredApplications.length === 0) {
            tbody.innerHTML = '';
            noDataMessage.style.display = 'block';
            this.renderPagination();
            return;
        }

        noDataMessage.style.display = 'none';

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageApplications = this.filteredApplications.slice(startIndex, endIndex);

        tbody.innerHTML = pageApplications.map(application => `
            <tr>
                <td>${application.id}</td>
                <td>${this.escapeHtml(application.name)}</td>
                <td>${this.escapeHtml(application.email)}</td>
                <td>
                    <span class="strand-badge ${this.getStrandBadgeClass(application.strand)}">
                        ${this.escapeHtml(application.strand)}
                    </span>
                </td>
                <td>
                    <span class="grade-badge">
                        ${this.escapeHtml(application.grade_level)}
                    </span>
                </td>
                <td>${this.formatDate(application.dob)}</td>
                <td>${this.formatDateTime(application.submitted_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" onclick="adminDashboard.viewApplication(${application.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="action-btn btn-delete" onclick="adminDashboard.confirmDelete(${application.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.renderPagination();
    }

    getStrandBadgeClass(strand) {
        const strandMap = {
            'Arts and Design Track': 'badge-arts',
            'STEM': 'badge-stem',
            'ABM': 'badge-abm',
            'HUMSS': 'badge-humss',
            'GAS': 'badge-gas',
            'TVL': 'badge-tvl'
        };
        return strandMap[strand] || 'badge-arts';
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.filteredApplications.length / this.itemsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                onclick="adminDashboard.changePage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i> Previous
            </button>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="adminDashboard.changePage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `<span class="pagination-dots">...</span>`;
            }
        }

        // Next button
        paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                onclick="adminDashboard.changePage(${this.currentPage + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;

        // Page info
        paginationHTML += `
            <span class="pagination-info">
                Page ${this.currentPage} of ${totalPages} 
                (${this.filteredApplications.length} total applications)
            </span>
        `;

        pagination.innerHTML = paginationHTML;
    }

    changePage(page) {
        this.currentPage = page;
        this.renderTable();
    }

    updateStatistics() {
        const stats = getApplicationStats();
        
        document.getElementById('totalStudents').textContent = stats.total;
        document.getElementById('artsStudents').textContent = stats.arts;
        document.getElementById('stemStudents').textContent = stats.stem;
        document.getElementById('abmStudents').textContent = stats.abm;
        document.getElementById('humssStudents').textContent = stats.humss;
        document.getElementById('gasStudents').textContent = stats.gas;
        document.getElementById('tvlStudents').textContent = stats.tvl;
    }

    viewApplication(applicationId) {
        try {
            const application = this.currentApplications.find(app => app.id == applicationId);
            if (!application) {
                this.showToast('Application not found', 'error');
                return;
            }

            const detailContent = document.getElementById('studentDetailContent');
            detailContent.innerHTML = `
                <div class="student-detail">
                    <div class="detail-group">
                        <div class="detail-label">Application ID</div>
                        <div class="detail-value">${application.id}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Full Name</div>
                        <div class="detail-value">${this.escapeHtml(application.name)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Email Address</div>
                        <div class="detail-value">${this.escapeHtml(application.email)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Strand</div>
                        <div class="detail-value">
                            <span class="strand-badge ${this.getStrandBadgeClass(application.strand)}">
                                ${this.escapeHtml(application.strand)}
                            </span>
                        </div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Grade Level</div>
                        <div class="detail-value">
                            <span class="grade-badge">
                                ${this.escapeHtml(application.grade_level)}
                            </span>
                        </div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Date of Birth</div>
                        <div class="detail-value">${this.formatDate(application.dob)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Registration Date</div>
                        <div class="detail-value">${this.formatDateTime(application.submitted_at)}</div>
                    </div>
                    <div class="detail-group">
                        <div class="detail-label">Status</div>
                        <div class="detail-value">
                            <span class="status-${application.status || 'pending'}">${application.status || 'pending'}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="closeStudentModal()">Close</button>
                    <button class="btn btn-danger" onclick="adminDashboard.confirmDelete(${application.id})">
                        <i class="fas fa-trash"></i> Delete Application
                    </button>
                </div>
            `;

            document.getElementById('studentDetailModal').style.display = 'flex';
        } catch (error) {
            console.error('Error viewing application:', error);
            this.showToast('Failed to load application details', 'error');
        }
    }

    confirmDelete(applicationId) {
        const application = this.currentApplications.find(app => app.id == applicationId);
        if (!application) return;

        const confirmModal = document.getElementById('confirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmBtn = document.getElementById('confirmActionBtn');

        confirmMessage.textContent = `Are you sure you want to delete ${application.name}'s application? This action cannot be undone.`;
        
        confirmBtn.onclick = () => {
            this.deleteApplication(applicationId);
            closeConfirmModal();
        };

        confirmModal.style.display = 'flex';
    }

    async deleteApplication(applicationId) {
        try {
            const success = deleteApplication(applicationId);
            if (success) {
                // Remove from current array for immediate UI update
                this.currentApplications = this.currentApplications.filter(app => app.id != applicationId);
                this.filterAndSortApplications();
                this.showToast('Application deleted successfully', 'success');
            } else {
                throw new Error('Failed to delete application');
            }
        } catch (error) {
            console.error('Error deleting application:', error);
            this.showToast('Failed to delete application', 'error');
        }
    }

    async exportToCSV() {
        try {
            const csvData = exportApplicationsToCSV();
            
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
            
            this.showToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showToast('Export failed: ' + error.message, 'error');
        }
    }

    async refreshData() {
        await this.loadApplications();
        this.showToast('Data refreshed successfully', 'success');
    }

    // Utility methods
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(show) {
        const loadingMessage = document.getElementById('loadingMessage');
        loadingMessage.style.display = show ? 'block' : 'none';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
}

// Global functions for modal handling
function closeStudentModal() {
    document.getElementById('studentDetailModal').style.display = 'none';
}

function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = ['studentDetailModal', 'confirmModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            if (modalId === 'studentDetailModal') closeStudentModal();
            if (modalId === 'confirmModal') closeConfirmModal();
        }
    });
}

// Initialize admin dashboard when DOM is loaded
let adminDashboard;
document.addEventListener('DOMContentLoaded', function() {
    // Wait for database to initialize
    setTimeout(() => {
        adminDashboard = new AdminDashboard();
    }, 1000);
});

