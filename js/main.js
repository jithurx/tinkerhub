/**
 * TinkerHub Campus Community
 * Main JavaScript file
 * - Handles dynamic component loading (Navbar, Footer)
 * - Manages menu toggle state & button visibility (Menu vs Home)
 * - Manages login/signup/profile link visibility
 * - Initializes smooth scroll & page transitions
 * - Sets current year in footer
 */

// --- API Base URL (Needed for ping) ---
const API_BASE_URL = 'https://tinkerhub-0pse.onrender.com';
// const API_BASE_URL = 'http://localhost:5000'; // For local testing

// --- Helper Function to Ensure Menu is Closed on Load/Show ---
function ensureMenuClosed() {
    const overlay = document.getElementById('menu-overlay');
    if (overlay && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        console.log("EnsureMenuClosed: Removed .active from menu overlay.");
    }
    // Always ensure body scrolling is enabled
    if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
        console.log("EnsureMenuClosed: Restored body scroll.");
    }
}

// --- Helper Function to Inject HTML Components ---
async function loadComponent(id, url) {
   const target = document.getElementById(id);
   if (!target) {
       console.warn(`Target element with ID '${id}' not found for component loading.`);
       return false; // Indicate failure
    }
   console.log(`Loading component ${id} from ${url}...`);
   try {
       const response = await fetch(url); // Fetch the component's HTML file
       if (response.ok) {
           target.innerHTML = await response.text(); // Inject the HTML
           console.log(`Component '${id}' loaded successfully.`);
           return true; // Indicate success
       } else {
           console.error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
           target.innerHTML = `<p style="color:red; text-align:center; padding: 1rem;">Error loading component ${id}.</p>`;
           return false;
        }
   } catch (error) {
       console.error(`Error fetching ${url}:`, error);
       target.innerHTML = `<p style="color:red; text-align:center;">Error loading component ${id}.</p>`;
       return false;
   }
}

// --- Helper Function to Update Login/Signup/Profile Link Visibility ---
function updateAuthVisibility() {
    console.log("Updating auth visibility...");
    const token = localStorage.getItem('token');
    // Header Links
    const headerLoginLink = document.getElementById('header-login-link');
    const headerSignupLink = document.getElementById('header-signup-link');
    const headerProfileLink = document.getElementById('header-profile-link');
    // Menu Links
    const menuLoginLink = document.getElementById('menu-login-link');
    const menuSignupLink = document.getElementById('menu-signup-link');
    const menuProfileLink = document.getElementById('menu-profile-link');

    // Determine display style based on token presence
    const loggedInDisplay = token ? 'inline-block' : 'none'; // Header uses inline-block for buttons
    const loggedOutDisplay = token ? 'none' : 'inline-block';
    const menuLoggedInDisplay = token ? 'block' : 'none'; // Menu uses block for links
    const menuLoggedOutDisplay = token ? 'none' : 'block';

    // Apply styles only if elements exist (important after dynamic load)
    if(headerProfileLink) headerProfileLink.style.display = loggedInDisplay;
    if(headerLoginLink) headerLoginLink.style.display = loggedOutDisplay;
    if(headerSignupLink) headerSignupLink.style.display = loggedOutDisplay;

    if(menuProfileLink) menuProfileLink.style.display = menuLoggedInDisplay;
    if(menuLoginLink) menuLoginLink.style.display = menuLoggedOutDisplay;
    if(menuSignupLink) menuSignupLink.style.display = menuLoggedOutDisplay;

    console.log("Auth visibility updated.");
}

// --- Helper Function to Set Header Button State (Menu vs Home) ---
function updateHeaderButton() {
    const menuOpenBtn = document.getElementById('menu-open');
    const homeLinkBtn = document.getElementById('header-home-link');
    // Check if BOTH buttons actually exist in the DOM first
    if (!menuOpenBtn || !homeLinkBtn) {
         console.warn("Could not find menu-open or header-home-link button during updateHeaderButton.");
         return; // Exit if elements aren't loaded yet
    }

    const currentPath = window.location.pathname;
    // More robust check for homepage (handles potential repo names in GitHub Pages paths)
    const pathSegments = currentPath.split('/').filter(segment => segment); // Get non-empty path segments
    const lastSegment = pathSegments[pathSegments.length - 1];
    const isHomepage = pathSegments.length === 0 || lastSegment === 'index.html' || (pathSegments.length === 1 && window.location.origin.includes('github.io')); // Crude check for repo root on GH Pages

    console.log(`Updating header button. Path: ${currentPath}, Is Homepage: ${isHomepage}`); // Debug

    if (isHomepage) {
        menuOpenBtn.style.display = 'inline-block'; // Or 'flex' if needed by styling
        homeLinkBtn.style.display = 'none';
    } else {
        menuOpenBtn.style.display = 'none';
        homeLinkBtn.style.display = 'inline-block'; // Or 'flex'
    }
}

// --- Helper Function to Set Current Year ---
function setCurrentYear() {
    const setYear = () => {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    };
    setYear(); // Attempt on initial run and subsequent calls
}


// --- Core Functions (Menu, Scroll, Transitions) ---

function initMenuToggle() {
    const getMenuOpen = () => document.getElementById('menu-open');
    const getMenuClose = () => document.getElementById('menu-close');
    const getOverlay = () => document.getElementById('menu-overlay');

    // Define handlers once
    const openMenuHandler = () => {
        const overlayEl = getOverlay();
        if (overlayEl) {
            console.log("Opening menu...");
            overlayEl.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else { console.warn("Could not find overlay to open."); }
    };
    const closeMenuHandler = () => {
        const overlayEl = getOverlay();
        if (overlayEl) {
            console.log("Closing menu...");
            overlayEl.classList.remove('active');
            document.body.style.overflow = '';
        } else { console.warn("Could not find overlay to close."); }
    };
    const overlayClickHandler = (event) => { if (event.target === getOverlay()) closeMenuHandler(); };
    const escapeKeyListener = (event) => {
        const overlayEl = getOverlay();
        if (event.key === 'Escape' && overlayEl && overlayEl.classList.contains('active')) closeMenuHandler();
    };

    // Function to attach listeners, checking element existence
    const attachMenuListeners = () => {
        const openBtn = getMenuOpen();
        const closeBtn = getMenuClose(); // Close button is inside overlay
        const overlayEl = getOverlay();

        if (!overlayEl) { console.error("Menu overlay element not found! Cannot attach listeners."); return; }

        // Attach to overlay first
        overlayEl.removeEventListener('click', overlayClickHandler); // Prevent duplicates
        overlayEl.addEventListener('click', overlayClickHandler);
        if(closeBtn) {
             closeBtn.removeEventListener('click', closeMenuHandler);
             closeBtn.addEventListener('click', closeMenuHandler);
        } else { console.warn("Menu close button not found inside overlay."); }

        // Attach to open button (might be loaded dynamically)
        if (openBtn) {
             openBtn.removeEventListener('click', openMenuHandler);
             openBtn.addEventListener('click', openMenuHandler);
             console.log("Menu open listener attached.");
        } else { console.warn("Menu open button not found yet. Listener not attached."); }

        // Attach keydown listener to document
        document.removeEventListener('keydown', escapeKeyListener);
        document.addEventListener('keydown', escapeKeyListener);
    };

    attachMenuListeners(); // Attempt initial attachment
}


function initSmoothScroll() {
    // Use event delegation on the body
    document.body.addEventListener('click', function (e) {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            const targetId = link.getAttribute('href');
            if (targetId.length > 1) {
                try {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                        // Close menu if open after clicking anchor link
                         const overlay = document.getElementById('menu-overlay');
                         if (overlay && overlay.classList.contains('active')) {
                             const menuClose = document.getElementById('menu-close');
                             if (menuClose) menuClose.click();
                         }
                    } else { console.warn(`Smooth scroll target '${targetId}' not found.`); }
                } catch (error) { console.error(`Error finding smooth scroll target '${targetId}':`, error); }
            }
        }
    });
}


function initPageTransitions() {
    const body = document.body;

    // Apply exit state when navigating away via internal links
     document.body.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        // Check if it's a valid internal navigation link
        if (link && link.href && link.target !== '_blank' && !link.getAttribute('href').startsWith('#') && link.hostname === window.location.hostname) {
             if (link.pathname !== window.location.pathname || link.search !== window.location.search) {
                  event.preventDefault();
                  console.log("Internal link clicked, applying exit transition...");
                  body.classList.add('page-transition-exit');
                  setTimeout(() => { window.location.href = link.href; }, 300); // Match CSS
             }
        }
    });

     // Handle browser back/forward and initial load animation state
     const handlePageShow = (event) => {
         body.classList.remove('page-transition-exit');
         body.classList.remove('page-transition-enter');
         body.style.animation = 'none';
         requestAnimationFrame(() => {
             body.style.animation = '';
             body.classList.add('page-transition-enter');
             // Remove class after animation to prevent re-triggering on style change
             setTimeout(() => { body.classList.remove('page-transition-enter'); }, 500); // Match CSS duration
         });
         console.log("Page show handled, transition state reset.");
     };

     window.addEventListener('pageshow', handlePageShow);

     // Call once on initial load to trigger entry animation
     // Ensure this runs *after* DOMContentLoaded potentially
     // setTimeout(() => handlePageShow({persisted: false}), 0);
     // Or rely on the initial CSS animation defined on body
}


// --- **NEW** Function to Ping Backend ---
async function pingBackend() {
    // Use a simple, lightweight endpoint like the API root or a dedicated /ping route
    const pingUrl = `${API_BASE_URL}/api`; // Or use `${API_BASE_URL}/` if your root returns something
    console.log(`Pinging backend at ${pingUrl}...`);
    try {
        // Send a simple GET request. We don't really care about the response,
        // just making the request to wake up the Render instance.
        // Add a timeout in case the backend takes *very* long to respond initially
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for ping

        const response = await fetch(pingUrl, { signal: controller.signal });
        clearTimeout(timeoutId); // Clear timeout if fetch completed

        if (!response.ok) {
            // Log error but don't block page load
            console.warn(`Backend ping failed: ${response.status} ${response.statusText}`);
        } else {
            console.log("Backend ping successful.");
        }
    } catch (error) {
         if (error.name === 'AbortError') {
             console.warn("Backend ping timed out (15s). Instance might still be waking up.");
         } else {
            // Log other fetch errors but don't block page load
            console.warn("Error during backend ping:", error);
         }
    }
}

// --- **NEW** Function to Hide Loading Screen ---
function hideLoadingScreen() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        console.log("Hiding loading screen...");
        overlay.classList.add('hidden');
        // Optional: Add class to body to fade in main content
        // document.body.classList.add('loaded');
        // Remove overlay from DOM after transition for better performance/accessibility
        setTimeout(() => {
            overlay.remove();
             console.log("Loading overlay removed from DOM.");
        }, 900); // Should be slightly longer than CSS transition (0.8s)
    }
}


// --- App Initialization on DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOMContentLoaded event fired.");

    // --- ** START: Loading Screen & Ping Logic ** ---
    const minimumLoadingTime = 1500; // Show loading screen for at least 1.5 seconds
    const startTime = Date.now();

    // Send the wake-up ping request (don't await it here, let it run in background)
    const pingPromise = pingBackend();

    // --- Load Components ---
    // Wait for both components to finish attempting to load
    await Promise.all([
        loadComponent('navbar', 'components/navbar.html'),
        loadComponent('footer', 'components/footer.html')
    ]);
    console.log("Components loading attempted.");

    // --- Run initializations AFTER components are loaded/attempted ---
    // These functions should ideally check for element existence internally

    ensureMenuClosed();     // Reset menu state visually
    initMenuToggle();       // Attach menu button listeners
    initSmoothScroll();     // Setup smooth scrolling
    // initPageTransitions();  // Delay this until loading screen is gone
    setCurrentYear();       // Set footer year
    updateAuthVisibility(); // Set initial Login/Signup/Profile visibility
    updateHeaderButton();   // Set initial Menu/Home button visibility

    // Metaball specific logic
    const metaballContainer = document.getElementById('metaball-container');
    if (metaballContainer) {
        console.log("Metaball container found.");
        if (typeof Metaball === 'undefined') {
            console.warn("Metaball class not defined. Ensure metaball.js is loaded.");
        } else {
             // Assuming metaball.js self-initializes correctly via its own listener
             void metaballContainer.offsetWidth; // Force reflow
        }
    }

    // --- ** END: Loading Screen Hiding Logic ** ---
    // Calculate how much time has passed
    const elapsedTime = Date.now() - startTime;
    const remainingTime = minimumLoadingTime - elapsedTime;

    // Wait for the ping OR the minimum display time, whichever is longer
    Promise.all([pingPromise, new Promise(resolve => setTimeout(resolve, remainingTime > 0 ? remainingTime : 0))])
        .then(() => {
            hideLoadingScreen();
            // Initialize things that might depend on correct layout AFTER loading screen is gone
             initPageTransitions(); // Start page transitions now
        });

    console.log("Initial page setup sequence started.");
}); // End DOMContentLoaded Listener


// --- Handle back/forward navigation state (pageshow) ---
// This runs *in addition* to DOMContentLoaded, especially important for bfcache hits
window.addEventListener('pageshow', function(event) {
    console.log("pageshow event fired. Persisted:", event.persisted);

    // Re-run essential state updates on page show
    ensureMenuClosed();
    updateAuthVisibility(); // Ensure correct buttons show if login changed
    updateHeaderButton(); // Ensure correct Menu/Home button shows
    setCurrentYear(); // Update year just in case footer was cached

    // Reset page transition state if loading from cache
    if (event.persisted) {
        const body = document.body;
        body.classList.remove('page-transition-exit', 'page-transition-enter');
        body.style.animation = 'none';
        requestAnimationFrame(() => { // Trigger reflow before re-applying animation
            body.style.animation = '';
             // Re-apply entry animation if desired from bfcache
             // body.classList.add('page-transition-enter');
             // setTimeout(() => { body.classList.remove('page-transition-enter'); }, 500);
        });
         console.log("Page transition state reset for bfcache load.");
    }
});


// --- Final Log ---
console.log("main.js script parsed.");