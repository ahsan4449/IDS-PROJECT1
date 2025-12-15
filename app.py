from flask import Flask, request, jsonify
from datetime import datetime
import os

app = Flask(__name__, static_folder='.', static_url_path='')

# Configure upload settings
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Serve the main HTML page"""
    try:
        with open('index.html', 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error loading index.html: {str(e)}", 500

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and return metadata"""
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in request'}), 400
        
        file = request.files['file']
        
        # Check if user selected a file
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Get file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # Reset file pointer
        
        # Convert size to KB
        size_kb = round(file_size / 1024, 2)
        
        # Get current timestamp
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Prepare metadata
        metadata = {
            'name': file.filename,
            'size': size_kb,
            'timestamp': timestamp,
            'success': True
        }
        
        return jsonify(metadata), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({'error': 'File is too large. Maximum size is 16MB'}), 413

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Flask server starting...")
    print("📂 Make sure these files are in the same folder:")
    print("   - app.py")
    print("   - index.html")
    print("   - style.css")
    print("   - script.js")
    print("=" * 50)
    print("🌐 Open: http://127.0.0.1:5000")
    print("=" * 50)
    app.run(debug=True, port=5000)