// Portfolio General Operations & Magnetic Interactive Effects
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Mobile Menu Toggler
  const navBar = document.querySelector("#nav");
  const dropDown = document.querySelector("#dropdown");
  
  if (navBar && dropDown) {
    navBar.addEventListener("click", (e) => {
      e.stopPropagation();
      dropDown.classList.toggle("opacity-100");
      dropDown.classList.toggle("visible");
      dropDown.classList.toggle("-translate-y-2");
      dropDown.classList.toggle("translate-y-0");
      
      // Animate hamburger icon rotation if needed
      const icon = navBar.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropDown.contains(e.target) && !navBar.contains(e.target)) {
        if (dropDown.classList.contains('opacity-100')) {
          dropDown.classList.remove("opacity-100", "visible", "translate-y-0");
          dropDown.classList.add("-translate-y-2");
          const icon = navBar.querySelector('i');
          if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-xmark');
          }
        }
      }
    });

    // Close menu when clicking links
    const links = dropDown.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        dropDown.classList.remove("opacity-100", "visible", "translate-y-0");
        dropDown.classList.add("-translate-y-2");
        const icon = navBar.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // 2. Infinite Scroll Marquee Width Adjuster
  const track = document.querySelector(".track");
  const group = document.querySelector(".group");

  if (track && group) {
    const setScroll = () => {
      const groupWidth = group.getBoundingClientRect().width;
      track.style.setProperty("--scroll-distance", `${groupWidth}px`);
      track.style.setProperty("--scroll-nudge", `0.5px`);
      
      // Dynamic speed scaling based on width
      const speed = 25; // speed constant (pixels/sec)
      const duration = Math.max(8, groupWidth / speed);
      track.style.setProperty("--scroll-duration", `${duration}s`);
    };
    
    // Initial run and resize listener
    setScroll();
    window.addEventListener("resize", setScroll);
  }

  // 3. Header Scroll Styling (Shrink, Border Gradient, and Shadow-Glow)
  const navContainer = document.querySelector('#nav-container');
  if (navContainer) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navContainer.classList.add('scrolled');
      } else {
        navContainer.classList.remove('scrolled');
      }
    });
  }

  // 4. Magnetic Interactive Button Pull Effect (GPU-Accelerated Damped Lerp)
  const magneticWraps = document.querySelectorAll('.magnetic-wrap');
  
  magneticWraps.forEach(wrap => {
    const btn = wrap.querySelector('.magnetic-btn');
    if (!btn) return;
    const innerText = btn.querySelector('.btn-inner');

    let hovering = false;
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let animationFrameId = null;

    const updatePosition = () => {
      if (!hovering && Math.abs(x) < 0.05 && Math.abs(y) < 0.05) {
        x = 0;
        y = 0;
        btn.style.transform = 'translate3d(0px, 0px, 0px)';
        if (innerText) innerText.style.transform = 'translate3d(0px, 0px, 0px)';
        animationFrameId = null;
        return;
      }

      // Linear interpolation (lerp) for smooth damping
      const ease = hovering ? 0.15 : 0.08;
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;

      btn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (innerText) {
        innerText.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const wrapX = rect.left + rect.width / 2;
      const wrapY = rect.top + rect.height / 2;
      
      const distX = e.clientX - wrapX;
      const distY = e.clientY - wrapY;

      // Magnetic pull limit bounds
      const strength = 0.35;
      targetX = distX * strength;
      targetY = distY * strength;

      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updatePosition);
      }
    });

    wrap.addEventListener('mouseenter', () => {
      hovering = true;
      btn.style.transition = 'none';
      if (innerText) innerText.style.transition = 'none';
    });

    wrap.addEventListener('mouseleave', () => {
      hovering = false;
      targetX = 0;
      targetY = 0;
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(updatePosition);
      }
    });
  });
});
