// Feedback Management System

let allFeedback = [];
let currentFeedbackPage = 1;
const feedbackPerPage = 10;
let currentFeedbackId = null;

// Initialize feedback management
async function initializeFeedback() {
    await loadFeedback();
    setupFeedbackEventListeners();
}

// Load feedback from database
async function loadFeedback() {
    try {
        showLoading('feedbackLoading', true);
        
        const response = await fetch('/api/feedback', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            allFeedback = data.feedback || [];
            renderFeedbackTable();
        } else {
            console.error('Failed to load feedback');
        }
    } catch (error) {
        console.error('Error loading feedback:', error);
    } finally {
        showLoading('feedbackLoading', false);
    }
}

// Render feedback table
function renderFeedbackTable() {
    const tableBody = document.getElementById('feedbackTableBody');
    const noDataMessage = document.getElementById('noFeedbackMessage');
    
    if (!tableBody) return;
    
    // Apply filters
    let filteredFeedback = [...allFeedback];
    const categoryFilter = document.getElementById('feedbackCategoryFilter')?.value;
    const statusFilter = document.getElementById('feedbackStatusFilter')?.value;
    const roleFilter = document.getElementById('feedbackRoleFilter')?.value;
    const searchTerm = document.getElementById('feedbackSearch')?.value.toLowerCase();
    
    if (categoryFilter) {
        filteredFeedback = filteredFeedback.filter(f => f.category === categoryFilter);
    }
    
    if (statusFilter) {
        filteredFeedback = filteredFeedback.filter(f => f.status === statusFilter);
    }
    
    if (roleFilter) {
        filteredFeedback = filteredFeedback.filter(f => f.role === roleFilter);
    }
    
    if (searchTerm) {
        filteredFeedback = filteredFeedback.filter(f => 
            f.name.toLowerCase().includes(searchTerm) ||
            f.subject.toLowerCase().includes(searchTerm) ||
            f.message.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sort by date (newest first)
    filteredFeedback.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Show/hide no data message
    if (filteredFeedback.length === 0) {
        tableBody.innerHTML = '';
        noDataMessage.style.display = 'block';
        document.getElementById('feedbackPagination').innerHTML = '';
        return;
    }
    
    noDataMessage.style.display = 'none';
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredFeedback.length / feedbackPerPage);
    const startIndex = (currentFeedbackPage - 1) * feedbackPerPage;
    const endIndex = startIndex + feedbackPerPage;
    const pageFeedback = filteredFeedback.slice(startIndex, endIndex);
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Populate table rows
    pageFeedback.forEach(feedback => {
        const row = document.createElement('tr');
        if (feedback.status === 'unread') {
            row.classList.add('unread-feedback');
        }
        
        row.innerHTML = `
            <td>${feedback.id}</td>
            <td>
                <strong>${feedback.name}</strong>
                ${feedback.anonymous ? '<span class="badge badge-secondary">Anonymous</span>' : ''}
                <br><small>${feedback.email || 'No email provided'}</small>
            </td>
            <td><span class="role-badge">${feedback.role}</span></td>
            <td><span class="category-badge">${getCategoryLabel(feedback.category)}</span></td>
            <td>${feedback.subject}</td>
            <td>${formatDate(feedback.created_at)}</td>
            <td><span class="status-badge status-${feedback.status}">${feedback.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewFeedback(${feedback.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSingleFeedback(${feedback.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Render pagination
    renderFeedbackPagination(totalPages);
}

// Get category label
function getCategoryLabel(category) {
    const categories = {
        'academic': 'Academic',
        'facilities': 'Facilities',
        'events': 'Events',
        'teaching': 'Teaching',
        'services': 'Services',
        'safety': 'Safety',
        'suggestion': 'Suggestion',
        'compliment': 'Compliment',
        'concern': 'Concern'
    };
    return categories[category] || category;
}

// Render feedback pagination
function renderFeedbackPagination(totalPages) {
    const pagination = document.getElementById('feedbackPagination');
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = `
        <button class="page-btn" onclick="changeFeedbackPage(1)" ${currentFeedbackPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-double-left"></i>
        </button>
        <button class="page-btn" onclick="changeFeedbackPage(${currentFeedbackPage - 1})" ${currentFeedbackPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentFeedbackPage - 2 && i <= currentFeedbackPage + 2)) {
            paginationHTML += `
                <button class="page-btn ${i === currentFeedbackPage ? 'active' : ''}" onclick="changeFeedbackPage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentFeedbackPage - 3 || i === currentFeedbackPage + 3) {
            paginationHTML += `<span class="page-dots">...</span>`;
        }
    }
    
    paginationHTML += `
        <button class="page-btn" onclick="changeFeedbackPage(${currentFeedbackPage + 1})" ${currentFeedbackPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-right"></i>
        </button>
        <button class="page-btn" onclick="changeFeedbackPage(${totalPages})" ${currentFeedbackPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-double-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change feedback page
function changeFeedbackPage(page) {
    currentFeedbackPage = page;
    renderFeedbackTable();
}

// View feedback details
async function viewFeedback(id) {
    try {
        const response = await fetch(`/api/feedback/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const feedback = await response.json();
            currentFeedbackId = id;
            showFeedbackModal(feedback);
            
            // Mark as read
            if (feedback.status === 'unread') {
                await updateFeedbackStatus(id, 'read');
            }
        }
    } catch (error) {
        console.error('Error loading feedback details:', error);
    }
}

// Show feedback modal
function showFeedbackModal(feedback) {
    const modal = document.getElementById('feedbackDetailModal');
    const content = document.getElementById('feedbackDetailContent');
    
    content.innerHTML = `
        <div class="feedback-detail">
            <div class="feedback-header">
                <div>
                    <h3>${feedback.subject}</h3>
                    <div class="feedback-meta">
                        <span class="feedback-author">
                            <strong>From:</strong> ${feedback.anonymous ? 'Anonymous' : feedback.name}
                            ${feedback.role ? `(${feedback.role})` : ''}
                        </span>
                        <span class="feedback-date">
                            <i class="far fa-clock"></i> ${formatDate(feedback.created_at)}
                        </span>
                        <span class="feedback-category">
                            <i class="fas fa-tag"></i> ${getCategoryLabel(feedback.category)}
                        </span>
                    </div>
                </div>
                <span class="status-badge status-${feedback.status}">${feedback.status}</span>
            </div>
            
            <div class="feedback-message-box">
                <h4><i class="fas fa-comment"></i> Message:</h4>
                <div class="feedback-message">${feedback.message.replace(/\n/g, '<br>')}</div>
            </div>
            
            ${feedback.email && !feedback.anonymous ? `
                <div class="contact-info">
                    <h4><i class="fas fa-envelope"></i> Contact:</h4>
                    <p>${feedback.email}</p>
                </div>
            ` : ''}
            
            ${feedback.followup === '1' || feedback.followup === true ? `
                <div class="followup-info">
                    <p><i class="fas fa-check-circle text-success"></i> Submitter is open to follow-up</p>
                </div>
            ` : ''}
            
            ${feedback.admin_response ? `
                <div class="response-box">
                    <h4><i class="fas fa-reply"></i> Admin Response:</h4>
                    <div class="admin-response">
                        ${feedback.admin_response.replace(/\n/g, '<br>')}
                    </div>
                    <small class="text-muted">
                        <i class="far fa-clock"></i> Responded on ${formatDate(feedback.responded_at || feedback.updated_at)}
                    </small>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
    document.getElementById('adminResponse').value = feedback.admin_response || '';
}

// Close feedback modal
function closeFeedbackModal() {
    document.getElementById('feedbackDetailModal').style.display = 'none';
    currentFeedbackId = null;
}

// Submit admin response
async function submitResponse() {
    if (!currentFeedbackId) return;
    
    const responseText = document.getElementById('adminResponse').value.trim();
    if (!responseText) {
        alert('Please enter a response');
        return;
    }
    
    try {
        const response = await fetch(`/api/feedback/${currentFeedbackId}/respond`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
                response: responseText,
                status: 'addressed'
            })
        });
        
        if (response.ok) {
            alert('Response sent successfully!');
            closeFeedbackModal();
            loadFeedback(); // Refresh the list
        } else {
            alert('Failed to send response');
        }
    } catch (error) {
        console.error('Error sending response:', error);
        alert('Error sending response');
    }
}

// Mark feedback as addressed
async function markAsAddressed() {
    if (!currentFeedbackId) return;
    
    try {
        const response = await fetch(`/api/feedback/${currentFeedbackId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({
                status: 'addressed'
            })
        });
        
        if (response.ok) {
            alert('Marked as addressed');
            closeFeedbackModal();
            loadFeedback(); // Refresh the list
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

// Delete feedback
async function deleteFeedback() {
    if (!currentFeedbackId || !confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
        const response = await fetch(`/api/feedback/${currentFeedbackId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            alert('Feedback deleted');
            closeFeedbackModal();
            loadFeedback(); // Refresh the list
        }
    } catch (error) {
        console.error('Error deleting feedback:', error);
    }
}

// Delete single feedback from table
async function deleteSingleFeedback(id) {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
        const response = await fetch(`/api/feedback/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            loadFeedback(); // Refresh the list
        }
    } catch (error) {
        console.error('Error deleting feedback:', error);
    }
}

// Mark all feedback as read
async function markAllFeedbackAsRead() {
    if (!confirm('Mark all feedback as read?')) return;
    
    try {
        const response = await fetch('/api/feedback/mark-all-read', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            alert('All feedback marked as read');
            loadFeedback(); // Refresh the list
        }
    } catch (error) {
        console.error('Error marking all as read:', error);
    }
}

// Export feedback to CSV
function exportFeedbackToCSV() {
    if (allFeedback.length === 0) {
        alert('No feedback to export');
        return;
    }
    
    const headers = ['ID', 'Name', 'Email', 'Role', 'Category', 'Subject', 'Message', 'Status', 'Anonymous', 'Created At'];
    const csvData = allFeedback.map(f => [
        f.id,
        f.anonymous ? 'Anonymous' : f.name,
        f.email || '',
        f.role,
        getCategoryLabel(f.category),
        f.subject,
        `"${f.message.replace(/"/g, '""')}"`,
        f.status,
        f.anonymous ? 'Yes' : 'No',
        f.created_at
    ]);
    
    const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// Update feedback status
async function updateFeedbackStatus(id, status) {
    try {
        await fetch(`/api/feedback/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ status })
        });
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

// Setup event listeners
function setupFeedbackEventListeners() {
    // Filter change listeners
    ['feedbackCategoryFilter', 'feedbackStatusFilter', 'feedbackRoleFilter'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                currentFeedbackPage = 1;
                renderFeedbackTable();
            });
        }
    });
    
    // Search input listener
    const searchInput = document.getElementById('feedbackSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentFeedbackPage = 1;
            renderFeedbackTable();
        }, 300));
    }
    
    // Export button
    const exportBtn = document.getElementById('exportFeedbackCSV');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportFeedbackToCSV);
    }
    
    // Mark all as read button
    const markAllBtn = document.getElementById('markAllRead');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', markAllFeedbackAsRead);
    }
}

// Utility function: Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utility function: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Utility function: Show loading
function showLoading(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeFeedback);

// Update the initializeFeedback function to include counter updates
async function loadFeedback() {
    try {
        showLoading('feedbackLoading', true);
        
        const response = await fetch('/api/feedback', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            allFeedback = data.feedback || [];
            
            // Update counters
            updateCounters(allFeedback);
            
            // Render table
            renderFeedbackTable();
        } else {
            console.error('Failed to load feedback');
        }
    } catch (error) {
        console.error('Error loading feedback:', error);
    } finally {
        showLoading('feedbackLoading', false);
    }
}

// Function to update counters
function updateCounters(feedbackList) {
    const totalCount = feedbackList.length;
    const unreadCount = feedbackList.filter(f => f.status === 'unread').length;
    
    // Update navigation counter
    if (typeof updateFeedbackCounter === 'function') {
        updateFeedbackCounter(totalCount, unreadCount);
    }
    
    // Also update students counter if available
    if (typeof updateStudentsCounter === 'function') {
        // You'll need to get the student count from your student management
        // updateStudentsCounter(studentCount);
    }
}

// Update the renderFeedbackTable function to include counter badge
function renderFeedbackTable() {
    // ... existing code ...
    
    pageFeedback.forEach(feedback => {
        const row = document.createElement('tr');
        if (feedback.status === 'unread') {
            row.classList.add('unread-feedback');
        }
        
        // Add unread indicator
        const unreadIndicator = feedback.status === 'unread' ? 
            '<span class="unread-indicator" title="Unread"></span>' : '';
        
        row.innerHTML = `
            <td>${feedback.id}</td>
            <td>
                <div class="d-flex align-items-center">
                    ${unreadIndicator}
                    <strong>${feedback.name}</strong>
                    ${feedback.anonymous ? '<span class="badge badge-secondary ml-2">Anonymous</span>' : ''}
                </div>
                <small class="text-muted">${feedback.email || 'No email provided'}</small>
            </td>
            <td><span class="role-badge">${feedback.role}</span></td>
            <td><span class="category-badge">${getCategoryLabel(feedback.category)}</span></td>
            <td>${feedback.subject}</td>
            <td>${formatDate(feedback.created_at)}</td>
            <td><span class="status-badge status-${feedback.status}">${feedback.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewFeedback(${feedback.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSingleFeedback(${feedback.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // ... rest of the function ...
}

// Add this CSS for unread indicator
const unreadIndicatorStyle = `
.unread-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #dc3545;
    border-radius: 50%;
    margin-right: 8px;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
}
`;

// Add the style to the document
const styleSheet = document.createElement("style");
styleSheet.textContent = unreadIndicatorStyle;
document.head.appendChild(styleSheet);