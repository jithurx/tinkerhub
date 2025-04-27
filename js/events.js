// js/events.js

// Define the base URL for your API.
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
const API_BASE_URL = 'https://tinkerhub-0pse.onrender.com'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
// const API_BASE_URL = 'http://localhost:5000'; // For local testing

// --- Helper to escape HTML ---
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, '\'');
}

document.addEventListener('DOMContentLoaded', () => {
    const upcomingContainer = document.getElementById('upcoming-events');
    const pastContainer = document.getElementById('past-events');

    if (!upcomingContainer || !pastContainer) {
        console.error('Event list containers (#upcoming-events or #past-events) not found!');
        // Display error message in both potential containers if they exist
        if (upcomingContainer) upcomingContainer.innerHTML = '<p class="loading-message error">Error: Page structure incorrect.</p>';
        if (pastContainer) pastContainer.innerHTML = '<p class="loading-message error">Error: Page structure incorrect.</p>';
        return;
    }

    const setLoadingState = (container, message) => {
        container.innerHTML = `<p class="loading-message">${message}</p>`;
    };

    const renderEvents = (events) => {
        upcomingContainer.innerHTML = ''; // Clear previous content/loading messages
        pastContainer.innerHTML = '';

        const now = new Date();
        let upcomingCount = 0;
        let pastCount = 0;

        if (!Array.isArray(events)) {
             console.error("Received non-array data for events:", events);
             upcomingContainer.innerHTML = '<p class="loading-message error">Error: Invalid event data received.</p>';
             return;
         }

        // Ensure data is sorted (newest date first overall)
        events.sort((a, b) => new Date(b.date) - new Date(a.date));

        events.forEach(event => {
            if (!event || !event._id || !event.date) {
                console.warn("Skipping invalid event object:", event);
                return; // Skip malformed event data
            }
            const eventDate = new Date(event.date);
            const isPast = eventDate < now;

            // --- 1. Create the Card Content ---
            const card = document.createElement('div');
            card.classList.add('event-card', 'tinker-card');

            const formattedDate = eventDate.toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            const imageUrl = event.image || 'images/default-event-thumb.png'; // Default thumbnail
            const title = escapeHTML(event.title || 'Untitled Event');
            const description = escapeHTML(event.description?.substring(0, 100) || '') + (event.description?.length > 100 ? '...' : '');

            card.innerHTML = `
                <div class="event-img-container">
                    <img src="${imageUrl}" alt="${title}" class="event-img" onerror="this.onerror=null; this.src='images/default-event-thumb.png';">
                </div>
                <div class="event-content">
                    <h2>${title}</h2>
                    <small>Date: ${formattedDate}</small>
                    <p>${description || 'No description.'}</p>
                </div>
            `;

            // --- 2. Create the Link Wrapper ---
            const link = document.createElement('a');
            link.href = `event-details.html?id=${event._id}`; // Link using MongoDB _id
            link.setAttribute('aria-label', `View details for ${title}`);
            link.appendChild(card); // Put the card inside the link

            // --- 3. Append the Link (containing the card) to the correct container ---
            if (isPast) {
                pastContainer.appendChild(link);
                pastCount++;
            } else {
                upcomingContainer.appendChild(link); // ** Link upcoming events too **
                upcomingCount++;
            }
        });

        // Handle cases where no events are found
        if (upcomingCount === 0) {
            upcomingContainer.innerHTML = '<p class="loading-message">No upcoming events scheduled right now.</p>';
        }
        if (pastCount === 0) {
            pastContainer.innerHTML = '<p class="loading-message">No past events found.</p>';
        }
    };

    const loadEvents = async () => {
        setLoadingState(upcomingContainer, 'Loading upcoming events...');
        setLoadingState(pastContainer, 'Loading past events...');

        try {
            const response = await fetch(`${API_BASE_URL}/api/events`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
            const eventsData = await response.json();
            renderEvents(eventsData); // Render all events
        } catch (error) {
            console.error('Error loading events:', error);
            const errorMessage = '<p class="loading-message error" style="color:red;">Could not load events. Please try again later.</p>';
            // Show error in both containers if fetch fails
            if (upcomingContainer) upcomingContainer.innerHTML = errorMessage;
            if (pastContainer) pastContainer.innerHTML = errorMessage;
        }
    };

    // Initial load
    loadEvents();
});