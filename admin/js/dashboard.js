// admin/js/dashboard.js

// Define the base URL for your API.
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
const API_BASE_URL = 'https://tinkerhub-0pse.onrender.com'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
// const API_BASE_URL = 'http://localhost:5000'; // For local testing

// Cloudinary Configuration
// !!! IMPORTANT: Replace with your ACTUAL Cloudinary credentials !!!
const CLOUDINARY_CLOUD_NAME = 'dyvwqbyxl';
const CLOUDINARY_UPLOAD_PRESET = 'tinkerhub_unsigned_preset';

const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

// Security Check: Redirect immediately if not logged in as admin
if (!token || role !== 'admin') {
    console.warn('Access Denied: No valid admin token found. Redirecting to login.');
    localStorage.removeItem('token'); // Clear invalid items
    localStorage.removeItem('role');
    window.location.replace('login.html'); // Use replace to prevent back button issues
}

// --- DOM Elements ---
const navButtons = document.querySelectorAll('main.dashboard nav button:not(#logout-btn)');
const container = document.getElementById('section-container');
const logoutBtn = document.getElementById('logout-btn');

// --- Data Configuration ---
// Define sections, API endpoints, and relevant fields
const sections = {
    announcements: {
        title: 'Announcements',
        url: `${API_BASE_URL}/api/announcements`,
        fields: ['title', 'content', 'date', 'image', 'link'], // Match model (date might need special handling)
        fieldTypes: { date: 'datetime-local', image: 'file', link: 'url', content: 'textarea' },
        requiredFields: ['title', 'content']
    },
    events: {
        title: 'Events',
        url: `${API_BASE_URL}/api/events`,
        fields: ['title', 'description', 'date', 'image', 'location', 'registrationLink'], // Add location/link if in model
        fieldTypes: { date: 'datetime-local', image: 'file', registrationLink: 'url', description: 'textarea' },
        requiredFields: ['title', 'description', 'date']
    },
    resources: {
        title: 'Resources',
        url: `${API_BASE_URL}/api/resources`,
        fields: ['title', 'link', 'description', 'category', 'image'],
        fieldTypes: { image: 'file', link: 'url', description: 'textarea' },
        requiredFields: ['title', 'link']
    }
    // Add 'users' or other sections here if needed
};

// --- Cloudinary Upload Helper ---
async function uploadToCloudinary(file, uploadPreset = CLOUDINARY_UPLOAD_PRESET, cloudName = CLOUDINARY_CLOUD_NAME, statusElement = null) {
    if (!file) return null;
    
    if (statusElement) {
        statusElement.innerHTML = '<div class="upload-status">Uploading image... Please wait.</div>';
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (statusElement) {
            statusElement.innerHTML = '<div class="upload-status success">Image uploaded successfully!</div>';
            setTimeout(() => {
                statusElement.innerHTML = '';
            }, 3000);
        }
        
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        if (statusElement) {
            statusElement.innerHTML = `<div class="upload-status error">Upload failed: ${error.message}</div>`;
        }
        return null;
    }
}

// --- Event Listeners ---

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active')); // Use class for styling active button
        btn.classList.add('active');
        loadSection(btn.dataset.section);
    });
});

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        console.log('Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.replace('login.html'); // Use replace for logout
    });
} else {
    console.error('Logout button not found!');
}

// --- Core Functions ---

async function loadSection(sectionName) {
    const sectionConfig = sections[sectionName];
    if (!sectionConfig) {
        container.innerHTML = `<p style="color:red;">Error: Invalid section '${sectionName}'.</p>`;
        return;
    }

    container.innerHTML = `<p style="text-align: center; padding: 2rem; color: #777;">Loading ${sectionConfig.title}...</p>`;

    try {
        // Fetch existing items - GET might not need token if public, but include anyway for consistency
        const res = await fetch(sectionConfig.url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 401) { throw new Error('Unauthorized/Expired Token'); }
        if (!res.ok) { throw new Error(`Failed to fetch ${sectionConfig.title}: ${res.status} ${res.statusText}`); }

        const items = await res.json();
        if (!Array.isArray(items)) { throw new Error('Invalid data received from API.'); }

        // Build and render HTML for the section
        container.innerHTML = buildSectionHtml(sectionName, sectionConfig, items);

        // Add event handlers for the newly rendered form and delete buttons
        setupCreateForm(sectionName, sectionConfig);
        setupDeleteButtons(sectionName, sectionConfig);
        setupImageUploadPreview();

    } catch (err) {
        handleLoadError(err, sectionConfig.title);
    }
}

function buildSectionHtml(sectionName, config, items) {
    const { title, fields, fieldTypes, requiredFields } = config;

    // Create form inputs based on fields and types
    const formInputs = fields.map(field => {
        const type = fieldTypes?.[field] || 'text';
        const isRequired = requiredFields?.includes(field);
        const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // Format label

        if (type === 'textarea') {
             return `
                <div class="form-group">
                    <label for="create-${field}">${label}: ${isRequired ? '<span style="color:red">*</span>' : ''}</label>
                    <textarea name="${field}" id="create-${field}" placeholder="${label}" rows="3" ${isRequired ? 'required' : ''}></textarea>
                </div>`;
        } else if (type === 'file') {
            return `
                <div class="form-group">
                    <label for="create-${field}">${label}: ${isRequired ? '<span style="color:red">*</span>' : ''}</label>
                    <input type="${type}" name="${field}" id="create-${field}" accept="image/*" ${isRequired ? 'required' : ''}/>
                    <div id="create-${field}-preview" class="image-preview"></div>
                    <div id="create-${field}-status" class="upload-status-container"></div>
                </div>`;
        } else {
            return `
                <div class="form-group">
                    <label for="create-${field}">${label}: ${isRequired ? '<span style="color:red">*</span>' : ''}</label>
                    <input type="${type}" name="${field}" id="create-${field}" placeholder="${label}" ${isRequired ? 'required' : ''}/>
                </div>`;
        }
    }).join('');

    // Create list items
    const listItems = items.map(item => `
        <li data-id="${item._id}">
            <div class="item-details">
             ${fields.map(f => `<span><strong>${f.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ${formatFieldValue(f, item[f])}</span>`).join('')}
            </div>
            <div class="item-actions">
             <button class="delete tinker-button" aria-label="Delete ${title.slice(0, -1)}">Delete</button>
             <!-- TODO: Add Edit button and functionality -->
            </div>
        </li>`
    ).join('');

    return `
        <h2>Manage ${title}</h2>
        <form id="create-form">
            <h3>Add New ${title.slice(0, -1)}</h3>
            ${formInputs}
            <button type="submit" class="tinker-button">Add New</button>
        </form>
        <hr style="margin: 2rem 0; border: 1px dashed var(--color-border);">
        <h3>Existing ${title}</h3>
        <ul class="item-list">${items.length > 0 ? listItems : '<li><p>No items found.</p></li>'}</ul>
    `;
}

// Setup image preview for file inputs
function setupImageUploadPreview() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        const previewDiv = document.getElementById(`${input.id}-preview`);
        if (previewDiv) {
            input.addEventListener('change', function() {
                if (this.files && this.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewDiv.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; margin-top: 10px;">`;
                    };
                    reader.readAsDataURL(this.files[0]);
                } else {
                    previewDiv.innerHTML = '';
                }
            });
        }
    });
}

// Helper to determine input type (refined)
function getInputType(fieldName, typesConfig = {}) {
    if (typesConfig[fieldName]) return typesConfig[fieldName];
    if (fieldName === 'date') return 'datetime-local';
    if (fieldName === 'link' || fieldName === 'registrationLink') return 'url';
    if (fieldName === 'image') return 'file';
    if (fieldName === 'description' || fieldName === 'content') return 'textarea';
    if (fieldName === 'password') return 'password';
    return 'text';
}

// Helper to check if field is required
function isRequired(fieldName, requiredConfig = []) {
    return requiredConfig.includes(fieldName);
}

// Helper to format field values for display (refined)
function formatFieldValue(fieldName, value) {
    if (value === null || value === undefined || value === '') return 'N/A';
    if (fieldName === 'date' && value) {
        try { return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }); }
        catch (e) { return value; }
    }
    if (fieldName === 'link' || fieldName === 'registrationLink') {
         // Make links clickable
         const displayValue = value.length > 40 ? value.substring(0, 37) + '...' : value;
         return `<a href="${value}" target="_blank" rel="noopener noreferrer" title="${value}">${displayValue}</a>`;
    }
    if (fieldName === 'image' && typeof value === 'string' && value.startsWith('http')) {
        // Display image with thumbnail
        return `<a href="${value}" target="_blank" rel="noopener noreferrer" title="View full image">
                  <img src="${value}" alt="Thumbnail" style="max-width: 100px; max-height: 100px;">
                </a>`;
    }
    // Truncate long text
    if (typeof value === 'string' && value.length > 60) {
        return escapeHTML(value.substring(0, 57)) + '...';
    }
    return escapeHTML(value.toString()); // Escape basic HTML
}

// Helper to escape HTML for safe display
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
 }

// --- Setup Form/Button Handlers ---

function setupCreateForm(sectionName, config) {
    const createForm = document.getElementById('create-form');
    if (!createForm) return;
    const { url, fields } = config;

    createForm.onsubmit = async (e) => {
        e.preventDefault();
        const createButton = createForm.querySelector('button[type="submit"]');
        createButton.disabled = true; createButton.textContent = 'Adding...';
        const body = {};
        let isValid = true;
        let fileUploads = [];

        // First pass: validate all fields
        for (const f of fields) {
            const inputElement = createForm.elements[f];
            if (!inputElement) continue; // Skip if input not found
            
            const value = inputElement.type === 'file' ? 
                (inputElement.files && inputElement.files[0] ? inputElement.files[0] : null) : 
                inputElement.value.trim();

            if (isRequired(f, config.requiredFields) && !value) {
                isValid = false;
                // Add visual validation feedback
                inputElement.style.border = '1px solid red';
                console.error(`Field ${f} is required.`);
            } else {
                inputElement.style.border = ''; // Reset border
                
                // If it's a file input, queue it for upload
                if (inputElement.type === 'file' && value) {
                    fileUploads.push({
                        field: f,
                        file: value,
                        statusElement: document.getElementById(`${inputElement.id}-status`)
                    });
                } else if (value || isRequired(f, config.requiredFields)) {
                    // Basic URL validation
                    if (getInputType(f, config.fieldTypes) === 'url' && value && !value.startsWith('http')) {
                        body[f] = 'https://' + value;
                    } else {
                        body[f] = value;
                    }
                }
            }
        }

        if (!isValid) {
            alert('Please fill in all required fields.');
            createButton.disabled = false; 
            createButton.textContent = 'Add New';
            return;
        }

        try {
            // Upload all files first
            for (const upload of fileUploads) {
                const imageUrl = await uploadToCloudinary(
                    upload.file, 
                    CLOUDINARY_UPLOAD_PRESET, 
                    CLOUDINARY_CLOUD_NAME, 
                    upload.statusElement
                );
                
                if (imageUrl) {
                    body[upload.field] = imageUrl;
                } else {
                    // If upload failed, show error and exit
                    throw new Error(`Failed to upload ${upload.field} image.`);
                }
            }

            console.log('Submitting:', body); // Debug: check payload

            const createRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            
            if (createRes.status === 401) { throw new Error('Unauthorized/Expired Token'); }
            if (!createRes.ok) {
                const errorData = await createRes.json().catch(() => ({}));
                throw new Error(`Failed to add: ${errorData.message || createRes.statusText}`);
            }
            
            loadSection(sectionName); // Refresh on success
        } catch (err) {
            console.error('Create Error:', err);
            alert(`Error adding item: ${err.message}`);
            if (err.message.includes('Unauthorized')) { logoutBtn.click(); }
        } finally {
            createButton.disabled = false; 
            createButton.textContent = 'Add New';
        }
    };
}

function setupDeleteButtons(sectionName, config) {
    const { url } = config;
    container.querySelectorAll('.delete').forEach(deleteBtn => {
        deleteBtn.onclick = async () => {
            const listItem = deleteBtn.closest('li');
            const itemId = listItem?.dataset.id;
            if (!itemId) { console.error('Could not find item ID for deletion.'); return; }

            const itemTitle = listItem.querySelector('.item-details span strong')?.nextSibling?.textContent?.trim() || `this ${sectionName.slice(0, -1)}`; // Try to get title for confirm msg

            if (!confirm(`Are you sure you want to delete ${itemTitle}?`)) {
                return;
            }

            deleteBtn.disabled = true; deleteBtn.textContent = 'Deleting...';
            try {
                const deleteRes = await fetch(`${url}/${itemId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                 });
                if (deleteRes.status === 401) { throw new Error('Unauthorized/Expired Token'); }
                if (!deleteRes.ok) {
                    const errorData = await deleteRes.json().catch(() => ({}));
                    throw new Error(`Failed to delete: ${errorData.message || deleteRes.statusText}`);
                }
                listItem.style.opacity = '0.5'; // Visual feedback
                listItem.remove(); // Optimistic UI removal
                 // Check if list is now empty
                 if (container.querySelectorAll('.item-list li').length === 0) {
                     container.querySelector('.item-list').innerHTML = '<li><p>No items found.</p></li>';
                 }
            } catch (err) {
                console.error('Delete Error:', err);
                alert(`Error deleting item: ${err.message}`);
                if (err.message.includes('Unauthorized')) { logoutBtn.click(); }
                // Re-enable button if deletion failed and element still exists
                 if (deleteBtn.isConnected) {
                    deleteBtn.disabled = false;
                    deleteBtn.textContent = 'Delete';
                 }
            }
        };
    });
}

// --- Error Handling ---
function handleLoadError(err, sectionTitle) {
    console.error(`Error loading ${sectionTitle}:`, err);
    container.innerHTML = `<p style="color:red;">Error loading ${sectionTitle}: ${err.message}. Please try again.</p>`;
    if (err.message === 'Unauthorized/Expired Token') {
        alert('Your session has expired. Please log in again.');
        logoutBtn.click();
    }
}

// --- Initial Load ---
if (token && role === 'admin') {
    loadSection('announcements'); // Load default section
    document.querySelector('main.dashboard nav button[data-section="announcements"]')?.classList.add('active');
} else {
    // This part should ideally not be reached due to the initial check, but as a fallback:
    console.error("Dashboard loaded without valid admin credentials.");
    container.innerHTML = '<p style="color:red; text-align:center; padding: 2rem;">Access Denied. Redirecting to login...</p>';
    setTimeout(() => { window.location.replace('login.html'); }, 2000);
}