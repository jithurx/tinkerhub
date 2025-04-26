/**
 * TinkerHub Campus Community
 * Main JavaScript file
 */

// --- Helper Function to Ensure Menu is Closed ---
function ensureMenuClosed() {
    const overlay = document.getElementById('menu-overlay');
    if (overlay && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
        console.log("EnsureMenuClosed: Removed active class from menu overlay.");
    }
    // Always ensure body scrolling is enabled on page load/show
    if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
        console.log("EnsureMenuClosed: Restored body scroll.");
    }
}


// --- App initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded event fired."); // Debug log

    // Initial check to ensure menu is closed on fresh load
    ensureMenuClosed();

    // Menu toggle logic setup
    initMenuToggle();

    // Metaball animation (only if container exists)
    const metaballContainer = document.getElementById('metaball-container');
    if (metaballContainer) {
        // Assuming metaball.js self-initializes or you call its init here
        console.log("Metaball container found.");
        // Force reflow for metaball init if needed
        void metaballContainer.offsetWidth;
    }

    // Initialize smooth scrolling
    initSmoothScroll();

    // Add page transitions (consider if this interacts poorly with back button)
    initPageTransitions();

    // Set current year in footer
    setCurrentYear();

    // Update Header/Menu Links based on Login State
    updateAuthVisibility(); // Call the function to set initial visibility

    // Inject Navbar and Footer (Optional Example)
    // loadComponent('navbar', 'components/navbar.html');
    // loadComponent('footer', 'components/footer.html');
});


// --- Handle back/forward navigation state ---
// 'pageshow' event often fires more reliably than DOMContentLoaded on back/forward
window.addEventListener('pageshow', function(event) {
    console.log("pageshow event fired. Persisted:", event.persisted); // Debug log
    // event.persisted is true if page is loaded from back/forward cache (bfcache)
    // We want to ensure menu is closed regardless
    ensureMenuClosed();

     // Also re-check auth state on pageshow, in case login state changed in another tab
     updateAuthVisibility();
});


// --- Core Functions ---

// Updated function to handle visibility of Login/Signup/Profile links
function updateAuthVisibility() {
    console.log("Updating auth visibility..."); // Debug log
    const token = localStorage.getItem('token');
    // Header Links
    const headerLoginLink = document.getElementById('header-login-link');
    const headerSignupLink = document.getElementById('header-signup-link');
    const headerProfileLink = document.getElementById('header-profile-link');
    // Menu Links
    const menuLoginLink = document.getElementById('menu-login-link');
    const menuSignupLink = document.getElementById('menu-signup-link');
    const menuProfileLink = document.getElementById('menu-profile-link');

    if (token) { // User IS logged in
        if (headerLoginLink) headerLoginLink.style.display = 'none';
        if (headerSignupLink) headerSignupLink.style.display = 'none';
        if (headerProfileLink) headerProfileLink.style.display = 'inline-block'; // Use appropriate display

        if (menuLoginLink) menuLoginLink.style.display = 'none';
        if (menuSignupLink) menuSignupLink.style.display = 'none';
        if (menuProfileLink) menuProfileLink.style.display = 'block'; // Menu links are block
    } else { // User IS NOT logged in
        if (headerLoginLink) headerLoginLink.style.display = 'inline-block';
        if (headerSignupLink) headerSignupLink.style.display = 'inline-block';
        if (headerProfileLink) headerProfileLink.style.display = 'none';

        if (menuLoginLink) menuLoginLink.style.display = 'block';
        if (menuSignupLink) menuSignupLink.style.display = 'block';
        if (menuProfileLink) menuProfileLink.style.display = 'none';
    }
     console.log("Auth visibility updated.");
}


function initMenuToggle() {
    // Use function scope to avoid polluting global scope unnecessarily
    const getMenuOpen = () => document.getElementById('menu-open');
    const getMenuClose = () => document.getElementById('menu-close');
    const getOverlay = () => document.getElementById('menu-overlay');

    const attachMenuListeners = () => {
        const openBtn = getMenuOpen();
        const closeBtn = getMenuClose();
        const overlayEl = getOverlay();
        if (!openBtn || !closeBtn || !overlayEl) { return; }

        // --- Define Handlers ---
        const openMenuHandler = () => {
            console.log("Opening menu..."); // Debug
            overlayEl.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        const closeMenuHandler = () => {
            console.log("Closing menu..."); // Debug
            overlayEl.classList.remove('active');
            document.body.style.overflow = '';
        };
        const overlayClickHandler = (event) => { if (event.target === overlayEl) closeMenuHandler(); };
        const escapeKeyListener = (event) => { if (event.key === 'Escape' && overlayEl.classList.contains('active')) closeMenuHandler(); };

        // --- Attach Listeners (Remove previous first to prevent duplicates) ---
        openBtn.removeEventListener('click', openMenuHandler);
        openBtn.addEventListener('click', openMenuHandler);

        closeBtn.removeEventListener('click', closeMenuHandler);
        closeBtn.addEventListener('click', closeMenuHandler);

        overlayEl.removeEventListener('click', overlayClickHandler);
        overlayEl.addEventListener('click', overlayClickHandler);

        // Attach keydown to document, remove previous listener first
        document.removeEventListener('keydown', escapeKeyListener);
        document.addEventListener('keydown', escapeKeyListener);

        console.log("Menu listeners attached."); // Debug
    };

    attachMenuListeners(); // Initial attachment attempt
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId.length > 1 && targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    // Optional: Close menu if open after clicking anchor link
                     const overlay = document.getElementById('menu-overlay');
                     if (overlay && overlay.classList.contains('active')) {
                         const menuClose = document.getElementById('menu-close');
                         if (menuClose) menuClose.click();
                     }
                }
            }
        });
    });
}


function initPageTransitions() {
    const body = document.body;
    // Remove enter class immediately after animation potentially finishes
    // Use animationend event if you have a specific animation defined
    // setTimeout(() => body.classList.remove('page-transition-enter'), 500); // Based on CSS duration

    // Apply exit state when navigating away via links
     document.addEventListener('click', (event) => {
        const link = event.target.closest('a');
         // Check if it's a valid internal navigation link (not target blank, not just hash)
        if (link && link.href && link.target !== '_blank' && !link.getAttribute('href').startsWith('#') && link.hostname === window.location.hostname) {
             event.preventDefault();
             console.log("Internal link clicked, applying exit transition..."); // Debug
             body.classList.add('page-transition-exit');
             setTimeout(() => { window.location.href = link.href; }, 300); // Match CSS duration
        }
    });

     // Handle browser back/forward - 'pageshow' helps reset state
     window.addEventListener('pageshow', function(event) {
        // Remove exit class if user navigated back
        body.classList.remove('page-transition-exit');
        // Re-apply enter animation logic if needed, especially from bfcache
         if (event.persisted) { // Page loaded from back/forward cache
             console.log("Page loaded from bfcache, resetting transition state.");
             body.classList.remove('page-transition-enter'); // Ensure it's removed
             body.style.animation = 'none'; // Temporarily disable animation
             requestAnimationFrame(() => { // Force reflow
                 body.style.animation = ''; // Re-enable animation
                 body.classList.add('page-transition-enter');
                 requestAnimationFrame(() => {
                     body.classList.remove('page-transition-enter');
                 });
             });
         }
    });

      // Fallback for beforeunload (less reliable for transitions)
     window.addEventListener('beforeunload', () => {
         // Don't add exit class here as pageshow handles back better
         // body.classList.add('page-transition-exit');
     });
}

function setCurrentYear() {
    const setYear = () => {
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    };
    setYear(); // Attempt on initial load
    // If using dynamic footer loading, call setYear() again after component is loaded
}


// --- Optional: Navbar/Footer Injection Helper ---
async function loadComponent(id, url) { /* ... keep implementation ... */ }


// --- Add console logs for debugging ---
console.log("main.js loaded");