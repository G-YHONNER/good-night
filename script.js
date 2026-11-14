/* =========================================================
   SCRIPT - BUENAS NOCHES Y LUNA MÁGICA
   Estrellas dinámicas en Canvas, Frases poéticas,
   Estrellas fugaces interactivas, Copiar Frase y Sonido Zen (Web Audio API)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTOS DEL DOM ---
  const canvas = document.getElementById('stars-canvas');
  const ctx = canvas.getContext('2d');
  const quoteText = document.getElementById('quote-text');
  const authorTag = document.getElementById('author-tag');
  const btnNextQuote = document.getElementById('btn-next-quote');
  const btnMakeWish = document.getElementById('btn-make-wish');
  const btnCopyQuote = document.getElementById('btn-copy-quote');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const soundLabel = document.getElementById('sound-label');
  const wishToast = document.getElementById('wish-toast');
  const moonWrapper = document.getElementById('moon-wrapper');
  const moonElement = document.getElementById('moon-element');

  // --- COLECCIÓN DE FRASES DE BUENAS NOCHES ---
  const quotes = [
    {
      text: "Que la luna vele tus sueños y las estrellas enciendan la esperanza de un nuevo amanecer. Suelta las cargas del día, respira en calma y descansa con el corazón en paz.",
      author: "— Dulces Sueños & Serenidad —"
    },
    {
      text: "Apaga los pensamientos del día, enciende la calma en tu alma. Deja que el silencio de la noche te devuelva la armonía y la dulzura que mereces.",
      author: "— Que la Paz te Acompañe —"
    },
    {
      text: "El día ha concluido y diste lo mejor de ti. Ahora suelta todo control, abraza la quietud de la noche y prepárate para soñar cosas hermosas.",
      author: "— Descanso Reparador —"
    },
    {
      text: "Que el manto de esta noche estrellada te cubra con ternura, renueve tus fuerzas y despierte en ti una infinita gratitud por la vida. Hasta mañana.",
      author: "— Luz en tus Sueños —"
    },
    {
      text: "No te preocupes por el mañana; cada día trae su propia bendición. Cierra los ojos con la certeza de que todo lo bueno está por llegar. Buenas noches.",
      author: "— Confianza y Calma —"
    },
    {
      text: "Mira hacia arriba: cada estrella es un recordatorio de que siempre hay luz en la oscuridad. Que descanses profundamente y despiertes con energía renovada.",
      author: "— El Cielo Te Abraza —"
    },
    {
      text: "Que los ángeles de la tranquilidad custodien tu descanso, que las preocupaciones se disuelvan y que mañana despiertes con una sonrisa radiante.",
      author: "— Noche de Bendiciones —"
    }
  ];

  let currentQuoteIndex = 0;

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

    // Dibujar estrellas
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
    if (Math.random() < 0.008 && shootingStars.length < 3) {
      shootingStars.push(new ShootingStar());
    }

    requestAnimationFrame(loop);
  }

  initStars();
  loop();

  // --- CAMBIO DE FRASES CON TRANSICIÓN SUAVE ---
  btnNextQuote.addEventListener('click', () => {
    quoteText.style.opacity = '0';
    quoteText.style.transform = 'translateY(10px)';
    authorTag.style.opacity = '0';

    setTimeout(() => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
      quoteText.textContent = quotes[currentQuoteIndex].text;
      authorTag.textContent = quotes[currentQuoteIndex].author;

      quoteText.style.opacity = '1';
      quoteText.style.transform = 'translateY(0)';
      authorTag.style.opacity = '1';
    }, 350);

    createSparkles(btnNextQuote);
  });

  // --- BOTÓN: PEDIR UN DESEO ---
  btnMakeWish.addEventListener('click', () => {
    // 1. Lanzar inmediatamente 2 estrellas fugaces radiantes
    shootingStars.push(new ShootingStar(width * 0.15, height * 0.1, 14, Math.PI / 4));
    setTimeout(() => {
      shootingStars.push(new ShootingStar(width * 0.3, height * 0.05, 12, Math.PI / 3.8));
    }, 280);

    // 2. Chispas alrededor del botón
    createSparkles(btnMakeWish, 18);

    // 3. Sonido celestial
    playChimeSound();

    // 4. Mostrar Toast
    showToast('🌠 ¡Tu deseo ha sido enviado al firmamento! Duerme en paz y con fe.');
  });

  // --- BOTÓN: COPIAR FRASE ---
  if (btnCopyQuote) {
    btnCopyQuote.addEventListener('click', () => {
      const textToCopy = `"${quotes[currentQuoteIndex].text}"\n${quotes[currentQuoteIndex].author}\n✨ ¡Buenas Noches! 🌙`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        createSparkles(btnCopyQuote, 14);
        playChimeSound(700);
        showToast('📋 ¡Frase copiada al portapapeles con éxito!');
      }).catch(() => {
        showToast('🌙 ¡Frase lista para compartir!');
      });
    });
  }

  function showToast(message) {
    wishToast.textContent = message;
    wishToast.classList.add('show');
    clearTimeout(wishToast.timer);
    wishToast.timer = setTimeout(() => {
      wishToast.classList.remove('show');
    }, 4000);
  }

  // --- INTERACTIVIDAD CON LA LUNA ---
  moonWrapper.addEventListener('click', () => {
    // Halo pulse momentáneo
    moonWrapper.style.transform = 'scale(1.15) rotate(8deg)';
    setTimeout(() => {
      moonWrapper.style.transform = '';
    }, 500);

    // Lanza una lluvia de chispas estelares desde el centro de la luna
    const rect = moonWrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 22; i++) {
      spawnSparkleAt(centerX, centerY);
    }

    // Sonido celestial suave
    playChimeSound(660);
  });

  // --- EFECTO DE CHISPAS EN PANTALLA ---
  function createSparkles(element, count = 12) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      spawnSparkleAt(centerX, centerY);
    }
  }

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

  // Clic en cualquier parte del cielo para generar una pequeña estrella
  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || e.target.closest('.card-container') || e.target.closest('.moon-wrapper')) {
      return;
    }
    spawnSparkleAt(e.clientX, e.clientY);
  });

  // --- AUDIO SINTETIZADO ZEN / CELESTIAL (WEB AUDIO API) ---
  let audioCtx = null;
  let isAmbientPlaying = false;
  let ambientNodes = [];

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

  // Tono de campana de viento celestial
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
      console.log('Audio en espera de interacción');
    }
  }

  // Música ambiental de frecuencias relajantes (Solfeggio 432Hz / 528Hz)
  function toggleAmbientMusic() {
    const ctx = getAudioContext();

    if (isAmbientPlaying) {
      stopAmbientMusic();
      isAmbientPlaying = false;
      btnSoundToggle.classList.remove('active');
      soundIcon.textContent = '🔈';
      soundLabel.textContent = 'Música Zen';
    } else {
      startAmbientMusic(ctx);
      isAmbientPlaying = true;
      btnSoundToggle.classList.add('active');
      soundIcon.textContent = '🔊';
      soundLabel.textContent = 'Pausar Zen';
    }
  }

  function startAmbientMusic(ctx) {
    ambientNodes = [];
    const freqs = [108, 216, 432, 528]; // Frecuencias serenas y armónicas

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 3);
    masterGain.connect(ctx.destination);
    ambientNodes.push(masterGain);

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.value = 0.25 / freqs.length;

      // LFO sutil para respiración del sonido
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.15 + idx * 0.05;
      lfoGain.gain.value = 1.8;
      lfo.connect(osc.frequency);
      lfo.start();
      ambientNodes.push(lfo);

      if (pan) {
        pan.pan.value = (idx % 2 === 0 ? 1 : -1) * 0.4;
        osc.connect(gain);
        gain.connect(pan);
        pan.connect(masterGain);
      } else {
        osc.connect(gain);
        gain.connect(masterGain);
      }

      osc.start();
      ambientNodes.push(osc);
    });
  }

  function stopAmbientMusic() {
    ambientNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) { }
    });
    ambientNodes = [];
  }

  btnSoundToggle.addEventListener('click', toggleAmbientMusic);
});
