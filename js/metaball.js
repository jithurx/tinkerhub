// js/metaball.js
/**
 * Lava Lamp Metaball Animation Script
 * Creates a self-moving, fluid-like metaball effect without mouse interaction.
 * Motion is driven by wandering behavior and inter-ball repulsion.
 */
class Metaball {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.className = 'metaball';
        this.velocity = { x: 0, y: 0 };
        this.wanderTheta = Math.random() * Math.PI * 2;
        this.currentScale = 1;
        this.scaleSmoothing = 0.05;
        this.pulseSpeed = Math.random() * 0.01 + 0.005;
        this.reset();
        container.appendChild(this.element);
    }

    reset() {
        const containerHeight = this.container.offsetHeight;
        const containerWidth = this.container.offsetWidth;
        if (!containerHeight || !containerWidth) return; // Avoid division by zero if container not ready
        const baseSize = Math.min(containerHeight, containerWidth) * 0.2;
        this.size = Math.random() * baseSize * 0.8 + baseSize * 0.7;
        this.x = Math.random() * containerWidth;
        this.y = Math.random() * containerHeight;
        this.velocity = { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 };
        const colorThemes = [
            { c1: `hsl(${Math.random() * 20 + 5}, 100%, 65%)`, c2: `hsl(${Math.random() * 20 + 30}, 100%, 55%)` },
            { c1: `hsl(${Math.random() * 40 + 160}, 90%, 55%)`, c2: `hsl(${Math.random() * 40 + 190}, 85%, 60%)` },
            { c1: `hsl(${Math.random() * 40 + 250}, 95%, 65%)`, c2: `hsl(${Math.random() * 40 + 280}, 90%, 60%)` }
        ];
        const selectedTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.background = `radial-gradient(circle at 30% 30%, ${selectedTheme.c1}, ${selectedTheme.c2} 80%, transparent 95%)`;
        this.currentScale = 1;
    }

    update(otherMetaballs, time) {
        let totalForceX = 0, totalForceY = 0;
        const interBallRepulsionRadiusSq = (this.size * 1.8) ** 2;
        const interBallForceConstant = 0.008;

        for (const other of otherMetaballs) {
            if (other === this) continue;
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < interBallRepulsionRadiusSq && distSq > 1) {
                const dist = Math.sqrt(distSq);
                const forceMagnitude = (1 - dist / (this.size * 1.8)) * interBallForceConstant;
                totalForceX += (dx / dist) * forceMagnitude;
                totalForceY += (dy / dist) * forceMagnitude;
            }
        }

        this.wanderTheta += (Math.random() - 0.5) * 0.3;
        const wanderForceMagnitude = 0.02;
        totalForceX += Math.cos(this.wanderTheta) * wanderForceMagnitude;
        totalForceY += Math.sin(this.wanderTheta) * wanderForceMagnitude;

        const centerPullStrength = 0.0001;
        const containerWidth = this.container.offsetWidth || window.innerWidth; // Fallback
        const containerHeight = this.container.offsetHeight || window.innerHeight;
        const dxCenter = (containerWidth / 2) - this.x;
        const dyCenter = (containerHeight / 2) - this.y;
        totalForceX += dxCenter * centerPullStrength;
        totalForceY += dyCenter * centerPullStrength;

        this.velocity.x += totalForceX;
        this.velocity.y += totalForceY;

        const friction = 0.97;
        this.velocity.x *= friction;
        this.velocity.y *= friction;

        const maxSpeed = 1.5;
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * maxSpeed;
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        const buffer = this.size;
        if (this.x < -buffer) this.x = containerWidth + buffer;
        if (this.x > containerWidth + buffer) this.x = -buffer;
        if (this.y < -buffer) this.y = containerHeight + buffer;
        if (this.y > containerHeight + buffer) this.y = -buffer;

        const pulseScale = 1 + Math.sin(time * this.pulseSpeed) * 0.1;
        this.currentScale += (pulseScale - this.currentScale) * this.scaleSmoothing;

        const baseBlur = 40;
        const dynamicBlur = baseBlur + Math.min(speed * 5, 15);

        // Ensure size is valid before applying transform
        if (this.size > 0) {
           this.element.style.transform = `translate(${this.x - this.size / 2}px, ${this.y - this.size / 2}px) scale(${this.currentScale})`;
           this.element.style.filter = `blur(${dynamicBlur}px)`;
           this.element.style.opacity = 0.85;
        }
    }
}

// Initialize animation when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('metaball-container');
    if (!container) {
        // console.warn('Metaball container not found.');
        return; // Don't run if container isn't on the page
    }

    // Ensure container has dimensions before creating metaballs
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn("Metaball container has no dimensions yet. Animation might not start correctly. Ensure CSS is loaded.");
        // Optionally, retry after a short delay or use ResizeObserver
    }

    const width = container.offsetWidth || window.innerWidth; // Use fallback
    const metaballCount = width < 768 ? 6 : 10;
    const metaballs = Array.from({ length: metaballCount }, () => new Metaball(container));
    let time = 0;
    let animationFrameId = null; // Store the animation frame ID

    function animate() {
        time += 0.1;
        metaballs.forEach(metaball => metaball.update(metaballs, time));
        animationFrameId = requestAnimationFrame(animate); // Continue animation
    }

    // Handle window resize
    let resizeTimeout;
    const handleResize = () => {
         // Check if container still exists
        const currentContainer = document.getElementById('metaball-container');
        if (!currentContainer) {
            cancelAnimationFrame(animationFrameId); // Stop animation if container removed
            return;
        }
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log('Resizing metaballs...');
             // Re-check container dimensions on resize
             if (currentContainer.offsetWidth > 0 && currentContainer.offsetHeight > 0) {
                 metaballs.forEach(metaball => metaball.reset());
             } else {
                 console.warn("Container has no dimensions on resize.");
             }
        }, 250);
    };

    window.addEventListener('resize', handleResize);

    // Start animation only if container has dimensions
     if (container.offsetWidth > 0 || container.offsetHeight > 0) {
         animate();
     } else {
         // Optional: Use ResizeObserver to start animation once container is ready
         const resizeObserver = new ResizeObserver(entries => {
             if (entries[0].contentRect.width > 0 && entries[0].contentRect.height > 0) {
                 console.log("Metaball container ready, starting animation.");
                 animate();
                 resizeObserver.unobserve(container); // Stop observing once started
             }
         });
         resizeObserver.observe(container);
     }
});