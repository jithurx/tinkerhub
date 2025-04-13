/**
 * Metaball Animation Script
 * Creates interactive fluid-like metaballs in the hero section background
 */
class Metaball {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = 'metaball';
        this.reset();
        container.appendChild(this.element);
        
        // Physics properties
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
        };
        this.friction = 0.98;
        this.spring = 0.01;
    }

    reset() {
        // Adjust size based on container dimensions
        const containerHeight = this.container.offsetHeight;
        const containerWidth = this.container.offsetWidth;
        const sizeRatio = Math.min(containerHeight, containerWidth) * 0.25;
        this.size = Math.random() * sizeRatio + sizeRatio * 0.8;
        
        this.x = Math.random() * containerWidth;
        this.y = Math.random() * containerHeight;
        this.targetScale = 1;
        
        // Color themes with more variety
        const colorTheme = Math.floor(Math.random() * 3); // 0, 1, or 2
        
        let color1, color2;
        
        switch(colorTheme) {
            case 0: // Lava/orange theme
                color1 = `hsl(${Math.random() * 30 + 5}, 100%, 50%)`;
                color2 = `hsl(${Math.random() * 30 + 15}, 100%, 60%)`;
                break;
            case 1: // Green theme
                color1 = `hsl(${Math.random() * 40 + 120}, 100%, 50%)`;
                color2 = `hsl(${Math.random() * 40 + 130}, 90%, 60%)`;
                break;
            case 2: // Blue theme
                color1 = `hsl(${Math.random() * 40 + 200}, 100%, 50%)`;
                color2 = `hsl(${Math.random() * 40 + 210}, 90%, 60%)`;
                break;
        }

        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.background = 
            `radial-gradient(circle at 30% 30%, ${color1}, ${color2} 70%, transparent 85%)`;
    }

    update(mouse) {
        // Fluid dynamics
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = Math.min(5000 / (distance * distance), 50);
        
        // Interaction radius proportional to container size
        const interactionRadius = Math.min(this.container.offsetWidth, this.container.offsetHeight) * 0.4;

        if (distance < interactionRadius) {
            this.velocity.x += (dx / distance) * force * this.spring;
            this.velocity.y += (dy / distance) * force * this.spring;
            this.targetScale = 1.2;
        } else {
            this.targetScale = 1;
        }

        // Apply physics
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Container bounds
        const maxX = this.container.offsetWidth + this.size;
        const maxY = this.container.offsetHeight + this.size;
        
        if (this.x < -this.size) this.x = maxX;
        if (this.x > maxX) this.x = -this.size;
        if (this.y < -this.size) this.y = maxY;
        if (this.y > maxY) this.y = -this.size;

        // Apply transforms
        this.element.style.transform = `
            translate(${this.x}px, ${this.y}px)
            scale(${this.targetScale})
        `;
        
        // Dynamic blur based on velocity
        const velocityMagnitude = Math.abs(this.velocity.x) + Math.abs(this.velocity.y);
        this.element.style.filter = `blur(${40 + velocityMagnitude * 2}px)`;
    }
}

// Initialize animation when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('metaball-container');
    
    // Only initialize if container exists
    if (!container) return;
    
    // Number of metaballs based on screen size
    const width = window.innerWidth;
    const metaballCount = width < 768 ? 10 : 20; // Fewer on mobile
    
    const metaballs = Array.from({ length: metaballCount }, () => new Metaball(container));
    
    // Initialize mouse position to center of container
    const mouse = { 
        x: container.offsetWidth / 2, 
        y: container.offsetHeight / 2 
    };

    // Mouse interaction
    container.parentElement.addEventListener('mousemove', (e) => {
        // Get position relative to container
        const rect = container.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    // Touch interaction
    container.parentElement.addEventListener('touchmove', (e) => {
        e.preventDefault(); // Prevent scrolling while touching
        const rect = container.getBoundingClientRect();
        mouse.x = e.touches[0].clientX - rect.left;
        mouse.y = e.touches[0].clientY - rect.top;
    }, { passive: false });

    // Automatic movement when no interaction
    let idleTimer = 0;
    const idleInterval = setInterval(() => {
        idleTimer++;
        
        // After 3 seconds of no interaction, move mouse position randomly
        if (idleTimer > 300) {
            mouse.x = Math.random() * container.offsetWidth;
            mouse.y = Math.random() * container.offsetHeight;
            idleTimer = 0;
        }
    }, 10);

    // Reset idle timer on interaction
    ['mousemove', 'touchmove'].forEach(event => {
        container.parentElement.addEventListener(event, () => {
            idleTimer = 0;
        });
    });

    // Animation loop
    function animate() {
        metaballs.forEach(metaball => metaball.update(mouse));
        requestAnimationFrame(animate);
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        // Debounce resize event
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            metaballs.forEach(metaball => metaball.reset());
        }, 250);
    });

    // Start animation
    animate();
});