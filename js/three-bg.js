// Three.js Interactive Background Particle Constellation
class ThreeBackground {
  constructor() {
    this.container = document.getElementById('three-canvas');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = null;
    this.lines = null;
    this.particlePositions = [];
    this.particleData = [];
    this.positions = null;
    this.colors = null;
    
    this.maxParticleCount = 120;
    this.particleCount = 100;
    this.r = 800;
    this.rHalf = this.r / 2;

    this.minDistance = 90;
    this.limitConnections = true;
    this.maxConnections = 4;

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this.init();
    this.animate();
  }

  init() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xf8fafc, 0.0015);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
    this.camera.position.z = 1000;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.container, 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x0a0a0f, 0); // Transparent to show CSS gradients underneath

    // Particles Setup
    const segments = this.maxParticleCount;
    this.positions = new Float32Array(segments * 3);
    this.colors = new Float32Array(segments * 3);

    // Create custom soft circle texture for particles
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 16);
    const texture = new THREE.CanvasTexture(canvas);

    const pMaterial = new THREE.PointsMaterial({
      color: 0x6366f1, // Slate/Indigo tint
      size: 8,
      map: texture,
      blending: THREE.NormalBlending, // Normal blending for light theme
      transparent: true,
      sizeAttenuation: true,
      depthWrite: false
    });

    const particlesGeometry = new THREE.BufferGeometry();
    
    for (let i = 0; i < this.maxParticleCount; i++) {
      const x = Math.random() * this.r - this.rHalf;
      const y = Math.random() * this.r - this.rHalf;
      const z = Math.random() * this.r - this.rHalf;

      this.particlePositions.push(new THREE.Vector3(x, y, z));
      
      this.positions[i * 3] = x;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = z;

      this.particleData.push({
        velocity: new THREE.Vector3(
          (-1 + Math.random() * 2) * 0.4,
          (-1 + Math.random() * 2) * 0.4,
          (-1 + Math.random() * 2) * 0.4
        ),
        numConnections: 0
      });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3).setUsage(THREE.DynamicDrawUsage));
    this.particles = new THREE.Points(particlesGeometry, pMaterial);
    this.scene.add(this.particles);

    // Lines Connecting Particles Setup
    const lineIndices = [];
    // Pre-allocate indices for max potential connections
    const maxLineConnections = this.maxParticleCount * this.maxConnections;
    const linePositions = new Float32Array(maxLineConnections * 2 * 3);
    const lineColors = new Float32Array(maxLineConnections * 2 * 3);

    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    linesGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.NormalBlending, // Normal blending for light theme
      transparent: true,
      opacity: 0.25, // Subtle lines for light theme
      depthWrite: false
    });

    this.lines = new THREE.LineSegments(linesGeometry, lineMaterial);
    this.scene.add(this.lines);

    // Event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('touchmove', this.onTouchMove.bind(this));
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(event) {
    this.targetMouseX = (event.clientX - window.innerWidth / 2) * 0.25;
    this.targetMouseY = (event.clientY - window.innerHeight / 2) * 0.25;
  }

  onTouchMove(event) {
    if (event.touches.length > 0) {
      this.targetMouseX = (event.touches[0].clientX - window.innerWidth / 2) * 0.25;
      this.targetMouseY = (event.touches[0].clientY - window.innerHeight / 2) * 0.25;
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Smooth mouse interpolation (spring feel)
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Apply camera offset based on mouse position
    this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
    this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);

    // Update particles positioning and connectivity
    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    for (let i = 0; i < this.particleCount; i++) {
      this.particleData[i].numConnections = 0;
    }

    const positionsAttr = this.particles.geometry.getAttribute('position');
    const linePositionsAttr = this.lines.geometry.getAttribute('position');
    const lineColorsAttr = this.lines.geometry.getAttribute('color');

    for (let i = 0; i < this.particleCount; i++) {
      // Get particle coordinates
      const particleVector = this.particlePositions[i];
      const data = this.particleData[i];

      // Update position based on velocity
      particleVector.add(data.velocity);

      // Bounce off imaginary cube boundary box
      if (particleVector.x < -this.rHalf || particleVector.x > this.rHalf) data.velocity.x = -data.velocity.x;
      if (particleVector.y < -this.rHalf || particleVector.y > this.rHalf) data.velocity.y = -data.velocity.y;
      if (particleVector.z < -this.rHalf || particleVector.z > this.rHalf) data.velocity.z = -data.velocity.z;

      positionsAttr.setXYZ(i, particleVector.x, particleVector.y, particleVector.z);

      // Check proximity connections with other particles
      for (let j = i + 1; j < this.particleCount; j++) {
        const otherVector = this.particlePositions[j];
        const otherData = this.particleData[j];

        if (this.limitConnections && data.numConnections >= this.maxConnections) break;
        if (this.limitConnections && otherData.numConnections >= this.maxConnections) continue;

        const dx = particleVector.x - otherVector.x;
        const dy = particleVector.y - otherVector.y;
        const dz = particleVector.z - otherVector.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < this.minDistance) {
          data.numConnections++;
          otherData.numConnections++;

          // Draw connection line
          linePositionsAttr.setXYZ(vertexpos, particleVector.x, particleVector.y, particleVector.z);
          linePositionsAttr.setXYZ(vertexpos + 1, otherVector.x, otherVector.y, otherVector.z);

          // Calculate connection opacity based on proximity
          const alpha = 1.0 - (dist / this.minDistance);
          
          // Color connection lines based on coordinates (indigo-slate gradients)
          const r = 0.3 + 0.3 * (particleVector.x / this.rHalf);
          const g = 0.4 + 0.2 * (particleVector.y / this.rHalf);
          const b = 0.7 + 0.2 * (particleVector.z / this.rHalf);

          lineColorsAttr.setXYZ(colorpos, r * alpha, g * alpha, b * alpha);
          lineColorsAttr.setXYZ(colorpos + 1, r * alpha, g * alpha, b * alpha);

          vertexpos += 2;
          colorpos += 2;
          numConnected++;
        }
      }
    }

    positionsAttr.needsUpdate = true;
    linePositionsAttr.needsUpdate = true;
    lineColorsAttr.needsUpdate = true;

    this.lines.geometry.setDrawRange(0, numConnected * 2);

    // Slow overall scene rotation
    this.scene.rotation.y += 0.001;

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  new ThreeBackground();
});
