import './css/main.scss';

import {
  loadExerciseCards,
  updateBreadcrumbs,
  initSearch,
  initCardsEventListener,
  initHashtags,
  switchToFavorites,
} from './js/exercises.js';
import { initExerciseModal, closeExerciseModal } from './js/exercise-modal.js';
import { initRatingModal, closeRatingModal } from './js/rating-modal.js';
import {
  initGlobalNotification,
  showGlobalNotification,
} from './js/global-notification.js';
import {
  showFieldError,
  hideFieldError,
  validateEmail,
} from './js/form-validation.js';
import { initFooterSubscription } from './js/email-validation.js';
import { initHeader } from './js/header.js';
import { displayQuote } from './js/quote.js';


displayQuote();


document.addEventListener('DOMContentLoaded', () => {
  initExerciseModal();
  initRatingModal();
  initGlobalNotification();
  initHeader();  
  initFooterSubscription();

  const isFavoritesPage = window.location.pathname.includes('favorites.html');

  if (isFavoritesPage) {    
    switchToFavorites(); 
  } else {
  initSearch();
  initCardsEventListener();
  initHashtags();
  loadExerciseCards('Muscles', 1);

  const filterButtons = document.querySelectorAll(
    '.exercises__content__header-filters-item'
  );

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {      
      filterButtons.forEach(btn =>
        btn.classList.remove('exercises__content__header-filters-item--active')
      );

      button.classList.add('exercises__content__header-filters-item--active');

      const filter = button.getAttribute('data-filter');
      updateBreadcrumbs(null);

      loadExerciseCards(filter, 1);
    });
  });
}  
});