import { switchToHome, switchToFavorites } from './exercises.js';

let currentPage = window.location.pathname.includes('favorites.html') ? 'favorites' : 'home';

let mobileMenu = null;
let burgerButton = null;
let closeButton = null;
let overlay = null;

export function switchPage(page) {
  if (currentPage === page) return;

  currentPage = page;
  
  const navLinks = document.querySelectorAll('.header__nav-link');
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage === page) {
      link.classList.add('header__nav-link--active');
    } else {
      link.classList.remove('header__nav-link--active');
    }
  });

  const mobileNavLinks = document.querySelectorAll('.mobile-menu__nav-link');
  mobileNavLinks.forEach(link => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage === page) {
      link.classList.add('mobile-menu__nav-link--active');
    } else {
      link.classList.remove('mobile-menu__nav-link--active');
    }
  });

  if (page === 'home') {
    switchToHome();
  } else if (page === 'favorites') {
    switchToFavorites();
  }
}

function openMobileMenu() {
  if (mobileMenu) {
    mobileMenu.classList.add('is-open');
    burgerButton.classList.add('is-hidden');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}


function closeMobileMenu() {
  if (mobileMenu) {
    mobileMenu.classList.remove('is-open');
    burgerButton.classList.remove('is-hidden');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

export function initHeader() {  
  const navLinks = document.querySelectorAll('.header__nav-link');  
  const mobileNavLinks = document.querySelectorAll('.mobile-menu__nav-link');
  
  [...navLinks, ...mobileNavLinks].forEach(link => {
    if (link.getAttribute('data-page') === currentPage) {
      link.classList.add(link.classList.contains('header__nav-link') 
        ? 'header__nav-link--active' 
        : 'mobile-menu__nav-link--active');
    }
  });
  /*navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      if (page) {
        switchPage(page);
      }
    });
  });*/
  
  mobileMenu = document.querySelector('.mobile-menu');
  burgerButton = document.querySelector('.header__burger');
  closeButton = document.querySelector('.mobile-menu__close');
  overlay = document.getElementById('overlay');
  
  if (burgerButton) {
    burgerButton.addEventListener('click', openMobileMenu);
  }
  
  if (closeButton) {
    closeButton.addEventListener('click', closeMobileMenu);
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      if (mobileMenu && mobileMenu.classList.contains('is-open')) {
        closeMobileMenu();
      }
    });
  }
  
  
  /*mobileNavLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      if (page) {
        switchPage(page);
        closeMobileMenu();
      }
    });
  });*/
  
  if (mobileMenu) {
    mobileMenu.addEventListener('click', e => {
      if (e.target === mobileMenu) {
        closeMobileMenu();
      }
    });
  }
}

export function getCurrentPage() {
  return currentPage;
}