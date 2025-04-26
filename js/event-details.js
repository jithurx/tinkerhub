// js/event-details.js
// const API_BASE_URL = 'https://tinkerhub-nssce-api.onrender.com'; // PRODUCTION URL
const API_BASE_URL = 'http://localhost:5000'; // LOCAL DEV URL (Example)

function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener('DOMContentLoaded', () => {
    const id = getParam('id');
    const detailContainer = document.getElementById('event-detail');
    const galleryContainer = document.getElementById('event-moments');

    if (!id || !detailContainer || !galleryContainer) {
        console.error('Missing required elements (ID, detail container, or gallery container).');
        if (detailContainer) detailContainer.innerHTML = '<p style="color:red;">Error: Event ID missing or page structure incorrect.</p>';
        return;
    }

    detailContainer.innerHTML = '<p style="text-align: center; color: #777;">Loading event details...</p>';
    galleryContainer.innerHTML = '<p style="text-align: center; color: #777; grid-column: 1 / -1;">Loading moments...</p>';

    // Fetch Event Details
    fetch(`${API_BASE_URL}/api/events/${id}`)
        .then(res => {
            if (!res.ok) { throw new Error(`Event not found or error: ${res.status} ${res.statusText}`); }
            return res.json();
        })
        .then(event => {
            if (!event || typeof event !== 'object') { throw new Error('Invalid event data received.'); }
            const formattedDate = event.date ? new Date(event.date).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Date not specified';
            detailContainer.innerHTML = `
                <h1>${event.title || 'Event Details'}</h1>
                ${event.image ? `<img src="${event.image}" alt="${event.title || 'Event Banner'}" class="banner-img">` : ''}
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p>${event.description || 'No description available.'}</p>
            `;
            // Fetch moments after rendering details
            return fetch(`${API_BASE_URL}/api/events/${id}/moments`);
        })
        .then(res => {
             if (!res.ok) {
                 if (res.status === 404) {
                     console.log(`No moments found for event ${id}.`);
                     galleryContainer.innerHTML = '<p style="text-align: center; color: #777; grid-column: 1 / -1;">No moments available.</p>';
                 } else { throw new Error(`Failed to fetch moments: ${res.status} ${res.statusText}`); }
                 return null; // Indicate no moments loaded
             }
             return res.json();
        })
        .then(images => {
             if (images === null) return; // Stop if moments fetch failed gracefully
             galleryContainer.innerHTML = ''; // Clear loading
             if (!Array.isArray(images) || images.length === 0) {
                 galleryContainer.innerHTML = '<p style="text-align: center; color: #777; grid-column: 1 / -1;">No moments available.</p>';
                 return;
             }
             images.forEach(imageUrl => {
                if (typeof imageUrl === 'string' && imageUrl.trim() !== '') { // Basic check for valid URL string
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = "Event moment";
                    img.onerror = () => { img.style.display='none'; console.warn(`Failed to load image: ${imageUrl}`); }; // Hide broken images
                    galleryContainer.appendChild(img);
                }
             });
        })
        .catch(error => {
            console.error('Error loading event details or moments:', error);
            // Show error in appropriate container
            if (detailContainer.innerHTML.includes('Loading')) {
                 detailContainer.innerHTML = `<p style="color:red;">Could not load event details: ${error.message}.</p>`;
            } else {
                 // If details loaded but moments failed, show moments error
                  galleryContainer.innerHTML = `<p style="color:red; grid-column: 1 / -1;">Could not load moments: ${error.message}.</p>`;
            }
        });
});