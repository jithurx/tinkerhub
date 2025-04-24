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

        // Physics properties
        this.velocity = { x: 0, y: 0 };
        this.wanderTheta = Math.random() * Math.PI * 2; // Initial random direction

        // Appearance
        this.currentScale = 1;
        this.scaleSmoothing = 0.05; // Smoother scaling for pulsing effect
        this.pulseSpeed = Math.random() * 0.01 + 0.005; // Random pulse speed per ball

        this.reset(); // Set initial size, position, color
        container.appendChild(this.element);
    }

    reset() {
        const containerHeight = this.container.offsetHeight;
        const containerWidth = this.container.offsetWidth;
        const baseSize = Math.min(containerHeight, containerWidth) * 0.2; // Slightly larger base for lava lamp feel

        this.size = Math.random() * baseSize * 0.8 + baseSize * 0.7; // Size variation
        this.x = Math.random() * containerWidth;
        this.y = Math.random() * containerHeight;
        this.velocity = { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 }; // Slow initial drift

        // Color themes - fewer, more lava-lamp like options
        const colorThemes = [
            // Warm Lava
            { c1: `hsl(${Math.random() * 20 + 5}, 100%, 65%)`, c2: `hsl(${Math.random() * 20 + 30}, 100%, 55%)` },
            // Cool Blue/Green Goo
            { c1: `hsl(${Math.random() * 40 + 160}, 90%, 55%)`, c2: `hsl(${Math.random() * 40 + 190}, 85%, 60%)` },
            // Purple Haze
             { c1: `hsl(${Math.random() * 40 + 250}, 95%, 65%)`, c2: `hsl(${Math.random() * 40 + 280}, 90%, 60%)` }
        ];
        const selectedTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];

        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.background =
            `radial-gradient(circle at 30% 30%, ${selectedTheme.c1}, ${selectedTheme.c2} 80%, transparent 95%)`;
        this.currentScale = 1;
    }

    update(otherMetaballs, time) {
        // --- Forces ---
        let totalForceX = 0;
        let totalForceY = 0;

        // 1. Inter-ball Repulsion Force (Keep this for interaction)
        const interBallRepulsionRadiusSq = (this.size * 1.8) ** 2; // Increase interaction radius slightly
        const interBallForceConstant = 0.008; // Gentle repulsion

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

        // 2. Wandering Force (Continuous autonomous movement)
        this.wanderTheta += (Math.random() - 0.5) * 0.3; // Gradually change direction
        const wanderForceMagnitude = 0.02; // Controls speed of wandering
        totalForceX += Math.cos(this.wanderTheta) * wanderForceMagnitude;
        totalForceY += Math.sin(this.wanderTheta) * wanderForceMagnitude;

        // 3. Gentle Center Pull (Optional: prevents drifting away)
        const centerPullStrength = 0.0001; // Very weak
        const dxCenter = (this.container.offsetWidth / 2) - this.x;
        const dyCenter = (this.container.offsetHeight / 2) - this.y;
        totalForceX += dxCenter * centerPullStrength;
        totalForceY += dyCenter * centerPullStrength;

        // --- Update Velocity ---
        this.velocity.x += totalForceX;
        this.velocity.y += totalForceY;

        // Apply Friction/Damping
        const friction = 0.97; // Slightly higher friction for slower feel
        this.velocity.x *= friction;
        this.velocity.y *= friction;

        // Clamp Velocity (Lower max speed for lava lamp)
        const maxSpeed = 1.5;
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * maxSpeed;
        }

        // --- Update Position ---
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // --- Boundary Wrapping ---
        const buffer = this.size; // Larger buffer for smoother wrapping
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;

        if (this.x < -buffer) this.x = containerWidth + buffer;
        if (this.x > containerWidth + buffer) this.x = -buffer;
        if (this.y < -buffer) this.y = containerHeight + buffer;
        if (this.y > containerHeight + buffer) this.y = -buffer;

        // --- Update Appearance ---
        // Subtle pulsing scale effect
        const pulseScale = 1 + Math.sin(time * this.pulseSpeed) * 0.1; // Slow sine wave pulse (10% variation)
        this.currentScale += (pulseScale - this.currentScale) * this.scaleSmoothing;

        // Dynamic blur based on velocity (Less variation needed now)
        const baseBlur = 40; // Higher base blur for goo effect
        const dynamicBlur = baseBlur + Math.min(speed * 5, 15); // Less sensitive blur change

        // Apply CSS Transforms and Filters
        this.element.style.transform = `translate(${this.x - this.size / 2}px, ${this.y - this.size / 2}px) scale(${this.currentScale})`;
        this.element.style.filter = `blur(${dynamicBlur}px)`;
        this.element.style.opacity = 0.85; // More consistent opacity
    }
}

// Initialize animation when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('metaball-container');
    if (!container) {
        console.warn('Metaball container not found.');
        return;
    }

    // Fewer balls generally work better for lava lamp effect
    const width = container.offsetWidth;
    const metaballCount = width < 768 ? 6 : 10;
    const metaballs = Array.from({ length: metaballCount }, () => new Metaball(container));

    let time = 0;

    // Animation loop
    function animate() {
        time += 0.1; // Increment time for pulsing

        // Update all metaballs, passing the list for inter-ball checks
        metaballs.forEach(metaball => metaball.update(metaballs, time));

        requestAnimationFrame(animate);
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            metaballs.forEach(metaball => metaball.reset());
        }, 250);
    });

    // Start animation
    animate();
});