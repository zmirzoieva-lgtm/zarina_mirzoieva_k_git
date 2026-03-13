import { openRatingModal } from './rating-modal.js';
import {
  isFavorite,
  toggleFavorite,
} from './favorites.js';
import { getCurrentPage } from './header.js';
import { loadFavoritesExercises } from './exercises.js';

let currentExerciseIdForRating = null;

function closeExerciseModal() {
  const modal = document.getElementById('js-exercise-modal');
  if (!modal) return;

  modal.classList.remove('exercise-modal--open');
  document.body.style.overflow = '';
}

export function openExerciseModal(exerciseId) {
  const modal = document.getElementById('js-exercise-modal');
  if (!modal) return;

  currentExerciseIdForRating = exerciseId;

  modal.classList.add('exercise-modal--open');
  document.body.style.overflow = 'hidden';

  const image = document.getElementById('js-exercise-modal-image');
  const title = document.getElementById('js-exercise-modal-title');
  const ratingValue = document.querySelector('.exercise-modal__rating-value');
  const ratingStars = document.querySelector('.exercise-modal__rating-stars');
  const target = document.getElementById('js-exercise-modal-target');
  const bodyPart = document.getElementById('js-exercise-modal-body-part');
  const equipment = document.getElementById('js-exercise-modal-equipment');
  const popular = document.getElementById('js-exercise-modal-popular');
  const calories = document.getElementById('js-exercise-modal-calories');
  const time = document.getElementById('js-exercise-modal-time');
  const description = document.getElementById('js-exercise-modal-description');

  if (title) title.textContent = 'Loading...';
  if (ratingValue) ratingValue.textContent = '0.0';
  if (target) target.textContent = '';
  if (bodyPart) bodyPart.textContent = '';
  if (equipment) equipment.textContent = '';
  if (popular) popular.textContent = '0';
  if (calories) calories.textContent = '0';
  if (time) time.textContent = '/0 min';
  if (description) description.textContent = '';
  if (image) image.src = '';

  fetch(`https://your-energy.b.goit.study/api/exercises/${exerciseId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch exercise details');
      }
      return response.json();
    })
    .then(exercise => {
      if (image) image.src = exercise.gifUrl || '';
      if (title) title.textContent = exercise.name || '';
      if (target) target.textContent = exercise.target || '-';
      if (bodyPart) bodyPart.textContent = exercise.bodyPart || '-';
      if (equipment) equipment.textContent = exercise.equipment || '-';
      if (popular) popular.textContent = exercise.popularity || 0;
      if (calories) calories.textContent = exercise.burnedCalories || 0;
      if (time) time.textContent = `/${exercise.time || 0} min`;
      if (description) description.textContent = exercise.description || '';

      if (ratingValue) {
        ratingValue.textContent = (exercise.rating || 0).toFixed(1);
      }

      if (ratingStars) {
        const stars = ratingStars.querySelectorAll(
          '.exercise-modal__rating-star'
        );
        const rating = Math.round(exercise.rating || 0);

        stars.forEach((star, index) => {
          const path = star.querySelector('path');
          if (index < rating) {
            path.setAttribute('fill', '#EEA10C');
            path.removeAttribute('stroke');
            path.removeAttribute('stroke-width');
          } else {
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', 'rgba(255,255,255,0.3)');
            path.setAttribute('stroke-width', '1.5');
          }
        });
      }

      updateFavoriteButton(exerciseId);

      
      const ratingBtn = document.getElementById('js-exercise-modal-rating-btn');
      if (ratingBtn) {
        const newRatingBtn = ratingBtn.cloneNode(true);
        ratingBtn.parentNode.replaceChild(newRatingBtn, ratingBtn);

        newRatingBtn.addEventListener('click', () => {
          closeExerciseModal();
          openRatingModal(exerciseId);
        });
      }
    })
    .catch(error => {
      if (title) title.textContent = 'Error loading exercise';
      if (description)
        description.textContent =
          'Failed to load exercise details. Please try again later.';
    });
}

function updateFavoriteButton(exerciseId) {  
  const favoriteBtn = document.getElementById('js-exercise-modal-favorites');
  if (!favoriteBtn) return;

  const isInFavorites = isFavorite(exerciseId);
  const btnText = favoriteBtn.querySelector('span');
  const btnIconContainer = favoriteBtn.querySelector('svg');

  if (isInFavorites) {
    favoriteBtn.classList.add('active');
    if (btnText) btnText.textContent = 'Remove from favorites';
    
    if (btnIconContainer) {
      btnIconContainer.setAttribute('viewBox', '0 0 20 20');
      btnIconContainer.innerHTML = `
        <path d="M13.3333 4.99996V4.33329C13.3333 3.39987 13.3333 2.93316 13.1517 2.57664C12.9919 2.26304 12.7369 2.00807 12.4233 1.84828C12.0668 1.66663 11.6001 1.66663 10.6667 1.66663H9.33333C8.39991 1.66663 7.9332 1.66663 7.57668 1.84828C7.26308 2.00807 7.00811 2.26304 6.84832 2.57664C6.66667 2.93316 6.66667 3.39987 6.66667 4.33329V4.99996M8.33333 9.58329V13.75M11.6667 9.58329V13.75M2.5 4.99996H17.5M15.8333 4.99996V14.3333C15.8333 15.7334 15.8333 16.4335 15.5608 16.9683C15.3212 17.4387 14.4683 17.8211 14.4683 18.0608C13.9335 18.3333 13.2335 18.3333 11.8333 18.3333H8.16667C6.76654 18.3333 6.06647 18.3333 5.53169 18.0608C5.06129 17.8211 4.67883 17.4387 4.43915 16.9683C4.16667 16.4335 4.16667 15.7334 4.16667 14.3333V4.99996" 
        stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    }
  } else {
    favoriteBtn.classList.remove('active');
    if (btnText) btnText.textContent = 'Add to favorites';
    
    if (btnIconContainer) {
      btnIconContainer.setAttribute('viewBox', '0 0 24 24');
      btnIconContainer.innerHTML = `
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
      `;
    }
  }
}

export { closeExerciseModal };

export function initExerciseModal() {
  const modalCloseBtn = document.getElementById('js-exercise-modal-close');
  const modal = document.getElementById('js-exercise-modal');
  const modalOverlay = modal?.querySelector('.exercise-modal__overlay');

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeExerciseModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeExerciseModal);
  }

  const favoriteBtn = document.getElementById('js-exercise-modal-favorites');
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', () => {
      const exerciseId = currentExerciseIdForRating;
      if (!exerciseId) return;

      const wasAdded = toggleFavorite(exerciseId);
      updateFavoriteButton(exerciseId);

      if (!wasAdded && getCurrentPage() === 'favorites') {
        closeExerciseModal();
        loadFavoritesExercises();
      }
    });
  }
}