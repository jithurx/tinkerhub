/**
 * TinkerHub Campus Community
 * Main JavaScript file
 */

// App initialization
document.addEventListener('DOMContentLoaded', () => {
  // Menu toggle logic
  initMenuToggle();

  // Metaball animation interaction enhancement
  enhanceMetaballInteraction();

  // Initialize smooth scrolling
  initSmoothScroll();

  // Add page transitions
  initPageTransitions();
});

// Menu toggle with animation considerations
function initMenuToggle() {
  const menuOpen = document.getElementById('menu-open');
  const menuClose = document.getElementById('menu-close');
  const overlay = document.getElementById('menu-overlay');
  const metaballContainer = document.getElementById('metaball-container');

  if (!menuOpen || !menuClose || !overlay) return;

  menuOpen.addEventListener('click', () => {
    // Pause or slow down metaball animation during menu open
    if (metaballContainer) {
      metaballContainer.classList.add('menu-active');
    }
    
    // Add active class with slight delay to allow for animation setup
    setTimeout(() => {
      overlay.classList.add('active');
    }, 10);
  });

  menuClose.addEventListener('click', () => {
    overlay.classList.remove('active');
    
    // Re-energize metaball animation when menu closes after a slight delay
    setTimeout(() => {
      if (metaballContainer) {
        metaballContainer.classList.remove('menu-active');
        // Trigger a subtle "pulse" in the metaballs on menu close
        triggerMetaballPulse();
      }
    }, 300);
  });

  // Close menu when clicking outside of menu content
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      menuClose.click();
    }
  });

  // Add escape key support
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.classList.contains('active')) {
      menuClose.click();
    }
  });
}

// Enhance metaball interaction with page elements
function enhanceMetaballInteraction() {
  const metaballContainer = document.getElementById('metaball-container');
  const heroContent = document.querySelector('.hero-content');
  
  if (!metaballContainer || !heroContent) return;

  // Make hero content interact with metaballs on hover
  heroContent.addEventListener('mouseover', () => {
    metaballContainer.classList.add('content-hover');
  });

  heroContent.addEventListener('mouseout', () => {
    metaballContainer.classList.remove('content-hover');
  });

  // Handle scroll effects for metaballs
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = document.querySelector('.hero').offsetHeight;
    const scrollProgress = Math.min(scrollY / (heroHeight * 0.7), 1);
    
    // Adjust metaball behavior based on scroll position
    if (scrollProgress > 0) {
      metaballContainer.style.opacity = 1 - scrollProgress * 0.7;
      
      // Add parallax effect to metaballs
      const transform = `translateY(${scrollY * 0.2}px)`;
      metaballContainer.style.transform = transform;
    } else {
      metaballContainer.style.opacity = 1;
      metaballContainer.style.transform = 'translateY(0)';
    }
  });
}

// Helper function to trigger a visual pulse in the metaball animation
function triggerMetaballPulse() {
  const metaballContainer = document.getElementById('metaball-container');
  if (!metaballContainer) return;
  
  // Add class to trigger animation
  metaballContainer.classList.add('pulse');
  
  // Remove class after animation completes
  setTimeout(() => {
    metaballContainer.classList.remove('pulse');
  }, 1000);
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      window.scrollTo({
        top: targetElement.offsetTop,
        behavior: 'smooth'
      });
    });
  });
}

// Page transitions for smoother navigation experience
function initPageTransitions() {
  // Only apply to internal links
  document.querySelectorAll('a:not([href^="#"]):not([href^="http"])').forEach(link => {
    link.addEventListener('click', function(e) {
      // Skip processing for modified clicks
      if (e.metaKey || e.ctrlKey) return;
      
      const href = this.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      
      e.preventDefault();
      
      // Add exit animation to current page
      document.body.classList.add('page-transition-exit');
      
      // Navigate after transition
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  });
  
  // Handle page load animation
  window.addEventListener('pageshow', (event) => {
    // Add entrance animation
    document.body.classList.add('page-transition-enter');
    
    // Remove animation classes
    setTimeout(() => {
      document.body.classList.remove('page-transition-enter');
    }, 500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
  }
  // ... other init code from main.js
});