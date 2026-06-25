// High-performance Custom Glass Cursor and Click Spark Effects
class InteractiveCursor {
  constructor() {
    this.dot = document.getElementById('cursor-dot');
    this.ring = document.getElementById('cursor-ring');
    this.canvas = document.getElementById('spark-canvas');
    if (!this.dot || !this.ring || !this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    
    // Mouse Coordinates
    this.mouseX = 0;
    this.mouseY = 0;
    this.ringX = 0;
    this.ringY = 0;
    
    // Particle arrays for Click Sparks
    this.sparks = [];
    this.maxSparks = 80;
    
    // Palette
    this.colors = [
      '#a855f7', // Purple
      '#6366f1', // Indigo
      '#ec4899', // Pink
      '#38bdf8'  // Sky Blue
    ];

    this.isMobile = false;
    this.checkDevice();
    
    if (!this.isMobile) {
      this.init();
    } else {
      // Clean up/hide custom cursor elements on mobile
      this.dot.style.display = 'none';
      this.ring.style.display = 'none';
    }
  }

  checkDevice() {
    // Check if user is on mobile or touch device
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isSmallScreen = window.innerWidth < 768;
    this.isMobile = hasCoarsePointer || isSmallScreen;
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Show cursor elements once mouse enters the screen
    document.addEventListener('mouseenter', () => {
      this.dot.style.opacity = '1';
      this.ring.style.opacity = '1';
    });

    // Hide cursor elements if mouse leaves screen
    document.addEventListener('mouseleave', () => {
      this.dot.style.opacity = '0';
      this.ring.style.opacity = '0';
    });

    // Tracks mouse movements
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    // Handles Click Trigger
    document.addEventListener('click', (e) => {
      this.createSparks(e.clientX, e.clientY);
      this.triggerClickAnimation();
    });

    // Register hover effects on interactive elements
    this.updateHoverableElements();

    // Start requestAnimationFrame loop
    this.loop();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // Find all hoverable elements and attach mouseenter/mouseleave listeners
  updateHoverableElements() {
    const hoverables = document.querySelectorAll('a, button, .contact-card, .project-card, .tech-card, .education-card, #nav, [role="button"], input, textarea, select');
    
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.dot.classList.add('hovered');
        this.ring.classList.add('hovered');
      });
      el.addEventListener('mouseleave', () => {
        this.dot.classList.remove('hovered');
        this.ring.classList.remove('hovered');
      });
    });
  }

  // Flash ring size briefly when clicked
  triggerClickAnimation() {
    this.ring.classList.add('clicked');
    setTimeout(() => {
      this.ring.classList.remove('clicked');
    }, 150);
  }

  // Spawn spark explosion particles
  createSparks(x, y) {
    const sparkCount = 8 + Math.floor(Math.random() * 6); // 8-13 sparks per click
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.02,
        color: this.colors[Math.floor(Math.random() * this.colors.length)]
      });
    }
  }

  loop() {
    // 1. Snappy Easing for Outer Glass Ring (Highly responsive tracking with minimal lag)
    const easing = 0.32; 
    const dx = this.mouseX - this.ringX;
    const dy = this.mouseY - this.ringY;
    
    this.ringX += dx * easing;
    this.ringY += dy * easing;

    // 2. Calculate movement speed for dynamic uniform scaling
    const speed = Math.sqrt(dx * dx + dy * dy);
    
    // Smooth the speed value to prevent sudden scale jumps
    this.currentSpeed = this.currentSpeed || 0;
    this.currentSpeed += (speed - this.currentSpeed) * 0.15;

    // 3. Determine base scale based on hover/click classes
    let baseScale = 1.0;
    if (this.ring.classList.contains('hovered')) {
      baseScale = 1.25; // elegant hover scale (36px * 1.25 = 45px)
    } else if (this.ring.classList.contains('clicked')) {
      baseScale = 0.75;
    }

    // Expand uniformly as speed increases (remains a perfect circle, no oval shapes)
    const speedScaleFactor = 1 + Math.min(this.currentSpeed / 90, 0.35);
    const finalScale = baseScale * speedScaleFactor;

    // 4. Position custom elements
    this.dot.style.transform = `translate3d(${this.mouseX}px, ${this.mouseY}px, 0) translate(-50%, -50%)`;
    this.ring.style.transform = `translate3d(${this.ringX}px, ${this.ringY}px, 0) translate(-50%, -50%) scale(${finalScale})`;

    // 5. Spawn subtle stardust trail when cursor is in motion
    if (speed > 2.5) {
      this.trailCounter = (this.trailCounter || 0) + 1;
      if (this.trailCounter % 2 === 0) { // spawn every 2 frames for elegance
        this.sparks.push({
          x: this.mouseX,
          y: this.mouseY,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: 1 + Math.random() * 1.5,
          alpha: 0.6,
          decay: 0.03 + Math.random() * 0.02,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          isTrail: true
        });
      }
    }

    // 6. Update and render click sparks & movement trails
    this.updateAndDrawSparks();

    requestAnimationFrame(() => this.loop());
  }

  updateAndDrawSparks() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      
      // Update coordinates
      s.x += s.vx;
      s.y += s.vy;
      
      if (s.isTrail) {
        // Trail particles drift softly without gravity
        s.vx *= 0.98;
        s.vy *= 0.98;
      } else {
        // Click sparks have gravity and drag
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.vy += 0.1; // gravity pull
      }
      
      s.alpha -= s.decay;

      // Clean up dead particles
      if (s.alpha <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }

      // Draw particle as a glowing circle
      this.ctx.save();
      this.ctx.globalAlpha = s.alpha;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = s.color;
      this.ctx.shadowBlur = s.isTrail ? 4 : 10;
      this.ctx.shadowColor = s.color;
      this.ctx.fill();
      this.ctx.restore();
    }
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  // Add dynamic mutation observer to handle dynamically injected elements if needed
  const cursor = new InteractiveCursor();
  
  // Re-register hoverable links when content layout shifts
  const observer = new MutationObserver(() => {
    cursor.updateHoverableElements();
  });
  observer.observe(document.body, { childList: true, subtree: true });
});
