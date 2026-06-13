// 3D Card Tilt and Radial Glow Interaction
class Cards3D {
  constructor() {
    this.cards = document.querySelectorAll('.tilt-card');
    this.maxTilt = 12; // Maximum tilt angle in degrees
    this.init();
  }

  init() {
    this.cards.forEach(card => {
      // Create glare/glow layer dynamically
      const glare = document.createElement('div');
      glare.classList.add('card-glare');
      glare.style.position = 'absolute';
      glare.style.top = '0';
      glare.style.left = '0';
      glare.style.width = '100%';
      glare.style.height = '100%';
      glare.style.pointerEvents = 'none';
      glare.style.borderRadius = 'inherit';
      glare.style.zIndex = '1';
      glare.style.background = 'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%)';
      glare.style.transition = 'opacity 0.5s ease';
      glare.style.opacity = '0';
      card.appendChild(glare);

      // Make sure cards preserve 3D
      card.style.transformStyle = 'preserve-3d';
      card.style.perspective = '1000px';

      // Attach event listeners
      card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card, glare));
      card.addEventListener('mouseenter', () => this.handleMouseEnter(card, glare));
      card.addEventListener('mouseleave', () => this.handleMouseLeave(card, glare));
    });
  }

  handleMouseMove(event, card, glare) {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left; // Mouse x relative to card
    const y = event.clientY - rect.top;  // Mouse y relative to card

    // Find normalized coordinate coordinates from -0.5 to 0.5
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;

    // Calculate rotation angles
    const tiltX = -normY * this.maxTilt; // Rotate around X axis for vertical movement
    const tiltY = normX * this.maxTilt;  // Rotate around Y axis for horizontal movement

    // Apply transform on card
    card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;

    // Apply glare shift
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 60%)`;

    // Apply parallax offset to nested 3D elements inside card
    const parallaxElements = card.querySelectorAll('.parallax-depth');
    parallaxElements.forEach(el => {
      const depth = parseFloat(el.getAttribute('data-depth')) || 25;
      const transX = normX * depth;
      const transY = normY * depth;
      el.style.transform = `translate3d(${transX}px, ${transY}px, ${depth}px)`;
    });
  }

  handleMouseEnter(card, glare) {
    glare.style.opacity = '1';
    card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
    
    const parallaxElements = card.querySelectorAll('.parallax-depth');
    parallaxElements.forEach(el => {
      el.style.transition = 'transform 0.1s ease';
    });
  }

  handleMouseLeave(card, glare) {
    glare.style.opacity = '0';
    // Smooth transition back to neutral state
    card.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease';
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

    const parallaxElements = card.querySelectorAll('.parallax-depth');
    parallaxElements.forEach(el => {
      el.style.transition = 'transform 0.5s ease';
      el.style.transform = 'translate3d(0px, 0px, 0px)';
    });
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  new Cards3D();
});
