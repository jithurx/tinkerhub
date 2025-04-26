// js/events.js
// const API_BASE_URL = 'https://tinkerhub-nssce-api.onrender.com'; // PRODUCTION URL
const API_BASE_URL = 'http://localhost:5000'; // LOCAL DEV URL (Example)

document.addEventListener('DOMContentLoaded', () => {
    const upcomingContainer = document.getElementById('upcoming-events');
    const pastContainer = document.getElementById('past-events');
    const toggleBtn = document.getElementById('toggle-past-btn');
    let allEventsData = []; // Store all events after fetch
    let isPastShown = false;

    if (!upcomingContainer || !pastContainer || !toggleBtn) {
        console.error('Required event elements not found!');
        return;
    }

    const setLoadingState = () => {
        upcomingContainer.innerHTML = '<p style="text-align: center; color: #777; grid-column: 1 / -1;">Loading events...</p>';
        // Only clear past container if it's currently hidden or not yet loaded
        if (!isPastShown) {
             pastContainer.innerHTML = '<h2 style="font-family: \'Anton\', sans-serif; font-size: 2rem; text-align: center; grid-column: 1 / -1; margin-top: 2rem;">Past Events</h2><p style="text-align: center; color: #777; grid-column: 1 / -1;">Past events will load when shown.</p>';
        }
        toggleBtn.style.display = 'none'; // Hide initially
    };

    const renderEvents = () => {
        upcomingContainer.innerHTML = ''; // Clear previous content
        pastContainer.innerHTML = '<h2 style="font-family: \'Anton\', sans-serif; font-size: 2rem; text-align: center; grid-column: 1 / -1; margin-top: 2rem;">Past Events</h2>'; // Reset past header

        const now = new Date();
        let upcomingCount = 0;
        let pastCount = 0;

        // Ensure data is sorted (newest date first overall)
        allEventsData.sort((a, b) => new Date(b.date) - new Date(a.date));

        allEventsData.forEach(event => {
            const eventDate = new Date(event.date);
            const card = document.createElement('div');
            card.classList.add('event-card');

            const formattedDate = eventDate.toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
            });

            card.innerHTML = `
                ${event.image ? `<img src="${event.image}" alt="${event.title || 'Event image'}" class="event-img">` : '<div class="event-img-placeholder" style="height: 200px; background: #eee;"></div>'}
                <div class="event-content">
                    <h2>${event.title || 'No Title'}</h2>
                    <small>${formattedDate}</small>
                    <p>${event.description || 'No description.'}</p>
                </div>
            `;

            if (eventDate >= now) {
                upcomingContainer.appendChild(card);
                upcomingCount++;
            } else {
                const link = document.createElement('a');
                link.href = `event-details.html?id=${event._id}`; // Use _id from MongoDB
                link.appendChild(card);
                pastContainer.appendChild(link);
                pastCount++;
            }
        });

        if (upcomingCount === 0) {
            upcomingContainer.innerHTML = '<p style="text-align: center; color: #777; grid-column: 1 / -1;">No upcoming events scheduled.</p>';
        }
        if (pastCount === 0) {
            pastContainer.insertAdjacentHTML('beforeend', '<p style="text-align: center; color: #777; grid-column: 1 / -1;">No past events found.</p>');
        }

        // Control visibility based on state
        pastContainer.style.display = isPastShown ? '' : 'none'; // Use style instead of class for simplicity here
        toggleBtn.textContent = isPastShown ? 'Hide Past Events' : 'Show Past Events';
        toggleBtn.style.display = pastCount > 0 ? 'block' : 'none'; // Show toggle only if past events exist
    };

    const loadEvents = async () => {
        setLoadingState();
        try {
            const response = await fetch(`${API_BASE_URL}/api/events`);
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            allEventsData = await response.json(); // Store fetched data
            if (!Array.isArray(allEventsData)) { throw new Error("Invalid data format received from API."); }
            renderEvents(); // Render based on fetched data
        } catch (error) {
            console.error('Error loading events:', error);
            upcomingContainer.innerHTML = '<p style="text-align: center; color: red; grid-column: 1 / -1;">Could not load events.</p>';
            pastContainer.innerHTML = '';
            toggleBtn.style.display = 'none';
        }
    };

    toggleBtn.addEventListener('click', () => {
        isPastShown = !isPastShown;
        pastContainer.style.display = isPastShown ? '' : 'none';
        toggleBtn.textContent = isPastShown ? 'Hide Past Events' : 'Show Past Events';
    });

    // Initial load
    loadEvents();
});