// js/events.js

// Define the base URL for your API.
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
const API_BASE_URL = 'https://tinkerhub-0pse.onrender.com'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
// const API_BASE_URL = 'http://localhost:5000'; // For local testing

document.addEventListener('DOMContentLoaded', () => {
    const upcomingContainer = document.getElementById('upcoming-events');
    const pastContainer = document.getElementById('past-events');

    // Check if containers exist
    if (!upcomingContainer || !pastContainer) {
        console.error('Event list containers (#upcoming-events or #past-events) not found!');
        return;
    }

    const setLoadingState = (container, message) => {
        container.innerHTML = `<p class="loading-message">${message}</p>`;
    };

    const renderEvents = (events) => {
        // Clear previous content/loading messages
        upcomingContainer.innerHTML = '';
        pastContainer.innerHTML = '';

        const now = new Date();
        let upcomingCount = 0;
        let pastCount = 0;

        // Ensure data is sorted (newest date first overall)
        events.sort((a, b) => new Date(b.date) - new Date(a.date));

        events.forEach(event => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < now;

            const card = document.createElement('div');
            card.classList.add('event-card', 'tinker-card'); // Add base card class

            const formattedDate = eventDate.toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            // Use default image if none provided
            const imageUrl = event.image || 'images/default-event-thumb.png'; // Provide a default thumb path

            card.innerHTML = `
                <div class="event-img-container">
                    <img src="${imageUrl}" alt="${escapeHTML(event.title || 'Event')}" class="event-img" onerror="this.onerror=null; this.src='images/default-event-thumb.png';"> <!-- Fallback on image error -->
                </div>
                <div class="event-content">
                    <h2>${escapeHTML(event.title || 'Untitled Event')}</h2>
                    <small>Date: ${formattedDate}</small>
                    <p>${escapeHTML(event.description?.substring(0, 100) || '')}${event.description?.length > 100 ? '...' : ''}</p> <!-- Short description -->
                </div>
            `;

            if (isPast) {
                // Wrap past event card in a link
                const link = document.createElement('a');
                link.href = `event-details.html?id=${event._id}`; // Link using MongoDB _id
                link.appendChild(card);
                pastContainer.appendChild(link);
                pastCount++;
            } else {
                // Append upcoming event card directly (could also be a link if desired)
                upcomingContainer.appendChild(card);
                upcomingCount++;
            }
        });

        // Handle cases where no events are found in a section
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
            if (!Array.isArray(eventsData)) {
                throw new Error("Invalid data received from API.");
            }
            renderEvents(eventsData); // Render all events, sorted and separated
        } catch (error) {
            console.error('Error loading events:', error);
            const errorMessage = '<p class="loading-message" style="color:red;">Could not load events. Please try again later.</p>';
            upcomingContainer.innerHTML = errorMessage;
            pastContainer.innerHTML = errorMessage;
        }
    };

     // Helper to escape HTML
     function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
     }


    // Initial load
    loadEvents();
});