// js/event-details.js

// Define the base URL for your API.
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
const API_BASE_URL = 'https://tinkerhub-0pse.onrender.com'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
// const API_BASE_URL = 'http://localhost:5000'; // For local testing

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
    const adminNewUrlInput = document.getElementById('admin-new-moment-url');
    const adminStatusDiv = document.getElementById('admin-status');

    // --- Check Elements ---
    const requiredElements = [eventId, detailStatusDiv, detailContentDiv, eventTitleElement, eventBannerElement, eventDateElement, eventLocationElement, eventDescriptionElement, eventRegistrationDiv, eventRegistrationLink, momentsSection, momentsGallery, momentsStatusDiv, adminControlsDiv, adminAddMomentForm, adminNewUrlInput, adminStatusDiv];
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
    const setStatus = (element, message, isError = false) => {
        if (!element) return;
        element.innerHTML = `<p class="${isError ? 'error' : ''}" style="${isError ? 'color:red;' : 'color:#777;'}">${message}</p>`;
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
                 // Load gallery content ONLY if event is actually past
                if (isPast) {
                    loadMoments();
                } else {
                     // Upcoming event, but admin is viewing
                     setStatus(momentsStatusDiv, 'Moments can be added/viewed after the event.', false);
                     momentsGallery.innerHTML = ''; // Keep gallery empty
                }
                 // Show Admin Controls within the moments section ONLY if admin
                 adminControlsDiv.style.display = isAdmin ? 'block' : 'none';
                 if (isAdmin) {
                     setupAdminMomentHandlers(); // Attach listeners if controls shown
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

        try {
            const momentsRes = await fetch(`${API_BASE_URL}/api/events/${eventId}/moments`);
            if (!momentsRes.ok) {
                 if (momentsRes.status === 404) { // Handle 404 - means event exists but no moments array or endpoint DNE
                     clearStatus(momentsStatusDiv);
                     momentsGallery.innerHTML = '<p style="color:#777; text-align:center; grid-column: 1 / -1;">No moments available for this event.</p>';
                     return; // No moments to render
                 }
                 const errorText = await momentsRes.text();
                 throw new Error(`Failed to fetch moments: ${momentsRes.status} ${errorText}`);
            }
            const images = await momentsRes.json();

            clearStatus(momentsStatusDiv);

            if (!Array.isArray(images) || images.length === 0) {
                momentsGallery.innerHTML = '<p style="color:#777; text-align:center; grid-column: 1 / -1;">No moments available for this event.</p>';
                return;
            }

            // Render gallery images
            images.forEach(imageUrl => {
                if (typeof imageUrl === 'string' && imageUrl.trim()) {
                    const momentItem = document.createElement('div');
                    momentItem.classList.add('moment-item');
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = "Event moment";
                    img.loading = "lazy";
                    img.onerror = () => { momentItem.style.display='none'; };
                    momentItem.appendChild(img);
                    // Add Delete button ONLY for admins
                    if (isAdmin) {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.innerHTML = '×';
                        deleteBtn.className = 'delete-moment-btn';
                        deleteBtn.title = 'Delete this moment';
                        deleteBtn.setAttribute('aria-label', 'Delete moment image');
                        deleteBtn.addEventListener('click', () => handleDeleteMoment(imageUrl));
                        momentItem.appendChild(deleteBtn);
                    }
                     if (imageUrl === highlightUrl) { /* ... highlight logic ... */ }
                    momentsGallery.appendChild(momentItem);
                }
            });

        } catch (error) {
            console.error('Error loading event moments:', error);
            setStatus(momentsStatusDiv, `Could not load moments: ${error.message}`, true);
        }
    };


    // --- Admin Action Handlers ---
    function setupAdminMomentHandlers() {
        // Ensure listener isn't added multiple times if loadEventData runs again
        adminAddMomentForm.removeEventListener('submit', handleAddMomentSubmit);
        adminAddMomentForm.addEventListener('submit', handleAddMomentSubmit);
    }

    async function handleAddMomentSubmit(e) {
        e.preventDefault();
        const newUrl = adminNewUrlInput.value.trim();
        if (!newUrl || !newUrl.startsWith('http')) { setStatus(adminStatusDiv, 'Please enter a valid image URL starting with http/https.', true); return; }
        const addButton = adminAddMomentForm.querySelector('button');
        addButton.disabled = true; addButton.textContent = 'Adding...';
        clearStatus(adminStatusDiv);
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/moments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ imageUrl: newUrl })
            });
            const result = await response.json();
            if (!response.ok) {
                 if (response.status === 401) { throw new Error('Unauthorized: Session expired?'); }
                 throw new Error(result.message || `Failed to add moment: ${response.statusText}`);
            }
            setStatus(adminStatusDiv, 'Moment added!', false);
            adminNewUrlInput.value = ''; loadMoments(newUrl); setTimeout(() => clearStatus(adminStatusDiv), 2000);
        } catch (error) {
            console.error('Error adding moment:', error);
            setStatus(adminStatusDiv, `Error: ${error.message}`, true);
            if (error.message.includes('Unauthorized')) { handleUnauthorized(); }
        } finally {
            addButton.disabled = false; addButton.textContent = 'Add Moment';
        }
    };

    async function handleDeleteMoment(imageUrlToDelete) {
         if (!isAdmin || !confirm(`Delete this moment image?\n${imageUrlToDelete}`)) return;
         clearStatus(adminStatusDiv);
         const deleteButtons = momentsGallery.querySelectorAll('.delete-moment-btn');
         deleteButtons.forEach(btn => btn.disabled = true); // Disable buttons during operation

         try {
              const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/moments`, {
                 method: 'DELETE',
                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                 body: JSON.stringify({ imageUrlToDelete: imageUrlToDelete })
              });
              const result = await response.json();
              if (!response.ok) {
                 if (response.status === 401) { throw new Error('Unauthorized: Session expired?'); }
                 throw new Error(result.message || `Failed to delete moment: ${response.statusText}`);
              }
              setStatus(adminStatusDiv, 'Moment deleted.', false); loadMoments(); setTimeout(() => clearStatus(adminStatusDiv), 2000);
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