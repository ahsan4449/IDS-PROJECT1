// Get DOM elements
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const fileLabel = document.querySelector('.file-label');
const submitBtn = document.querySelector('.submit-btn');
const btnText = document.getElementById('btnText');
const loader = document.getElementById('loader');
const messageDiv = document.getElementById('message');
const metadataSection = document.getElementById('metadataSection');
const metadataBody = document.getElementById('metadataBody');

// Update file name display when file is selected
fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        fileName.textContent = file.name;
        fileLabel.classList.add('has-file');
    } else {
        fileName.textContent = 'Choose a file...';
        fileLabel.classList.remove('has-file');
    }
});

// Handle form submission
uploadForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate file selection
    if (!fileInput.files || !fileInput.files[0]) {
        showMessage('Please select a file!', 'error');
        return;
    }
    
    // Get the file
    const file = fileInput.files[0];
    
    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);
    
    // Show loading state
    setLoadingState(true);
    hideMessage();
    hideMetadata();
    
    try {
        // Send file to backend
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Show success message
            showMessage('File uploaded successfully! ✅', 'success');
            
            // Display metadata
            displayMetadata(data);
            
            // Reset form
            uploadForm.reset();
            fileName.textContent = 'Choose a file...';
            fileLabel.classList.remove('has-file');
        } else {
            // Show error message
            showMessage(data.error || 'Upload failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Network error. Please check your connection.', 'error');
    } finally {
        // Hide loading state
        setLoadingState(false);
    }
});

// Set loading state
function setLoadingState(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.textContent = 'Uploading...';
        loader.style.display = 'inline-block';
    } else {
        submitBtn.disabled = false;
        btnText.textContent = 'Upload File';
        loader.style.display = 'none';
    }
}

// Show message
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            hideMessage();
        }, 5000);
    }
}

// Hide message
function hideMessage() {
    messageDiv.style.display = 'none';
    messageDiv.className = 'message';
}

// Display metadata in table
function displayMetadata(data) {
    // Clear existing metadata
    metadataBody.innerHTML = '';
    
    // Create table rows
    const rows = [
        { property: 'File Name', value: data.name },
        { property: 'File Size', value: `${data.size} KB` },
        { property: 'Upload Time', value: data.timestamp }
    ];
    
    rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row.property}</strong></td>
            <td>${row.value}</td>
        `;
        metadataBody.appendChild(tr);
    });
    
    // Show metadata section with animation
    metadataSection.style.display = 'block';
}

// Hide metadata section
function hideMetadata() {
    metadataSection.style.display = 'none';
}

// Handle drag and drop (bonus feature)
const dropArea = document.querySelector('.file-label');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropArea.style.borderColor = '#764ba2';
    dropArea.style.background = '#e9ecef';
}

function unhighlight() {
    dropArea.style.borderColor = '#667eea';
    dropArea.style.background = '#f8f9fa';
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        fileInput.files = files;
        fileName.textContent = files[0].name;
        fileLabel.classList.add('has-file');
    }
}