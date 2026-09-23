/*
  script.js
  Interacciones, animaciones y efectos de experiencia para la página.
  Todas las funciones están comentadas para facilitar mantenimiento y evolución.
*/

const pageLoader = document.getElementById('pageLoader');
const header = document.getElementById('pageHeader');
const progressBar = document.getElementById('progressBar');
const navLinks = document.querySelectorAll('.nav-link');
const backToTop = document.getElementById('backToTop');
const typingText = document.getElementById('typingText');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const magneticElements = document.querySelectorAll('.magnetic');
const tiltElements = document.querySelectorAll('[data-tilt]');
const heroCanvas = document.getElementById('heroCanvas');
const heroCtx = heroCanvas.getContext('2d');

let scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
let typingIndex = 0;
let letterIndex = 0;
let typedText = '';
const typingWords = ['Diseño UX.', 'Prototipos.', 'Animación sutil.', 'Marca visual.'];

/* Loader initial: esconder luego de que la página carga completamente. */
window.addEventListener('load', () => {
  setTimeout(() => {
    pageLoader.style.opacity = '0';
    pageLoader.style.pointerEvents = 'none';
    pageLoader.style.visibility = 'hidden';
  }, 1200);
});

/* Actualiza la barra de progreso de scroll y el header al hacer scroll. */
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const progress = Math.min((scrollY / scrollHeight) * 100, 100);
  progressBar.style.width = `${progress}%`;

  if (scrollY > 32) {
    header.classList.add('scrolled');
    backToTop.classList.add('visible');
  } else {
    header.classList.remove('scrolled');
    backToTop.classList.remove('visible');
  }

  updateActiveSection();
});

/* Responde al click del botón back-to-top. */
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* Smooth scroll para enlaces internos. */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    event.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      const offset = target.offsetTop - 90;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  });
});

/* Activa nav link basado en sección visible. */
function updateActiveSection() {
  document.querySelectorAll('section[id]').forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      navLinks.forEach((link) => link.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}

/* Efecto typing en el Hero. */
function typeHeadline() {
  const current = typingWords[typingIndex];
  if (letterIndex < current.length) {
    typedText += current[letterIndex];
    typingText.textContent = typedText;
    letterIndex += 1;
    setTimeout(typeHeadline, 100);
  } else {
    setTimeout(() => {
      fadeTyping();
    }, 1800);
  }
}

function fadeTyping() {
  typingText.style.opacity = '0';
  setTimeout(() => {
    typingText.style.opacity = '1';
    letterIndex = 0;
    typedText = '';
    typingIndex = (typingIndex + 1) % typingWords.length;
    typeHeadline();
  }, 400);
}

typeHeadline();

/* Configuración de filtros de proyecto. */
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;

    projectCards.forEach((card) => {
      const category = card.dataset.category;
      if (filter === 'all' || category === filter) {
        card.style.display = 'grid';
        requestAnimationFrame(() => card.classList.add('visible'));
      } else {
        card.style.display = 'none';
        card.classList.remove('visible');
      }
    });
  });
});

/* Contadores animados cuando la sección aparece en pantalla. */
const statNumbers = document.querySelectorAll('.stat-number');
const statObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const targetValue = +element.dataset.target;
        let currentValue = 0;
        const increment = Math.max(1, Math.floor(targetValue / 48));

        const counter = setInterval(() => {
          currentValue += increment;
          if (currentValue >= targetValue) {
            element.textContent = targetValue;
            clearInterval(counter);
          } else {
            element.textContent = currentValue;
          }
        }, 28);

        observer.unobserve(element);
      }
    });
  },
  { threshold: 0.64 }
);

statNumbers.forEach((node) => statObserver.observe(node));

/* Efecto magnético en botones premium. */
magneticElements.forEach((element) => {
  element.addEventListener('mousemove', (event) => {
    const rect = element.getBoundingClientRect();
    const relX = event.clientX - rect.left;
    const relY = event.clientY - rect.top;
    const distX = relX - rect.width / 2;
    const distY = relY - rect.height / 2;
    element.style.transform = `translate3d(${distX * 0.12}px, ${distY * 0.12}px, 0)`;
  });

  element.addEventListener('mouseleave', () => {
    element.style.transform = 'translate3d(0, 0, 0)';
  });
});

/* Efecto de inclinación 3D en tarjetas. */
tiltElements.forEach((element) => {
  const card = element;
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
    const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -18;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
  });
});

/* Canvas de partículas en el Hero. */
const particleCount = 82;
const particles = [];

heroCanvas.width = window.innerWidth;
heroCanvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  heroCanvas.width = window.innerWidth;
  heroCanvas.height = window.innerHeight;
});

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * heroCanvas.width;
    this.y = Math.random() * heroCanvas.height;
    this.size = 1 + Math.random() * 2.5;
    this.speed = 0.1 + Math.random() * 0.45;
    this.alpha = 0.08 + Math.random() * 0.14;
    this.offset = Math.random() * Math.PI * 2;
  }

  draw() {
    heroCtx.beginPath();
    heroCtx.fillStyle = `rgba(255,255,255,${this.alpha})`;
    heroCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    heroCtx.fill();
  }

  update(delta) {
    this.y -= this.speed * delta;
    this.x += Math.sin(this.offset + this.y * 0.003) * 0.8;
    if (this.y < -20) {
      this.y = heroCanvas.height + 12;
      this.x = Math.random() * heroCanvas.width;
    }
    this.draw();
  }
}

for (let i = 0; i < particleCount; i += 1) {
  particles.push(new Particle());
}

let lastTime = 0;
function animateParticles(time) {
  const delta = time - lastTime;
  lastTime = time;
  heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
  heroCtx.fillStyle = 'rgba(9, 9, 9, 0.88)';
  heroCtx.fillRect(0, 0, heroCanvas.width, heroCanvas.height);

  particles.forEach((particle) => particle.update(delta));
  requestAnimationFrame(animateParticles);
}
requestAnimationFrame(animateParticles);

/* Observador de secciones para animaciones basadas en scroll. */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll('.section, .hero-copy, .about-card, .skill-card, .project-card, .timeline-card, .service-card, .contact-panel, .contact-form').forEach((element) => {
  element.style.opacity = '0';
  element.style.transform = 'translateY(30px)';
  revealObserver.observe(element);
});

/* Anima el scroll responsive al hacer clic en el logo. */
document.querySelector('.brand').addEventListener('click', (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* Ajusta altura de hero y actualiza scroll máximo cuando cambia el tamaño. */
function updateScrollHeight() {
  scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
}

window.addEventListener('resize', updateScrollHeight);
updateScrollHeight();
