// static/faculty.js

// DOM Elements
const facultyTabs = document.querySelectorAll('.faculty-tab');
const facultyContents = document.querySelectorAll('.faculty-content');
const facultyModal = document.getElementById('facultyModal');
const closeModalBtn = document.getElementById('closeModal');
const facultyCards = document.querySelectorAll('.faculty-card');
const principalCard = document.getElementById('principalCard');

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Faculty page loaded');
    
    // Set up tab functionality
    facultyTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            console.log('Tab clicked:', targetTab);
            
            // Update active tab
            facultyTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding content
            facultyContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab}-faculty`) {
                    content.classList.add('active');
                    console.log('Showing content:', content.id);
                }
            });
        });
    });

    // Set up faculty card click events
    facultyCards.forEach(card => {
        // Skip if this is the principal card (which has its own handler)
        if (card.id === 'principalCard') {
            return;
        }
        
        card.addEventListener('click', function(e) {
            // Prevent click if clicking on the "View Profile" link
            if (e.target.classList.contains('view-profile')) {
                e.stopPropagation();
                return;
            }
            
            const facultyName = this.querySelector('.faculty-name').textContent;
            console.log('Faculty card clicked:', facultyName);
            
            // Find faculty data
            let faculty = null;
            for (const level in facultyData) {
                if (level !== 'principal') {
                    faculty = facultyData[level].find(f => f.name === facultyName);
                    if (faculty) break;
                }
            }
            
            if (faculty) {
                openFacultyModal(faculty);
            }
        });
    });
    
    // Add "View Profile" link functionality for faculty cards
    document.querySelectorAll('.view-profile:not(.principal-view-profile)').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.faculty-card');
            
            // Skip if this is the principal card
            if (card && card.id === 'principalCard') {
                return;
            }
            
            const facultyName = card.querySelector('.faculty-name').textContent;
            
            // Find faculty data
            let faculty = null;
            for (const level in facultyData) {
                if (level !== 'principal') {
                    faculty = facultyData[level].find(f => f.name === facultyName);
                    if (faculty) break;
                }
            }
            
            if (faculty) {
                openFacultyModal(faculty);
            }
        });
    });

    // Set up principal card click event
    if (principalCard) {
        principalCard.addEventListener('click', function(e) {
            // Prevent click if clicking on the "View Profile" link
            if (e.target.classList.contains('view-profile') || e.target.classList.contains('principal-view-profile')) {
                e.stopPropagation();
                return;
            }
            
            console.log('Principal card clicked');
            openFacultyModal(facultyData.principal);
        });
        
        // Add "View Profile" link functionality for principal
        const principalViewLink = principalCard.querySelector('.principal-view-profile') || principalCard.querySelector('.view-profile');
        if (principalViewLink) {
            principalViewLink.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Principal view profile clicked');
                openFacultyModal(facultyData.principal);
            });
        }
    }

    // Close modal when clicking the X button
    closeModalBtn.addEventListener('click', function() {
        closeFacultyModal();
    });

    // Close modal when clicking outside the content
    facultyModal.addEventListener('click', function(e) {
        if (e.target === facultyModal) {
            closeFacultyModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeFacultyModal();
        }
    });

    // Add cursor pointer to clickable elements
    if (principalCard) {
        principalCard.style.cursor = 'pointer';
    }
    
    // Add cursor pointer to regular faculty cards
    facultyCards.forEach(card => {
        if (card.id !== 'principalCard') {
            card.style.cursor = 'pointer';
        }
    });

    console.log('Faculty page initialized successfully');
});

// Open faculty modal with details
function openFacultyModal(faculty) {
    console.log('Opening modal for:', faculty.name);
    
    document.getElementById('modalName').textContent = faculty.name;
    document.getElementById('modalPosition').textContent = faculty.position;
    document.getElementById('modalSubjects').textContent = faculty.subjects;
    document.getElementById('modalImage').src = faculty.image;
    document.getElementById('modalImage').alt = faculty.name;
    
    // Format bio with line breaks if needed
    const bioText = faculty.bio.replace(/\\n/g, '\n');
    const modalBio = document.getElementById('modalBio');
    modalBio.innerHTML = '';
    
    // Split by newlines and create paragraphs
    const lines = bioText.split('\n');
    lines.forEach(line => {
        if (line.trim()) {
            // Check if line starts with bullet point
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                const li = document.createElement('li');
                li.textContent = line.trim().substring(1).trim();
                // Create ul if doesn't exist
                let ul = modalBio.querySelector('ul');
                if (!ul) {
                    ul = document.createElement('ul');
                    modalBio.appendChild(ul);
                }
                ul.appendChild(li);
            } else {
                const p = document.createElement('p');
                p.textContent = line;
                modalBio.appendChild(p);
            }
        }
    });
    
    // Set qualifications
    const qualificationsContainer = document.getElementById('modalQualifications');
    qualificationsContainer.innerHTML = '';
    faculty.qualifications.forEach(qualification => {
        const qualElement = document.createElement('span');
        qualElement.className = 'modal-qualification';
        qualElement.textContent = qualification;
        qualificationsContainer.appendChild(qualElement);
    });
    
    // Set contact information
    const contactContainer = document.getElementById('modalContact');
    contactContainer.innerHTML = '';
    
    // Always include these contact items
    const emailItem = document.createElement('div');
    emailItem.className = 'contact-item';
    emailItem.innerHTML = `<i class="fas fa-envelope"></i> ${faculty.contact.email}`;
    contactContainer.appendChild(emailItem);
    
    const phoneItem = document.createElement('div');
    phoneItem.className = 'contact-item';
    phoneItem.innerHTML = `<i class="fas fa-phone"></i> ${faculty.contact.phone}`;
    contactContainer.appendChild(phoneItem);
    
    const roomItem = document.createElement('div');
    roomItem.className = 'contact-item';
    roomItem.innerHTML = `<i class="fas fa-door-open"></i> ${faculty.contact.room}`;
    contactContainer.appendChild(roomItem);
    
    // Add office hours for principal
    if (faculty.contact.officeHours) {
        const hoursItem = document.createElement('div');
        hoursItem.className = 'contact-item';
        hoursItem.innerHTML = `<i class="fas fa-clock"></i> ${faculty.contact.officeHours}`;
        contactContainer.appendChild(hoursItem);
    }
    
    // Show the modal with animation
    facultyModal.style.display = 'block';
    
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    // Scroll modal content to top
    facultyModal.querySelector('.modal-content').scrollTop = 0;
    
    setTimeout(() => {
        facultyModal.querySelector('.modal-content').classList.add('modal-show');
    }, 10);
    
    // Add special styling for principal modal
    if (faculty.id === 0) {
        document.getElementById('modalName').style.background = 'linear-gradient(135deg, #fefefeff, #ebdbdbff)';
        document.getElementById('modalName').style.webkitBackgroundClip = 'text';
        document.getElementById('modalName').style.webkitTextFillColor = 'transparent';
        document.getElementById('modalName').style.backgroundClip = 'text';
    }
}

// Close faculty modal
function closeFacultyModal() {
    const modalContent = facultyModal.querySelector('.modal-content');
    modalContent.classList.remove('modal-show');
    
    setTimeout(() => {
        facultyModal.style.display = 'none';
        
        // Restore scrolling when modal closes
        document.body.style.overflow = 'auto';
        
        // Reset modal name styling
        document.getElementById('modalName').style.background = '';
        document.getElementById('modalName').style.webkitBackgroundClip = '';
        document.getElementById('modalName').style.webkitTextFillColor = '';
        document.getElementById('modalName').style.backgroundClip = '';
    }, 300);
}

// Add CSS for modal animation and additional styling
const modalStyle = document.createElement('style');
modalStyle.textContent = `
    .modal-content {
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        max-height: 85vh;
        overflow-y: auto;
    }
    
    .modal-content.modal-show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .modal-qualification {
        display: inline-block;
        background: linear-gradient(135deg, #1a2a6c, #b21f1f);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 600;
        margin: 0.3rem;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
    }
    
    .modal-qualification:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    }
    
    .contact-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.8rem 0;
        border-bottom: 1px solid #e9ecef;
        color: #495057;
    }
    
    .contact-item:last-child {
        border-bottom: none;
    }
    
    .contact-item i {
        width: 20px;
        color: #1a2a6c;
    }
    
    #modalBio ul {
        margin: 1rem 0;
        padding-left: 1.5rem;
    }
    
    #modalBio li {
        margin-bottom: 0.5rem;
        color: #495057;
    }
    
    #modalBio p {
        margin-bottom: 1rem;
        line-height: 1.6;
    }
    
    /* Ensure modal doesn't block scrolling when closed */
    body.modal-open {
        overflow: hidden;
    }
`;
document.head.appendChild(modalStyle);

// Add some debug logging
console.log('Faculty script loaded');
console.log('Tabs found:', facultyTabs.length);
console.log('Content sections found:', facultyContents.length);
console.log('Faculty cards found:', facultyCards.length);
console.log('Principal card found:', principalCard ? 'Yes' : 'No');