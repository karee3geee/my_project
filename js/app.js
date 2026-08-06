/* ============================================================
   KARIM AI STUDIO — Portfolio & UI Engine
   ============================================================ */

const FALLBACK_PROJECTS = [
  { id:'p1', title:'Hyperion Monolith', category:'images', categoryLabel:'AI Images',
    description:'8K alien landscape rendered with Flux.1 Pro and custom volumetric lighting.',
    tags:['Flux.1','8K','Generative'], mediaType:'image', src:'assets/cinematic_landscape.webp' },
  { id:'p2', title:'Cybernetic Motion', category:'videos', categoryLabel:'AI Videos',
    description:'Futuristic fashion sequence generated using Kling AI and Runway Gen-3.',
    tags:['Kling AI','Runway','4K'], mediaType:'image', src:'assets/video_production.webp' },
  { id:'p3', title:'Python Agent Pipeline', category:'automation', categoryLabel:'Python Automation',
    description:'Autonomous Python workflow collecting financial data and generating AI infographics.',
    tags:['Python','OpenAI','Automation'], mediaType:'image', src:'assets/automation_workflow.webp' },
  { id:'p4', title:'n8n Multi-Agent Workflow', category:'workflows', categoryLabel:'AI Workflows',
    description:'n8n pipeline coordinating LLMs, image generation, and multi-channel publishing.',
    tags:['n8n','Make','Workflows'], mediaType:'image', src:'assets/branding_lux.webp' },
  { id:'p5', title:'Parametric Sanctuary', category:'creative', categoryLabel:'Creative Projects',
    description:'Architectural concept with AI-driven organic curves and glass facade renders.',
    tags:['Midjourney','ComfyUI','Design'], mediaType:'image', src:'assets/creative_architecture.webp' },
  { id:'p6', title:'Neural Core Sphere', category:'images', categoryLabel:'AI Images',
    description:'3D translucent AI energy core visual created for high-tech brand keyvisuals.',
    tags:['Flux.1','3D Render'], mediaType:'image', src:'assets/hero_sphere.jpg' }
];

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initScrollProgress();
  initBackToTop();
  initMobileNav();
  initHeroCanvas();
  initCounters();
  initPortfolio();
  initLightbox();
  initContactForm();
  initNavScroll();
});

/* ── Theme ── */
function initTheme() {
  const btn = document.getElementById('themeToggleBtn');
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  btn && btn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const nxt = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nxt);
    localStorage.setItem('theme', nxt);
  });
}

/* ── Scroll Progress ── */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ── Back to Top ── */
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── Nav scroll effect ── */
function initNavScroll() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), { passive: true });
}

/* ── Mobile Nav ── */
function initMobileNav() {
  const ham = document.getElementById('navHamburger');
  const nav = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileNavOverlay');
  const close = document.getElementById('mobileNavClose');
  const links = document.querySelectorAll('.mobile-nav a');
  const open = () => { nav.classList.add('open'); overlay.classList.add('open'); };
  const shut = () => { nav.classList.remove('open'); overlay.classList.remove('open'); };
  ham && ham.addEventListener('click', open);
  close && close.addEventListener('click', shut);
  overlay && overlay.addEventListener('click', shut);
  links.forEach(l => l.addEventListener('click', shut));
}

/* ── Hero Canvas (lightweight 14-node network) ── */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });
  const N = 14;
  const nodes = Array.from({ length: N }, () => ({
    x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 2 + 1.5
  }));
  function draw() {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach((n, i) => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = '#3B82F6'; ctx.globalAlpha = 0.5; ctx.fill();
      for (let j = i + 1; j < N; j++) {
        const m = nodes[j], d = Math.hypot(n.x - m.x, n.y - m.y);
        if (d < 150) {
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = '#06B6D4'; ctx.globalAlpha = (1 - d / 150) * 0.18; ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── Counters ── */
function initCounters() {
  const els = document.querySelectorAll('.stat-number');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count || '0');
      const suffix = el.dataset.suffix || '';
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const timer = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur + suffix;
        if (cur >= target) clearInterval(timer);
      }, 28);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => obs.observe(el));
}

/* ── Portfolio ── */
function initPortfolio() {
  loadPortfolio();
  initFilters();
}

function loadPortfolio() {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
    const db = firebase.firestore();
    db.collection('projects').orderBy('order', 'asc').get()
      .then(snap => {
        const projects = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderGrid(projects.length ? projects : FALLBACK_PROJECTS);
      })
      .catch(() => renderGrid(FALLBACK_PROJECTS));
  } else {
    renderGrid(FALLBACK_PROJECTS);
  }
}

function renderGrid(projects) {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;
  grid.innerHTML = '';
  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'portfolio-card';
    card.dataset.category = p.category;
    card.dataset.title = p.title;
    card.dataset.desc = p.description;
    card.dataset.img = p.src || p.thumbnail || '';
    card.dataset.isVideo = p.mediaType === 'video' ? 'true' : 'false';
    const tags = (p.tags || []).map(t => '<span class="tag">' + t + '</span>').join('');
    card.innerHTML =
      '<div class="card-thumb">' +
        (p.mediaType === 'video'
          ? '<video class="card-img" muted loop playsinline><source src="' + (p.src||'') + '" type="video/mp4"></video><div class="play-badge">▶</div>'
          : '<img class="card-img" src="' + (p.src||p.thumbnail||'') + '" alt="' + p.title + '" loading="lazy">') +
        '<div class="card-overlay"><span class="card-cat">' + (p.categoryLabel || p.category) + '</span></div>' +
      '</div>' +
      '<div class="card-body">' +
        '<h3 class="card-title">' + p.title + '</h3>' +
        '<p class="card-desc">' + p.description + '</p>' +
        '<div class="card-tags">' + tags + '</div>' +
      '</div>';
    card.addEventListener('click', () => openLightbox(p));
    grid.appendChild(card);
  });
}

function initFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.portfolio-card').forEach(c => {
        c.style.display = (f === 'all' || c.dataset.category === f) ? '' : 'none';
      });
    });
  });
}

/* ── Lightbox ── */
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const closeBtn = document.getElementById('lightboxClose');
  if (!modal) return;
  closeBtn && closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('active'); });
}

function openLightbox(project) {
  const modal = document.getElementById('lightboxModal');
  const media = document.getElementById('lightboxMedia');
  const title = document.getElementById('lightboxTitle');
  const desc  = document.getElementById('lightboxDesc');
  if (!modal || !media) return;
  if (project.mediaType === 'video') {
    media.innerHTML = '<video controls autoplay loop style="width:100%;height:100%;object-fit:contain"><source src="' + project.src + '" type="video/mp4"></video>';
  } else {
    media.innerHTML = '<img src="' + (project.src||project.thumbnail) + '" alt="' + project.title + '" style="width:100%;height:100%;object-fit:contain">';
  }
  if (title) title.textContent = project.title;
  if (desc) desc.textContent = project.description;
  modal.classList.add('active');
}

/* ── Contact Form ── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    const msg = document.getElementById('formSuccessMsg');
    btn && (btn.disabled = true, btn.textContent = 'Sending...');
    setTimeout(() => {
      if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
      if (msg) { msg.style.display = 'block'; msg.textContent = '✅ Thank you! Karim will reply shortly.'; }
      form.reset();
    }, 900);
  });
}
