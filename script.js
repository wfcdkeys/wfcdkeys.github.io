const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];
const filterButtons = [...document.querySelectorAll('.filter-button')];
const searchInput = document.querySelector('#resource-search');
const resourceCards = [...document.querySelectorAll('.resource-card')];
const resultCount = document.querySelector('#result-count');
const emptyState = document.querySelector('#empty-state');
const resetFilters = document.querySelector('#reset-filters');
const toast = document.querySelector('#toast');
let currentFilter = 'all';
let toastTimer;

function closeMenu() {
  siteNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '打开导航菜单');
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  siteNav.classList.toggle('open', !isOpen);
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? '打开导航菜单' : '关闭导航菜单');
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('click', (event) => {
  if (!siteNav.contains(event.target) && !menuToggle.contains(event.target)) {
    closeMenu();
  }
});

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  resourceCards.forEach((card) => {
    const matchesType = currentFilter === 'all' || card.dataset.type === currentFilter;
    const matchesQuery = !query || card.dataset.search.toLowerCase().includes(query);
    const isVisible = matchesType && matchesQuery;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  resultCount.textContent = `显示 ${visibleCount} 个资源`;
  emptyState.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
    applyFilters();
  });
});

searchInput.addEventListener('input', applyFilters);

resetFilters.addEventListener('click', () => {
  currentFilter = 'all';
  searchInput.value = '';
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === 'all';
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  applyFilters();
  searchInput.focus();
});

document.addEventListener('keydown', (event) => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;

  if (event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    searchInput.focus();
  }

  if (event.key === 'Escape') {
    closeMenu();
    if (document.activeElement === searchInput) {
      searchInput.value = '';
      applyFilters();
      searchInput.blur();
    }
  }
});

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

document.querySelectorAll('a[download]').forEach((link) => {
  link.addEventListener('click', () => showToast('正在下载 CT 表模板'));
});

const revealElements = document.querySelectorAll('.reveal');
const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -35px 0px' }) : null;

if (revealObserver) {
  revealElements.forEach((element) => revealObserver.observe(element));
}

function revealPassedElements() {
  const threshold = window.innerHeight * 0.9;
  revealElements.forEach((element) => {
    if (!element.classList.contains('visible') && element.getBoundingClientRect().top < threshold) {
      element.classList.add('visible');
      revealObserver?.unobserve(element);
    }
  });
}

window.addEventListener('scroll', revealPassedElements, { passive: true });
window.addEventListener('resize', revealPassedElements);
revealPassedElements();

const sections = document.querySelectorAll('main section[id]');

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-22% 0px -62% 0px', threshold: 0 });

  sections.forEach((section) => sectionObserver.observe(section));
}

document.querySelector('#current-year').textContent = new Date().getFullYear();
applyFilters();
