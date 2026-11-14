/* =========================================================
   SCRIPT - BUENAS NOCHES Y LUNA MÁGICA
   Estrellas dinámicas en Canvas, Estrellas fugaces interactivas,
   efectos luminosos en la luna y el cielo nocturno.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTOS DEL DOM ---
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  const moonWrapper = document.getElementById('moon-wrapper');

  // --- CONFIGURACIÓN DEL CANVAS Y ESTRELLAS ---
  let stars = [];
  let shootingStars = [];
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
  });

  class Star {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.8 + 0.3;
      this.alpha = Math.random() * 0.7 + 0.3;
      this.twinkleSpeed = Math.random() * 0.02 + 0.005;
      this.color = this.getRandomColor();
    }

    getRandomColor() {
      const colors = ['#ffffff', '#fff7d9', '#e3f2fd', '#ffebee', '#ede7f6'];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.alpha += this.twinkleSpeed;
      if (this.alpha >= 1 || this.alpha <= 0.15) {
        this.twinkleSpeed = -this.twinkleSpeed;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, this.alpha));
      ctx.shadowBlur = this.size * 3;
      ctx.shadowColor = this.color;
      ctx.fill();
    }
  }

  class ShootingStar {
    constructor(startX, startY, speed, angle) {
      this.x = startX !== undefined ? startX : Math.random() * (width * 0.7);
      this.y = startY !== undefined ? startY : Math.random() * (height * 0.4);
      this.length = Math.random() * 90 + 70;
      this.speed = speed || Math.random() * 9 + 8;
      this.angle = angle || Math.PI / 4 + (Math.random() * 0.2 - 0.1);
      this.dx = Math.cos(this.angle) * this.speed;
      this.dy = Math.sin(this.angle) * this.speed;
      this.life = 0;
      this.maxLife = Math.random() * 45 + 40;
      this.trail = [];
    }

    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 15) {
        this.trail.shift();
      }

      this.x += this.dx;
      this.y += this.dy;
      this.life++;
    }

    draw() {
      const progress = this.life / this.maxLife;
      const alpha = Math.max(0, 1 - progress);

      // Dibujar estela luminosa
      for (let i = 0; i < this.trail.length - 1; i++) {
        const pointAlpha = (i / this.trail.length) * alpha;
        ctx.beginPath();
        ctx.moveTo(this.trail[i].x, this.trail[i].y);
        ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
        ctx.strokeStyle = `rgba(255, 245, 210, ${pointAlpha})`;
        ctx.lineWidth = (i / this.trail.length) * 2.8;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#fff3c4';
        ctx.stroke();
      }

      // Cabeza brillante de la estrella fugaz
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#ffeaa7';
      ctx.fill();
    }

    isDead() {
      return this.life >= this.maxLife || this.x > width + 100 || this.y > height + 100;
    }
  }

  function initStars() {
    stars = [];
    const starCount = Math.floor((width * height) / 3800);
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    // Dibujar estrellas fijas y titilantes
    for (let star of stars) {
      star.update();
      star.draw();
    }

    // Dibujar estrellas fugaces
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      s.update();
      s.draw();
      if (s.isDead()) {
        shootingStars.splice(i, 1);
      }
    }

    // Generar ocasionalmente estrellas fugaces naturales
    if (Math.random() < 0.012 && shootingStars.length < 3) {
      shootingStars.push(new ShootingStar());
    }

    requestAnimationFrame(loop);
  }

  initStars();
  loop();

  // --- INTERACTIVIDAD CON LA LUNA ---
  if (moonWrapper) {
    moonWrapper.addEventListener('click', () => {
      moonWrapper.style.transform = 'scale(1.15) rotate(8deg)';
      setTimeout(() => {
        moonWrapper.style.transform = '';
      }, 500);

      const rect = moonWrapper.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      for (let i = 0; i < 22; i++) {
        spawnSparkleAt(centerX, centerY);
      }

      // Disparar una estrella fugaz al tocar la luna
      shootingStars.push(new ShootingStar(centerX, centerY, 12, Math.PI / 3.8));
      playChimeSound(660);
    });
  }

  // --- EFECTO DE CHISPAS EN PANTALLA ---
  function spawnSparkleAt(x, y) {
    const particle = document.createElement('div');
    particle.className = 'sparkle-particle';

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 80 + 30;
    const dx = Math.cos(angle) * dist + 'px';
    const dy = Math.sin(angle) * dist + 'px';
    const size = Math.random() * 5 + 3;

    particle.style.setProperty('--dx', dx);
    particle.style.setProperty('--dy', dy);
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;

    const colors = ['#fff5cc', '#ffd56b', '#a5c8ff', '#ffffff'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.boxShadow = `0 0 10px ${particle.style.background}`;

    document.body.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 850);
  }

  // Clic en cualquier parte del cielo para generar chispas estelares
  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.card-container') || e.target.closest('.moon-wrapper')) {
      return;
    }
    spawnSparkleAt(e.clientX, e.clientY);
  });

  // --- SONIDO CELESTIAL SUAVE (WEB AUDIO API) ---
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playChimeSound(freq = 528) {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch (e) {
      // Navegadores que bloquean autoplay antes de gesto de usuario
    }
  }

  // --- BLOQUEO TOTAL DE ZOOM ---
  // Bloquear gestos de pellizco en Safari iOS
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  // Bloquear multi-touch pinch y arrastre/deslizamiento hacia abajo en móviles
  document.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // Bloquear completamente el deslizamiento/scroll táctil (pull down / rubber-band)
  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('scroll', () => {
    window.scrollTo(0, 0);
  });

  // Bloquear zoom por doble toque rápido
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

  // Bloquear zoom con rueda de ratón (Ctrl + scroll)
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });

  // Bloquear atajos de zoom de teclado (Ctrl +, Ctrl -, Ctrl 0)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
      e.preventDefault();
    }
  });
});
