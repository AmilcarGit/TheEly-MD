// ================================
// Animación al hacer scroll
// ================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

// Aplica animación a las cards y secciones
document.querySelectorAll('.card, .about-grid, .skill-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ================================
// Año dinámico en el footer
// ================================
const footer = document.querySelector('footer p');
if (footer) {
  footer.innerHTML = footer.innerHTML.replace('2025', new Date().getFullYear());
}

// ================================
// Smooth scroll para nav links
// ================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});