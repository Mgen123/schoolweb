from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)

# ✅ Always use absolute path for the database file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data.db")

# ✅ Ensure the registration table exists
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS registration (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            strand TEXT,
            grade TEXT,
            dateofbirth TEXT,
            status TEXT,
            reg_date TEXT
        )
    """)
    conn.commit()
    conn.close()

# Call init_db when the app starts
init_db()
app.secret_key = os.urandom(24)

@app.route("/")
def home():  # Change from 'home' to 'index'
    return render_template("index.html")

@app.route('/programs')
def programs():
    return render_template('programs.html')

# ADD THIS FACULTY ROUTE
@app.route("/faculty")
def faculty():
    return render_template("faculty.html")

@app.route('/events')
def events():
    return render_template('events.html')

@app.route("/admin")
def admin_dashboard():
    return render_template("admin.html")

@app.route('/gallery')
def gallery():
    return render_template('gallery.html')

@app.route("/add_strand", methods=["POST"])
def add_strand():
    grade = request.form["grade"]
    strand_name = request.form["strandName"]

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO strand_list (grade, strand_name) VALUES (?, ?)", (grade, strand_name))
    conn.commit()
    conn.close()

    return redirect(url_for("admin_dashboard"))

@app.route("/get_strands/<grade>")
def get_strands(grade):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT strand_name FROM strand_list WHERE grade = ?", (grade,))
    strands = [row[0] for row in cursor.fetchall()]
    conn.close()
    return jsonify(strands)

@app.route("/submit_registration", methods=["POST"])
def submit_registration():
    full_name = request.form["name"]
    email = request.form["email"]
    strand = request.form["strand"]
    grade = request.form["grade_level"]
    dob = request.form["dob"]
    reg_date = datetime.now().strftime("%Y-%m-%d")

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO registration (full_name, email, strand, grade, dateofbirth, status, reg_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (full_name, email, strand, grade, dob, "Pending", reg_date))
        conn.commit()
        conn.close()

        flash("✅ Application submitted successfully! Status: pending", "success")
    except Exception as e:
        flash(f"❌ Failed to submit application: {e}", "error")

    return redirect(url_for("home"))

@app.route("/get_registrations")
def get_registrations():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, full_name, email, strand, grade, dateofbirth, status, reg_date
        FROM registration
    """)
    rows = cursor.fetchall()
    conn.close()

    registrations = []
    for row in rows:
        registrations.append({
            "id": row[0],
            "full_name": row[1],
            "email": row[2],
            "strand": row[3],
            "grade": row[4],
            "dateofbirth": row[5],
            "status": row[6],   # ✅ fixed mapping
            "reg_date": row[7]  # ✅ fixed mapping
        })

    return jsonify(registrations)

@app.route("/update_status", methods=["POST"])
def update_status():
    data = request.get_json()
    ids = data.get("ids", [])
    new_status = data.get("status")

    if not ids or not new_status:
        return jsonify({"success": False, "message": "Invalid request"}), 400

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.executemany(
        "UPDATE registration SET status = ? WHERE id = ?",
        [(new_status, student_id) for student_id in ids]
    )
    conn.commit()
    conn.close()

    return jsonify({"success": True, "updated": len(ids)})

@app.route("/submit_announcement", methods=["POST"])
def submit_announcement():
    author = request.form["author"]
    date_post = request.form["date_post"]
    viewer = request.form["viewer"]  # will be "junior", "senior", or "all"
    info = request.form["info"]

    # Normalize just in case
    mapping = {
        "Junior High": "junior",
        "Senior High": "senior",
        "Everyone": "all"
    }
    viewer = mapping.get(viewer, viewer)  # if already normalized, stays the same

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT INTO announcement (author, date_post, viewer, info) VALUES (?, ?, ?, ?)",
        (author, date_post, viewer, info)
    )
    conn.commit()
    conn.close()

    flash("✅ Announcement added successfully!", "success")
    return redirect(url_for("events"))  # make sure this matches your events route


@app.route("/api/announcements")
def api_announcements():
    viewer = request.args.get("viewer")  # "junior", "senior", or None
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    if viewer and viewer.lower() in ("junior", "senior"):
        cursor.execute(
            "SELECT author, date_post, viewer, info FROM announcement WHERE LOWER(viewer)=LOWER(?) ORDER BY date_post DESC",
            (viewer,)
        )
    else:
        cursor.execute(
            "SELECT author, date_post, viewer, info FROM announcement WHERE  viewer=? ORDER BY date_post DESC",
            ("all",)
        )

    rows = cursor.fetchall()
    conn.close()

    # Convert to list of dicts
    announcements = [
        {"author": r[0], "date_post": r[1], "viewer": r[2], "info": r[3]}
        for r in rows
    ]
    return jsonify(announcements)

@app.route("/delete_students", methods=["POST"])
def delete_students():
    try:
        data = request.get_json()
        ids = data.get("ids", [])

        if not ids:
            return jsonify({"success": False, "message": "No IDs provided"}), 400

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Use parameter substitution for safety
        cursor.executemany("DELETE FROM registration WHERE id = ?", [(i,) for i in ids])
        conn.commit()
        conn.close()

        flash("🗑️ Selected student(s) deleted successfully!", "success")
        return jsonify({"success": True})
    except Exception as e:
        flash(f"❌ Failed to delete students: {e}", "error")
        return jsonify({"success": False, "error": str(e)}), 500
    
def init_feedback_db():
    conn = sqlite3.connect('school.db')
    c = conn.cursor()
    
    # Create feedback table
    c.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            role TEXT NOT NULL,
            subject TEXT NOT NULL,
            category TEXT NOT NULL,
            message TEXT NOT NULL,
            anonymous BOOLEAN DEFAULT 0,
            followup BOOLEAN DEFAULT 1,
            status TEXT DEFAULT 'unread',
            admin_response TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            responded_at TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize database
init_feedback_db()

@app.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    """Submit feedback from website form"""
    data = request.json
    
    try:
        conn = sqlite3.connect('school.db')
        c = conn.cursor()
        
        c.execute('''
            INSERT INTO feedback (name, email, role, subject, category, message, anonymous, followup)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('name'),
            data.get('email'),
            data.get('role'),
            data.get('subject'),
            data.get('category'),
            data.get('message'),
            1 if data.get('anonymous') else 0,
            1 if data.get('followup') else 0
        ))
        
        feedback_id = c.lastrowid
        conn.commit()
        
        # Send email notification to admin (optional)
        send_notification_email(feedback_id, data)
        
        return jsonify({
            'success': True,
            'message': 'Thank you for your feedback!',
            'id': feedback_id
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    """Get all feedback (admin only)"""
    # Verify admin token here
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not verify_admin_token(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = sqlite3.connect('school.db')
        c = conn.cursor()
        
        c.execute('SELECT * FROM feedback ORDER BY created_at DESC')
        feedback = c.fetchall()
        
        # Convert to list of dicts
        columns = ['id', 'name', 'email', 'role', 'subject', 'category', 
                   'message', 'anonymous', 'followup', 'status', 
                   'admin_response', 'created_at', 'responded_at', 'updated_at']
        
        feedback_list = [dict(zip(columns, row)) for row in feedback]
        
        return jsonify({
            'success': True,
            'feedback': feedback_list,
            'count': len(feedback_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/feedback/<int:feedback_id>', methods=['GET'])
def get_feedback_detail(feedback_id):
    """Get single feedback detail"""
    # Verify admin token
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not verify_admin_token(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = sqlite3.connect('school.db')
        c = conn.cursor()
        
        c.execute('SELECT * FROM feedback WHERE id = ?', (feedback_id,))
        feedback = c.fetchone()
        
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
        
        columns = ['id', 'name', 'email', 'role', 'subject', 'category', 
                   'message', 'anonymous', 'followup', 'status', 
                   'admin_response', 'created_at', 'responded_at', 'updated_at']
        
        feedback_dict = dict(zip(columns, feedback))
        
        return jsonify(feedback_dict)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/feedback/<int:feedback_id>/respond', methods=['POST'])
def respond_to_feedback(feedback_id):
    """Admin responds to feedback"""
    # Verify admin token
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not verify_admin_token(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    response_text = data.get('response')
    status = data.get('status', 'addressed')
    
    if not response_text:
        return jsonify({'error': 'Response text required'}), 400
    
    try:
        conn = sqlite3.connect('school.db')
        c = conn.cursor()
        
        c.execute('''
            UPDATE feedback 
            SET admin_response = ?, status = ?, responded_at = ?, updated_at = ?
            WHERE id = ?
        ''', (response_text, status, datetime.now(), datetime.now(), feedback_id))
        
        conn.commit()
        
        # Send response email to submitter (optional)
        send_response_email(feedback_id, response_text)
        
        return jsonify({'success': True, 'message': 'Response sent'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/feedback/<int:feedback_id>/status', methods=['PUT'])
def update_feedback_status(feedback_id):
    """Update feedback status"""
    # Verify admin token
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not verify_admin_token(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    status = data.get('status')
    
    if status not in ['unread', 'read', 'addressed', 'pending']:
        return jsonify({'error': 'Invalid status'}), 400
    
    try:
        conn = sqlite3.connect('school.db')
        c = conn.cursor()
        
        c.execute('''
            UPDATE feedback 
            SET status = ?, updated_at = ?
            WHERE id = ?
        ''', (status, datetime.now(), feedback_id))
        
        conn.commit()
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/feedback/<int:feedback_id>', methods=['DELETE'])
def delete_feedback(feedback_id):
    """Delete feedback"""
    # Verify admin token
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not verify_admin_token(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = sqlite3.connect('school.db')
        c = conn.cursor()
        
        c.execute('DELETE FROM feedback WHERE id = ?', (feedback_id,))
        conn.commit()
        
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/feedback/mark-all-read', methods=['POST'])
def mark_all_feedback_read():
    """Mark all feedback as read"""
    # Verify admin token
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not verify_admin_token(token):
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = sqlite3.connect('school.db')
        c = conn.cursor()
        
        c.execute('''
            UPDATE feedback 
            SET status = 'read', updated_at = ?
            WHERE status = 'unread'
        ''', (datetime.now(),))
        
        conn.commit()
        
        return jsonify({'success': True, 'message': 'All feedback marked as read'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

# Helper functions
def verify_admin_token(token):
    """Verify admin token - implement your own logic"""
    # This is a placeholder - implement proper JWT or session validation
    return token == 'your-secure-token' or check_token_in_db(token)

def send_notification_email(feedback_id, feedback_data):
    """Send email notification to admin about new feedback"""
    # Implement email sending logic here
    pass

def send_response_email(feedback_id, response_text):
    """Send response email to feedback submitter"""
    # Implement email sending logic here
    pass

if __name__ == "__main__":
    app.run(debug=True)
