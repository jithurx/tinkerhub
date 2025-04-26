/**
 * TinkerHub Campus Community
 * Main JavaScript file
 */

// App initialization
document.addEventListener('DOMContentLoaded', () => {
  // Menu toggle logic
  initMenuToggle();

  // Metaball animation (assumes metaball.js self-initializes)
  // Check if container exists before assuming metaball.js logic runs
  if (document.getElementById('metaball-container')) {
      // Force reflow for metaball init if needed (good practice)
      void document.getElementById('metaball-container').offsetWidth;
  }

  // Initialize smooth scrolling for internal links
  initSmoothScroll();

  // Add basic page transitions
  initPageTransitions();

  // Set current year in footer
  setCurrentYear();

  // Optional: Inject Navbar and Footer dynamically
  // loadComponent('navbar', 'components/navbar.html');
  // loadComponent('footer', 'components/footer.html');
});

// --- Core Functions ---

function initMenuToggle() {
  const menuOpen = document.getElementById('menu-open');
  const menuClose = document.getElementById('menu-close');
  const overlay = document.getElementById('menu-overlay');

  // Try finding buttons inside potential dynamically loaded navbar
  const getMenuOpen = () => document.getElementById('menu-open');
  const getMenuClose = () => document.getElementById('menu-close');
  const getOverlay = () => document.getElementById('menu-overlay');

  // Function to attach listeners
  const attachMenuListeners = () => {
      const openBtn = getMenuOpen();
      const closeBtn = getMenuClose();
      const overlayEl = getOverlay();

      if (!openBtn || !closeBtn || !overlayEl) {
          // console.warn("Menu elements not found yet, retrying...");
          // setTimeout(attachMenuListeners, 200); // Retry if loaded async
          return; // Exit if not found after initial load
      }

      openBtn.removeEventListener('click', openMenuHandler); // Remove previous listener if any
      openBtn.addEventListener('click', openMenuHandler);

      closeBtn.removeEventListener('click', closeMenuHandler); // Remove previous listener
      closeBtn.addEventListener('click', closeMenuHandler);

      overlayEl.removeEventListener('click', overlayClickHandler); // Remove previous listener
      overlayEl.addEventListener('click', overlayClickHandler);
  };

  // Event Handlers (defined once)
  const openMenuHandler = () => {
      const overlayEl = getOverlay();
      if (overlayEl) {
          overlayEl.classList.add('active');
          document.body.style.overflow = 'hidden'; // Prevent body scroll
      }
  };

  const closeMenuHandler = () => {
      const overlayEl = getOverlay();
      if (overlayEl) {
          overlayEl.classList.remove('active');
          document.body.style.overflow = ''; // Restore body scroll
      }
  };

  const overlayClickHandler = (event) => {
      if (event.target === getOverlay()) { closeMenuHandler(); }
  };

  // Initial attachment
  attachMenuListeners();

  // Global key listener
  document.removeEventListener('keydown', escapeKeyListener); // Remove previous if any
  document.addEventListener('keydown', escapeKeyListener);
}

// Use a named function for the key listener to allow removal
const escapeKeyListener = (event) => {
  const overlay = document.getElementById('menu-overlay'); // Get overlay element directly
  if (event.key === 'Escape' && overlay && overlay.classList.contains('active')) {
      const menuClose = document.getElementById('menu-close');
      if (menuClose) menuClose.click(); // Trigger the close handler
  }
};


function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          const targetId = this.getAttribute('href');
          // Ensure it's just an ID fragment and the element exists
          if (targetId.length > 1 && targetId.startsWith('#')) {
              const targetElement = document.querySelector(targetId);
              if (targetElement) {
                  e.preventDefault(); // Prevent default jump
                  targetElement.scrollIntoView({
                      behavior: 'smooth'
                  });
              }
          }
      });
  });
}

function initPageTransitions() {
  const body = document.body;

  // Apply enter state on load
  body.classList.add('page-transition-enter');
  requestAnimationFrame(() => { // Ensure style is applied before removing class
       body.classList.remove('page-transition-enter');
  });


  // Apply exit state when navigating away
  window.addEventListener('beforeunload', () => {
      body.classList.add('page-transition-exit');
  });

   // Handle internal link clicks for smoother perceived transition
   document.addEventListener('click', (event) => {
      // Check if the clicked element is a link or inside a link
      const link = event.target.closest('a');
      if (link && link.href && link.target !== '_blank' && link.href.startsWith(window.location.origin) && !link.href.includes('#')) {
           // Check if it's an internal navigation link (not just hash)
           if (link.pathname !== window.location.pathname || link.search !== window.location.search) {
                event.preventDefault(); // Prevent immediate navigation
                body.classList.add('page-transition-exit');
                // Wait for animation then navigate
                setTimeout(() => {
                    window.location.href = link.href;
                }, 300); // Match transition duration in CSS
           }
      }
  });
}


function setCurrentYear() {
  // Function to actually set the year
  const setYear = () => {
      const yearSpan = document.getElementById('current-year');
      if (yearSpan) {
          yearSpan.textContent = new Date().getFullYear();
      } else {
          // console.warn("Footer year span ('current-year') not found.");
      }
  };

  // Initial setting attempt
  setYear();

  // Re-run if footer might be loaded dynamically (example)
  // const observer = new MutationObserver((mutationsList, observer) => {
  //     for(const mutation of mutationsList) {
  //         if (mutation.type === 'childList') {
  //             if (document.getElementById('current-year')) {
  //                 setYear();
  //                 observer.disconnect(); // Stop observing once found
  //                 return;
  //             }
  //         }
  //     }
  // });
  // const footerElement = document.getElementById('footer');
  // if (footerElement) {
  //      observer.observe(footerElement, { childList: true, subtree: true });
  // }
}

// --- Optional: Navbar/Footer Injection Helper ---
async function loadComponent(id, url) {
 const target = document.getElementById(id);
 if (!target) {
     console.warn(`Target element with ID '${id}' not found for component loading.`);
     return;
  }
 try {
     const response = await fetch(url);
     if (response.ok) {
         target.innerHTML = await response.text();
         console.log(`Component '${id}' loaded from ${url}`);
         // Re-initialize dependent scripts AFTER content is loaded
         if (id === 'navbar') { initMenuToggle(); }
         if (id === 'footer') { setCurrentYear(); }
     } else {
         console.error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
         target.innerHTML = `<p style="color:red;">Error loading component ${id}.</p>`;
      }
 } catch (error) {
     console.error(`Error fetching ${url}:`, error);
     target.innerHTML = `<p style="color:red;">Error loading component ${id}.</p>`;
 }
}