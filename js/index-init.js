// js/index-init.js - Initialization specific to index.html

// Define the base URL for your API (Only needed here for the ping)
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
const API_BASE_URL = 'YOUR_RENDER_BACKEND_URL_HERE'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
// const API_BASE_URL = 'http://localhost:5000'; // For local testing

// --- Function to Ping Backend (Fire-and-Forget) ---
function pingBackendFireAndForget() {
    if (!API_BASE_URL || API_BASE_URL === 'YOUR_RENDER_BACKEND_URL_HERE') {
         console.warn("API_BASE_URL not set in index-init.js. Skipping backend ping.");
         return;
    }
    const pingUrl = `${API_BASE_URL}/api`; // Use a simple, fast endpoint
    console.log(`Pinging backend (fire-and-forget) from index-init.js at ${pingUrl}...`);
    fetch(pingUrl, { method: 'GET', mode: 'cors', cache: 'no-store' })
        .then(response => {
            console.log(`Backend ping acknowledged with status: ${response.status}`);
        })
        .catch(error => {
            console.warn("Error during background backend ping:", error);
        });
}

// --- Function to Hide Loading Screen ---
function hideLoadingScreen() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        console.log("Hiding loading screen...");
        overlay.classList.add('hidden');
        overlay.addEventListener('transitionend', () => {
            if(overlay.parentNode) overlay.remove();
            console.log("Loading overlay removed from DOM.");
        }, { once: true });
    }
}

// --- Initialization for Index Page Only ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded specific to index.html fired.");

    // --- Loading Screen & Ping Logic ---
    const loadingOverlay = document.getElementById('loading-overlay');
    const firstVisitSessionKey = 'tinkerhub_visited_session';
    const isFirstVisit = typeof(Storage) !== "undefined" && sessionStorage.getItem(firstVisitSessionKey) === null;
    const fixedLoadingTime = 5000; // 5 seconds

    if (isFirstVisit && loadingOverlay) {
        console.log("First visit this session (index-init.js). Showing loading screen and pinging backend.");
        sessionStorage.setItem(firstVisitSessionKey, 'true');
        pingBackendFireAndForget(); // Send the non-blocking ping
        setTimeout(hideLoadingScreen, fixedLoadingTime); // Hide after 5s
    } else if (loadingOverlay) {
        // Not first visit, remove overlay immediately
        console.log("Not first visit (index-init.js). Removing loading overlay.");
        loadingOverlay.remove();
    }
    // --- End Loading Screen Logic ---

    // --- Metaball Initialization (If metaball.js doesn't self-init) ---
    const metaballContainer = document.getElementById('metaball-container');
    if (metaballContainer) {
        console.log("Metaball container found on index page.");
        if (typeof Metaball === 'undefined') {
            console.warn("Metaball class not defined. Ensure metaball.js is loaded AFTER index-init.js or self-initializes.");
        } else {
            // If metaball.js relies on manual initialization, do it here:
            // Example: initMetaballAnimation(metaballContainer);
            // For now, assume it self-initializes. Just force reflow.
             void metaballContainer.offsetWidth;
        }
    }

});

console.log("index-init.js script parsed.");