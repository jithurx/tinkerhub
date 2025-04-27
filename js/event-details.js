// js/event-details.js

// --- Cloudinary/API Config ---
const CLOUDINARY_CLOUD_NAME = 'dyvwqbyxl';
const CLOUDINARY_UPLOAD_PRESET = 'tinkerhub_unsigned_preset'; // Use appropriate preset

// Define the base URL for your API.
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
const API_BASE_URL = 'https://tinkerhub-0pse.onrender.com'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
// const API_BASE_URL = 'http://localhost:5000'; // For local testing

// --- Cloudinary Upload Helper ---
async function uploadToCloudinary(file, uploadPreset, cloudName, statusElement = null) {
    if (!cloudName || !uploadPreset || cloudName === 'YOUR_CLOUD_NAME_HERE') {
        console.error("Cloudinary credentials not configured!");
        if (statusElement) { statusElement.textContent = 'Upload Error: Config missing.'; statusElement.className = 'upload-status error'; }
        throw new Error('Cloudinary configuration missing.');
    }
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (statusElement) { statusElement.textContent = 'Uploading...'; statusElement.className = 'upload-status uploading'; }
    try {
        const response = await fetch(url, { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.error?.message || `Upload failed: ${response.statusText}`); }
        if (!data.secure_url) { throw new Error('Cloudinary response missing secure_url.'); }
        console.log('Cloudinary Upload Success:', data.secure_url);
        if (statusElement) { statusElement.textContent = 'Upload complete!'; statusElement.className = 'upload-status success'; }
        setTimeout(() => { if (statusElement?.textContent === 'Upload complete!') statusElement.textContent = ''; }, 2500);
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        if (statusElement) { statusElement.textContent = `Upload failed: ${error.message}`; statusElement.className = 'upload-status error'; }
        throw error;
    }
}

// --- Helper Functions ---
function getParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, '');
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const eventId = getParam('id');
    // Detail elements
    const detailStatusDiv = document.getElementById('detail-status');
    const detailContentDiv = document.getElementById('event-detail-content');
    const eventTitleElement = document.getElementById('event-title');
    const eventBannerElement = document.getElementById('event-banner');
    const eventDateElement = document.getElementById('event-date');
    const eventLocationElement = document.getElementById('event-location');
    const eventDescriptionElement = document.getElementById('event-description');
    const eventRegistrationDiv = document.getElementById('event-registration');
    const eventRegistrationLink = document.getElementById('event-registration-link');
    // Moments elements
    const momentsSection = document.getElementById('moments-section');
    const momentsGallery = document.getElementById('moments-gallery');
    const momentsStatusDiv = document.getElementById('moments-gallery-status');
    // Admin elements
    const adminControlsDiv = document.getElementById('admin-moments-controls');
    const adminAddMomentForm = document.getElementById('admin-add-moment-form');
    // ** NEW/UPDATED for file upload **
    const adminMomentFileInput = document.getElementById('admin-new-moment-file'); // File input
    const adminMomentPreview = document.getElementById('admin-moment-preview');     // Preview img
    const adminMomentUploadStatus = document.getElementById('admin-moment-upload-status'); // Upload status span
    const adminStatusDiv = document.getElementById('admin-status'); // General status for add/delete
    const currentMomentsList = document.getElementById('current-moments-list'); // For rendering deletable list

    // --- Check Elements ---
    const requiredElements = [eventId, detailStatusDiv, detailContentDiv, eventTitleElement, eventBannerElement, eventDateElement, eventLocationElement, eventDescriptionElement, eventRegistrationDiv, eventRegistrationLink, momentsSection, momentsGallery, momentsStatusDiv, adminControlsDiv, adminAddMomentForm, adminMomentFileInput, adminMomentPreview, adminMomentUploadStatus, adminStatusDiv, currentMomentsList];
    if (requiredElements.some(el => el === null || el === undefined)) {
        console.error('Event detail page elements missing or Event ID missing! Check HTML IDs and URL.');
        if(detailStatusDiv) detailStatusDiv.innerHTML = '<p class="error" style="color:red;">Error: Page structure incorrect or Event ID missing.</p>';
        return;
    }

    // --- Get User Status ---
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const isAdmin = token && userRole === 'admin';

    // --- Status Functions ---
    const setStatus = (element, message, isError = false, isSuccess = false) => {
        if (!element) return;
        element.innerHTML = `<p class="${isError ? 'error' : (isSuccess ? 'success' : '')}" style="${isError ? 'color:red;' : 'color:#777;'}">${message}</p>`;
        element.style.display = 'block';
        if (element === detailStatusDiv) { detailContentDiv.style.display = 'none'; momentsSection.style.display = 'none'; }
    };
    const clearStatus = (element) => { if (element) { element.innerHTML = ''; element.style.display = 'none'; }};

    // --- Main Data Loading Function ---
    const loadEventData = async () => {
        setStatus(detailStatusDiv, 'Loading event details...');
        detailContentDiv.style.display = 'none'; // Hide content until loaded
        momentsSection.style.display = 'none'; // Hide moments section initially
        eventRegistrationDiv.style.display = 'none'; // Hide registration initially
        adminControlsDiv.style.display = 'none'; // Hide admin controls initially

        try {
            const eventRes = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
            if (!eventRes.ok) {
                 const errorText = await eventRes.text();
                 if (eventRes.status === 404) throw new Error('Event not found.');
                 throw new Error(`Failed to fetch event details: ${eventRes.status} ${errorText}`);
            }
            const event = await eventRes.json();
            if (!event || typeof event !== 'object') throw new Error('Invalid event data received.');

            // --- Populate Core Event Details ---
            document.title = `${event.title || 'Event'} Details | TinkerHub Campus`;
            eventTitleElement.textContent = escapeHTML(event.title || 'Event Details');
            // Banner Image
            if (event.image && typeof event.image === 'string' && event.image.startsWith('http')) {
                 eventBannerElement.src = event.image;
                 eventBannerElement.alt = escapeHTML(event.title || 'Event Banner');
                 eventBannerElement.style.display = 'block';
                 eventBannerElement.onerror = () => { eventBannerElement.src = 'images/default-event-thumb.png'; };
            } else {
                eventBannerElement.style.display = 'none';
            }
            // Date & Location
            let formattedDate = 'Date not specified';
            let eventDateObj = null;
            if (event.date) {
                try {
                    eventDateObj = new Date(event.date);
                    if (!isNaN(eventDateObj)) { formattedDate = eventDateObj.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }); }
                } catch (e) { console.warn("Error formatting date:", e); }
            }
            eventDateElement.textContent = formattedDate;
            eventLocationElement.textContent = escapeHTML(event.location || 'N/A');
            // Description
            eventDescriptionElement.innerHTML = escapeHTML(event.description || 'No description provided.').replace(/\n/g, '<br>');

            clearStatus(detailStatusDiv); // Clear "Loading..." message
            detailContentDiv.style.display = 'block'; // Show populated content

            // --- Conditional Display Logic ---
            const now = new Date();
            // Check if date is valid AND in the past
            const isPast = eventDateObj && eventDateObj < now;

            // ** Registration Link Logic **
            // Show ONLY if event date is valid, date is in the future, AND link exists
            if (eventDateObj && !isPast && event.registrationLink && event.registrationLink.startsWith('http')) {
                 eventRegistrationLink.href = event.registrationLink;
                 eventRegistrationDiv.style.display = 'block';
            } else {
                 eventRegistrationDiv.style.display = 'none';
            }

            // ** Moments Section Logic **
            // Show section if event is past OR if the user is an admin
            if (isPast || isAdmin) {
                momentsSection.style.display = 'block';
                loadMoments(); // Always load moment display if section is shown
                adminControlsDiv.style.display = isAdmin ? 'block' : 'none';
                if (isAdmin) {
                    setupAdminMomentHandlers(); // Setup listeners for admin controls
                }
            } else {
                // Hide section completely if not past and not admin
                momentsSection.style.display = 'none';
            }
            // --- End Conditional Display Logic ---

        } catch (error) {
            console.error('Error loading event details:', error);
            setStatus(detailStatusDiv, `Error: ${error.message}`, true);
            detailContentDiv.style.display = 'none'; // Hide content on error
            momentsSection.style.display = 'none';
        }
    };

    // --- Load and Render Moments Gallery ---
    const loadMoments = async (highlightUrl = null) => {
        setStatus(momentsStatusDiv, 'Loading moments...');
        momentsGallery.innerHTML = ''; // Clear previous
        currentMomentsList.innerHTML = '<li>Loading...</li>'; // Also update admin list

        try {
            const momentsRes = await fetch(`${API_BASE_URL}/api/events/${eventId}/moments`);
            if (!momentsRes.ok) {
                 if (momentsRes.status === 404) { // Handle 404 - means event exists but no moments array or endpoint DNE
                     clearStatus(momentsStatusDiv);
                     momentsGallery.innerHTML = '<p style="color:#777; text-align:center; grid-column: 1 / -1;">No moments available for this event.</p>';
                     currentMomentsList.innerHTML = '<li>No moments added yet.</li>';
                     return; // No moments to render
                 }
                 const errorText = await momentsRes.text();
                 throw new Error(`Failed to fetch moments: ${momentsRes.status} ${errorText}`);
            }
            const images = await momentsRes.json();

            clearStatus(momentsStatusDiv);
            momentsGallery.innerHTML = ''; // Clear gallery loading
            currentMomentsList.innerHTML = ''; // Clear admin list loading

            if (!Array.isArray(images) || images.length === 0) {
                const noMomentsMsg = '<p style="color:#777; text-align:center; grid-column: 1 / -1;">No moments available for this event.</p>';
                momentsGallery.innerHTML = noMomentsMsg;
                currentMomentsList.innerHTML = '<li>No moments added yet.</li>';
                return;
            }

            // Render gallery images AND admin list items
            images.forEach(imageUrl => {
                if (typeof imageUrl === 'string' && imageUrl.trim()) {
                    // Add to Public Gallery
                    const momentItem = document.createElement('div');
                    momentItem.classList.add('moment-item');
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = "Event moment";
                    img.loading = "lazy";
                    img.onerror = () => { momentItem.style.display='none'; };
                    momentItem.appendChild(img);
                     if (imageUrl === highlightUrl) { /* ... highlight logic ... */ }
                    momentsGallery.appendChild(momentItem);

                    // Add to Admin Deletable List
                    if (isAdmin) {
                        const li = document.createElement('li');
                        const displayUrl = imageUrl.length > 50 ? imageUrl.substring(0, 47) + '...' : imageUrl;
                        li.innerHTML = `<span title="${escapeHTML(imageUrl)}">${escapeHTML(displayUrl)}</span> <button data-url="${escapeHTML(imageUrl)}" class="delete-moment-btn" aria-label="Remove moment URL">X</button>`;
                        // Add listener directly using event delegation on the list later
                        currentMomentsList.appendChild(li);
                    }
                }
            });

        } catch (error) {
            console.error('Error loading event moments:', error);
            setStatus(momentsStatusDiv, `Could not load moments: ${error.message}`, true);
        }
    };

    // --- Admin Action Handlers ---
    function setupAdminMomentHandlers() {
        // Listener for adding new moments via file upload
        adminAddMomentForm.removeEventListener('submit', handleAddMomentSubmit); // Prevent duplicates
        adminAddMomentForm.addEventListener('submit', handleAddMomentSubmit);

        // Listener for deleting moments from the admin list (using delegation)
        currentMomentsList.removeEventListener('click', handleDeleteMomentClick); // Prevent duplicates
        currentMomentsList.addEventListener('click', handleDeleteMomentClick);

        // Listener for file input change to show preview
        adminMomentFileInput.removeEventListener('change', handleFilePreview);
        adminMomentFileInput.addEventListener('change', handleFilePreview);
    }

    // Show preview when admin selects a file
    function handleFilePreview(event) {
        const file = event.target.files?.[0];
        clearStatus(adminMomentUploadStatus); // Clear previous upload status
        adminMomentPreview.style.display = 'none'; // Hide preview initially

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                adminMomentPreview.src = e.target.result;
                adminMomentPreview.style.display = 'block'; // Show preview
            }
            reader.readAsDataURL(file);
        }
    }

    // Handle Submission of the "Add Moment" Form (Upload then Add URL)
    async function handleAddMomentSubmit(e) {
        e.preventDefault();
        const file = adminMomentFileInput.files?.[0];
        if (!file) { setStatus(adminStatusDiv, 'Please select an image file to upload.', true); return; }

        const addButton = adminAddMomentForm.querySelector('button');
        addButton.disabled = true; addButton.textContent = 'Uploading...';
        clearStatus(adminStatusDiv); // Clear general admin status
        // Use the dedicated status element for upload feedback
        adminMomentUploadStatus.textContent = ''; adminMomentUploadStatus.className = 'upload-status';

        let uploadedUrl = null;
        try {
            // 1. Upload to Cloudinary
            uploadedUrl = await uploadToCloudinary(file, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME, adminMomentUploadStatus);

            // 2. If upload successful, send URL to backend
            if (uploadedUrl) {
                addButton.textContent = 'Adding URL...'; // Update status
                const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/moments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ imageUrl: uploadedUrl }) // Send the Cloudinary URL
                });
                const result = await response.json();
                if (!response.ok) {
                    if (response.status === 401) { throw new Error('Unauthorized: Session expired?'); }
                    throw new Error(result.message || `Failed to add moment URL: ${response.statusText}`);
                }
                // Success adding URL
                setStatus(adminStatusDiv, 'Moment added successfully!', false, true); // Show success in main admin status
                adminAddMomentForm.reset(); // Clear the form (including file input)
                adminMomentPreview.style.display = 'none'; // Hide preview
                loadMoments(uploadedUrl); // Reload gallery & admin list, highlight new one
                setTimeout(() => clearStatus(adminStatusDiv), 2500);
            } else {
                // This case should be handled by uploadToCloudinary throwing an error
                throw new Error("Image upload succeeded but no URL was returned.");
            }

        } catch (error) {
            console.error('Error adding moment:', error);
            // Display error in main admin status div if uploadToCloudinary fails early or POST fails
            setStatus(adminStatusDiv, `Error: ${error.message}`, true);
            if (error.message.includes('Unauthorized')) { handleUnauthorized(); }
        } finally {
            if (addButton?.isConnected) { addButton.disabled = false; addButton.textContent = 'Upload & Add'; }
        }
    };

    // Handle clicks on delete buttons within the admin moments list
    async function handleDeleteMomentClick(event) {
        if (event.target.classList.contains('delete-moment-btn')) {
            const button = event.target;
            const li = button.closest('li');
            const urlToDelete = button.dataset.url || li?.querySelector('span')?.textContent; // Get URL from data attr or text

            if (!urlToDelete) {
                console.error("Could not determine URL to delete for moment.");
                return;
            }

            await handleDeleteMoment(urlToDelete.trim()); // Call the delete function
        }
    }

    // Handle actual deletion API call
    async function handleDeleteMoment(imageUrlToDelete) {
        if (!isAdmin || !confirm(`Delete this moment image?\n${imageUrlToDelete}`)) return;

        clearStatus(adminStatusDiv);
        // Disable all delete buttons briefly
        const deleteButtons = currentMomentsList.querySelectorAll('.delete-moment-btn');
        deleteButtons.forEach(btn => btn.disabled = true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/moments`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ imageUrlToDelete: imageUrlToDelete })
            });
            const result = await response.json();
            if (!response.ok) {
                if (response.status === 401) { throw new Error('Unauthorized: Session expired?'); }
                // Handle specific case where moment wasn't found by backend $pull
                if (response.status === 404 && result.message.includes('not found')) {
                    setStatus(adminStatusDiv, 'Moment already removed or not found.', true);
                } else {
                    throw new Error(result.message || `Failed to delete moment: ${response.statusText}`);
                }
            } else {
                setStatus(adminStatusDiv, 'Moment deleted.', false, true); // Show success
            }
            loadMoments(); // Reload gallery & admin list
            setTimeout(() => clearStatus(adminStatusDiv), 2000);
        } catch (error) {
            console.error('Error deleting moment:', error);
            setStatus(adminStatusDiv, `Error: ${error.message}`, true);
            if (error.message.includes('Unauthorized')) { handleUnauthorized(); }
            // Re-enable buttons on error
            deleteButtons.forEach(btn => btn.disabled = false);
        }
    }

    // --- Unauthorized Helper ---
    function handleUnauthorized() {
        localStorage.removeItem('token'); localStorage.removeItem('role');
        setStatus(detailStatusDiv, 'Session expired. Redirecting to login...', true);
        setTimeout(() => { window.location.href = 'admin/login.html'; }, 2500);
    }

    // --- Initial Load ---
    loadEventData();

}); // End DOMContentLoaded