// Database initialization and functions
let db = null;

// Initialize SQL.js database
function initDatabase() {
    try {
        // Create a new database
        db = new SQL.Database();
        
        // Create applications table if it doesn't exist
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                strand TEXT NOT NULL,
                grade_level TEXT NOT NULL,
                dob TEXT NOT NULL,
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'pending'
            )
        `;
        
        db.run(createTableSQL);
        console.log('Database initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        return false;
    }
}

// Save application to database
function saveApplication(application) {
    try {
        if (!db) {
            initDatabase();
        }
        
        const insertSQL = `
            INSERT INTO applications (name, email, strand, grade_level, dob)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(insertSQL, [
            application.name,
            application.email,
            application.strand,
            application.grade_level,
            application.dob
        ]);
        
        console.log('Application saved successfully:', application.email);
        return true;
    } catch (error) {
        console.error('Error saving application:', error);
        return false;
    }
}

// Get all applications from database
function getApplications() {
    try {
        if (!db) {
            initDatabase();
            return [];
        }
        
        const result = db.exec("SELECT * FROM applications ORDER BY submitted_at DESC");
        if (result.length === 0) {
            return [];
        }
        
        const applications = [];
        const columns = result[0].columns;
        const values = result[0].values;
        
        for (let i = 0; i < values.length; i++) {
            const application = {};
            for (let j = 0; j < columns.length; j++) {
                application[columns[j]] = values[i][j];
            }
            applications.push(application);
        }
        
        return applications;
    } catch (error) {
        console.error('Error retrieving applications:', error);
        return [];
    }
}

// Check if email exists in database
function checkEmailExists(email) {
    try {
        if (!db) {
            initDatabase();
            return false;
        }
        
        const result = db.exec("SELECT id FROM applications WHERE email = ?", [email]);
        return result.length > 0 && result[0].values.length > 0;
    } catch (error) {
        console.error('Error checking email:', error);
        return false;
    }
}

// Delete application by ID
function deleteApplication(id) {
    try {
        if (!db) {
            initDatabase();
            return false;
        }
        
        db.run("DELETE FROM applications WHERE id = ?", [id]);
        console.log('Application deleted:', id);
        return true;
    } catch (error) {
        console.error('Error deleting application:', error);
        return false;
    }
}

// Get application statistics
function getApplicationStats() {
    try {
        const applications = getApplications();
        const stats = {
            total: applications.length,
            arts: applications.filter(app => app.strand === 'Arts and Design Track').length,
            stem: applications.filter(app => app.strand === 'STEM').length,
            abm: applications.filter(app => app.strand === 'ABM').length,
            humss: applications.filter(app => app.strand === 'HUMSS').length,
            gas: applications.filter(app => app.strand === 'GAS').length,
            tvl: applications.filter(app => app.strand === 'TVL').length,
            grade7: applications.filter(app => app.grade_level === 'Grade 7').length,
            grade8: applications.filter(app => app.grade_level === 'Grade 8').length,
            grade9: applications.filter(app => app.grade_level === 'Grade 9').length,
            grade10: applications.filter(app => app.grade_level === 'Grade 10').length,
            grade11: applications.filter(app => app.grade_level === 'Grade 11').length,
            grade12: applications.filter(app => app.grade_level === 'Grade 12').length
        };
        
        return stats;
    } catch (error) {
        console.error('Error getting stats:', error);
        return {
            total: 0, arts: 0, stem: 0, abm: 0, humss: 0, gas: 0, tvl: 0,
            grade7: 0, grade8: 0, grade9: 0, grade10: 0, grade11: 0, grade12: 0
        };
    }
}

// Export applications to CSV
function exportApplicationsToCSV() {
    try {
        const applications = getApplications();
        
        if (applications.length === 0) {
            throw new Error('No applications to export');
        }

        const headers = ['ID', 'Name', 'Email', 'Strand', 'Grade Level', 'Date of Birth', 'Submitted At', 'Status'];
        const csvRows = [headers.join(',')];

        applications.forEach(app => {
            const row = [
                app.id,
                `"${app.name.replace(/"/g, '""')}"`,
                app.email,
                app.strand,
                app.grade_level,
                app.dob,
                app.submitted_at,
                app.status || 'pending'
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    } catch (error) {
        console.error('Error exporting to CSV:', error);
        throw error;
    }
}

// Clear all applications (for testing/reset)
function clearApplications() {
    try {
        if (!db) {
            initDatabase();
        }
        
        db.run("DELETE FROM applications");
        console.log('All applications cleared');
        return true;
    } catch (error) {
        console.error('Error clearing applications:', error);
        return false;
    }
}

// Make functions globally available
window.initDatabase = initDatabase;
window.saveApplication = saveApplication;
window.getApplications = getApplications;
window.checkEmailExists = checkEmailExists;
window.deleteApplication = deleteApplication;
window.getApplicationStats = getApplicationStats;
window.exportApplicationsToCSV = exportApplicationsToCSV;
window.clearApplications = clearApplications;

// Initialize database when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing database...');
    initDatabase();
});