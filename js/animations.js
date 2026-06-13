// GSAP Animations and Splash Screen Controller
document.addEventListener('DOMContentLoaded', () => {
  // 1. Splash Screen Preloader Logic
  const splashScreen = document.getElementById('splash-screen');
  const circleProgress = document.getElementById('splash-circle-progress');
  const percentageText = document.getElementById('splash-percentage');
  const logText = document.getElementById('splash-log');

  const logs = [
    "INITIALIZING CORE SYSTEM CONFIG...",
    "LOADING GRAPHICS & INTERACTIVE SHADERS...",
    "ESTABLISHING WebGL BACKDROP...",
    "CONNECTING TO DATABASE INSTANCES...",
    "MOUNTING RESPONSIVE STACK MODULES...",
    "RENDERING USER INTERFACE COMPONENT...",
    "OPTIMIZING GLIDE TRANSITIONS...",
    "PORTFOLIO READY COMPILATION SUCCESS."
  ];

  let loadProgress = 0;
  const progressInterval = setInterval(() => {
    // Increment load progress dynamically
    loadProgress += Math.floor(Math.random() * 6) + 3;
    
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(progressInterval);
      
      // Update elements to final 100% state
      if (circleProgress) circleProgress.style.strokeDashoffset = '0';
      if (percentageText) percentageText.textContent = '100';
      if (logText) logText.textContent = logs[logs.length - 1];
      
      setTimeout(exitSplashScreen, 500);
    } else {
      if (circleProgress) {
        // stroke-dashoffset goes from 276.4 (0%) to 0 (100%)
        const offset = 276.4 - (276.4 * loadProgress) / 100;
        circleProgress.style.strokeDashoffset = offset;
      }
      if (percentageText) {
        percentageText.textContent = loadProgress;
      }
      if (logText) {
        const logIndex = Math.min(
          logs.length - 2,
          Math.floor((loadProgress / 100) * (logs.length - 1))
        );
        logText.textContent = logs[logIndex];
      }
    }
  }, 45);

  function exitSplashScreen() {
    if (!splashScreen) {
      startEntranceAnimations();
      return;
    }

    // GSAP tween to scale and fade out preloader smoothly
    gsap.to(splashScreen, {
      opacity: 0,
      scale: 1.05,
      duration: 1.0,
      ease: 'power3.inOut',
      onComplete: () => {
        splashScreen.style.display = 'none';
        startEntranceAnimations();
      }
    });
  }

  // 2. Entrance Choreography
  function startEntranceAnimations() {
    const tl = gsap.timeline();

    // Set scroll back to auto once splash finishes
    document.body.style.overflow = 'auto';

    // Header animate
    tl.from('header', {
      y: -60,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });

    // Hero content animation
    tl.from('.hero-badge', {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.7)'
    }, '-=0.4');

    tl.from('.hero-title span', {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power4.out'
    }, '-=0.3');

    tl.from('.hero-subtitle', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.4');

    tl.from('.hero-profile', {
      scale: 0.9,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5');

    tl.from('.hero-quote', {
      x: (i) => i === 0 ? -40 : 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out'
    }, '-=0.6');

    tl.from('.scroll-indicator', {
      opacity: 0,
      y: -10,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        // Infinite bounce loop for scroll indicator
        gsap.to('.scroll-indicator', {
          y: 6,
          repeat: -1,
          yoyo: true,
          duration: 0.8,
          ease: 'power1.inOut'
        });
      }
    }, '-=0.2');

    // Start typing effect for subtitle
    runTypewriter();
  }

  // 3. Typewriter Effect
  function runTypewriter() {
    const element = document.querySelector('.typewriter-text');
    if (!element) return;
    
    const words = ["Full-Stack Developer", "Problem Solver", "UI/UX Enthusiast", "Creative Thinker"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let delay = 150;

    function type() {
      const currentWord = words[wordIndex];
      if (isDeleting) {
        element.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        delay = 60;
      } else {
        element.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        delay = 120;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        // Pause at completion
        delay = 1500;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 400; // brief pause before next word
      }

      setTimeout(type, delay);
    }

    type();
  }

  // Register GSAP ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // 4. Scroll triggered animations for sections
  
  // Section Headers Reveal
  const sectionHeaders = document.querySelectorAll('.section-header');
  sectionHeaders.forEach(header => {
    gsap.from(header, {
      scrollTrigger: {
        trigger: header,
        start: 'top 92%',
        toggleActions: 'play reverse play reverse'
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  // About Me Section
  const aboutMe = document.querySelector('#aboutMeContent');
  if (aboutMe) {
    gsap.from(aboutMe, {
      scrollTrigger: {
        trigger: aboutMe,
        start: 'top 92%',
        toggleActions: 'play reverse play reverse'
      },
      opacity: 0,
      y: 40,
      duration: 1.0,
      ease: 'power3.out'
    });
  }

  // Tech Stack Section
  const techStack = document.querySelector('.carosel');
  if (techStack) {
    gsap.from(techStack, {
      scrollTrigger: {
        trigger: techStack,
        start: 'top 92%',
        toggleActions: 'play reverse play reverse'
      },
      opacity: 0,
      scale: 0.95,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  // Projects Grid Items (Fade in/out on scroll entry/exit individually)
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 95%',
        toggleActions: 'play reverse play reverse'
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  // Experience Timeline Items (Slide in individually)
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach(item => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 95%',
        toggleActions: 'play reverse play reverse'
      },
      opacity: 0,
      x: -30,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  // Education/Certifications Cards (Scale in individually)
  const educationCards = document.querySelectorAll('.education-card');
  educationCards.forEach(card => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 95%',
        toggleActions: 'play reverse play reverse'
      },
      opacity: 0,
      scale: 0.95,
      y: 20,
      duration: 0.8,
      ease: 'power3.out'
    });
  });

  // Contact Cards (Slide up individually)
  const contactCards = document.querySelectorAll('.contact-card');
  contactCards.forEach(card => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 95%',
        toggleActions: 'play reverse play reverse'
      },
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: 'power3.out'
    });
  });
});

