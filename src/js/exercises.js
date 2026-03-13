import { openExerciseModal } from './exercise-modal.js';
import { getFavorites } from './favorites.js';
import { showGlobalNotification } from './global-notification.js';

let currentFilter = 'Muscles';
let currentPage = 1;
let currentCategory = null;
let currentSearchKeyword = '';
let currentMode = 'home';
const ITEMS_PER_PAGE = 10;

const getItemsPerPage = (isExercise = false) => {
  const isMobile = window.innerWidth < 768;
  if (isExercise) {    
    return isMobile ? 8 : 10;
  }
  return isMobile ? 9 : 12;
};

function createOptimizedImage(originalUrl, alt, className = '') {
  if (!originalUrl) return '';
  
  const proxyBase = 'https://wsrv.nl/?url=';

  const sm = `${proxyBase}${originalUrl}&w=150&output=webp&q=75`;
  
  const md = `${proxyBase}${originalUrl}&w=350&output=webp&q=75`;
  
  const lg = `${proxyBase}${originalUrl}&w=700&output=webp&q=80`;

  return `
    <img 
      class="${className}" 
      src="${md}" 
      srcset="${sm} 150w, ${md} 350w, ${lg} 700w"
      sizes="(max-width: 767px) 150px, (max-width: 1440px) 350px, 350px"
      alt="${alt}" 
      loading="lazy" 
      decoding="async"
    />
  `;
}

function showSearchField() {
  const searchField = document.getElementById('js-exercises-search');
  if (searchField) {
    searchField.style.display = 'flex';
  }
}

function hideSearchField() {
  const searchField = document.getElementById('js-exercises-search');
  const searchInput = document.getElementById('js-exercises-search-input');
  if (searchField) {
    searchField.style.display = 'none';
  }
  if (searchInput) {
    searchInput.value = '';
  }
  currentSearchKeyword = '';
}

export function initCardsEventListener() {
  const cardsContainer = document.querySelector(
    '.exercises__content__main__cards'
  );

  if (!cardsContainer) {
    return;
  }

  cardsContainer.addEventListener('click', event => {
    const deleteBtn = event.target.closest('.exercises__content__main__cards-item-delete-btn');
    if (deleteBtn) {
      const exerciseId = deleteBtn.getAttribute('data-exercise-id');
      import('./favorites.js').then(m => {
        m.toggleFavorite(exerciseId); // Удаляем
        loadFavoritesExercises(currentPage); // Перезагружаем список
      });
      return;
    }
    const startBtn = event.target.closest('.exercises__content__main__cards-item-start-btn');
    
    if (startBtn) {
      const card = startBtn.closest('.exercises__content__main__cards-item');
      const exerciseId = card?.getAttribute('data-exercise-id');
      
      if (exerciseId) {
        openExerciseModal(exerciseId);
        return;
      }
    }

    const categoryCard = event.target.closest('.exercises__content__main__cards-item');
    
    if (categoryCard && !categoryCard.classList.contains('exercises__content__main__cards-item--exercise')) {
      const categoryName = categoryCard.getAttribute('data-category-name');
      if (categoryName) {
        loadExercisesByCategory(categoryName);      
        return;
      }
    }
  });
}

export function initHashtags() {
  const hashtagsContainer = document.querySelector('.home__hashtags');
  if (!hashtagsContainer) return;

  hashtagsContainer.addEventListener('click', event => {
    const targetBtn = event.target.closest('button');
    if (!targetBtn) return;

    const keyword = targetBtn.getAttribute('data-keyword') || targetBtn.textContent.replace('#', '').trim();

    if (currentMode !== 'home') {
        const homeLink = document.querySelector('.header__nav-link[data-page="home"]');
        if (homeLink) {
            homeLink.click();
        } else {
            switchToHome();
        }
    }
    
    const searchInput = document.getElementById('js-exercises-search-input');

    if (searchInput) {
      searchInput.value = keyword;
    }

    const exercisesContent = document.querySelector('.exercises__content');
    if (exercisesContent) {
        exercisesContent.scrollIntoView({ behavior: 'smooth' });
    }

    if (currentCategory) {
      loadExercisesByCategory(currentCategory, 1, keyword);
    } else {      
      showGlobalNotification('Please select a category (e.g., abs) to start searching.', 'error');
    }
  });
}

function createExerciseCard(exercise) {
  return `
    <div class="exercises__content__main__cards-item exercises__content__main__cards-item--category" data-category-name="${exercise.name}">
      <div class="exercises__content__main__cards-item--category-image">
        ${createOptimizedImage(exercise.imgURL, `${exercise.name} exercise`)}
        <div class="exercises__content__main__cards-item--category-overlay">
          <div class="exercises__content__main__cards-item--category-overlay-name">${exercise.name}</div>
          <div class="exercises__content__main__cards-item--category-overlay-category">${exercise.filter}</div>
        </div>
      </div>
    </div>
  `;
}

function createExerciseItemCard(exercise) {
  const rating = exercise.rating || 0;
  const burnedCalories = exercise.burnedCalories || 0;
  const time = exercise.time || 0;
  const bodyPart = exercise.bodyPart || '';
  const target = exercise.target || '';
  const exerciseId = exercise._id || '';

  const headerActionContent = currentMode === 'favorites' 
    ? `
      <button class="exercises__content__main__cards-item-delete-btn" data-exercise-id="${exerciseId}" aria-label="Remove from favorites">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.6667 4.00004V3.46671C10.6667 2.71997 10.6667 2.3466 10.5213 2.06139C10.3935 1.8105 10.1895 1.60653 9.93865 1.4787C9.65344 1.33337 9.28007 1.33337 8.53333 1.33337H7.46667C6.71993 1.33337 6.34656 1.33337 6.06135 1.4787C5.81046 1.60653 5.60649 1.8105 5.47866 2.06139C5.33333 2.3466 5.33333 2.71997 5.33333 3.46671V4.00004M6.66667 7.66671V11M9.33333 7.66671V11M2 4.00004H14M12.6667 4.00004V11.4667C12.6667 12.5868 12.6667 13.1469 12.4487 13.5747C12.2569 13.951 11.951 14.257 11.5746 14.4487C11.1468 14.6667 10.5868 14.6667 9.46667 14.6667H6.53333C5.41323 14.6667 4.85318 14.6667 4.42535 14.4487C4.04903 14.257 3.74307 13.951 3.55132 13.5747C3.33333 13.1469 3.33333 12.5868 3.33333 11.4667V4.00004" stroke="#242424" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `
    : `
      <div class="exercises__content__main__cards-item-rating">
        <span class="exercises__content__main__cards-item-rating-value">${rating.toFixed(1)}</span>
        <svg class="exercises__content__main__cards-item-rating-star" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 0L11.0206 6.21885L17.5595 6.21885L12.2694 10.0623L14.2901 16.2812L9 12.4377L3.70993 16.2812L5.73056 10.0623L0.440492 6.21885L6.97937 6.21885L9 0Z" fill="#EEA10C"/>
        </svg>
      </div>
    `;

  return `
    <div class="exercises__content__main__cards-item exercises__content__main__cards-item--exercise" data-exercise-id="${exerciseId}">
      <div class="exercises__content__main__cards-item-header">
        <div class="exercises__content__main__cards-item-header-left">
          <button class="exercises__content__main__cards-item-workout-btn">WORKOUT</button>
          ${headerActionContent}
        </div>
        <button class="exercises__content__main__cards-item-start-btn">
          Start
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.75 4.5L11.25 9L6.75 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="exercises__content__main__cards-item-body">
        <div class="exercises__content__main__cards-item-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#242424"/>
            <path d="M18.8234 8.72544C18.6138 8.47504 18.2403 8.44212 17.9899 8.65092L16.349 10.0294L15.5943 8.15967C15.5675 8.08949 15.5267 8.03057 15.4799 7.97859C15.3257 7.63549 15.058 7.34091 14.6889 7.17023C14.5286 7.09745 14.3631 7.05846 14.1977 7.0394C14.1613 7.02034 14.1283 6.99521 14.0868 6.98222L11.199 6.17732C11.037 6.13314 10.8741 6.16173 10.7407 6.2397C10.5821 6.29342 10.4461 6.40865 10.3811 6.57587L9.29378 9.37178C9.17594 9.67589 9.3267 10.019 9.63168 10.1386C9.93492 10.2564 10.2789 10.1048 10.3976 9.79978L11.316 7.43882L12.6312 7.80444C12.5991 7.85643 12.5645 7.90495 12.5385 7.9604L10.8524 11.6149C10.8282 11.6686 10.8152 11.7232 10.7979 11.7787L8.7488 15.214L5.31955 16.3611C4.9314 16.6514 4.84909 17.1981 5.13587 17.5862C5.42439 17.9752 5.97282 18.0575 6.36011 17.7708L9.86907 16.5621C9.97651 16.4841 10.0545 16.3819 10.1134 16.2719C10.1576 16.2251 10.2078 16.1878 10.2416 16.1298L11.4633 14.0816L13.6319 15.9296L11.3116 18.5445C10.9919 18.9049 11.024 19.4603 11.3862 19.7791C11.7474 20.1005 12.3011 20.0667 12.6225 19.7046L15.5181 16.4426C15.6082 16.342 15.6619 16.2259 15.6983 16.1047C15.7199 16.0388 15.7199 15.9704 15.7251 15.9019C15.7251 15.8673 15.7381 15.8361 15.7355 15.804C15.7277 15.5649 15.6307 15.3327 15.4349 15.1672L13.4395 13.4656C13.5834 13.3287 13.7055 13.1658 13.7939 12.9743L15.0866 10.1749L15.5007 11.2779C15.5181 11.3758 15.551 11.472 15.6203 11.5525C15.6827 11.627 15.7624 11.6764 15.8473 11.7111C15.856 11.7154 15.8664 11.7163 15.8768 11.7189C15.9305 11.7379 15.9851 11.7561 16.0414 11.7587C16.1081 11.7648 16.1757 11.7561 16.2441 11.7371C16.2459 11.7362 16.2467 11.7362 16.2467 11.7362C16.2649 11.7319 16.2831 11.7353 16.3013 11.7275C16.3975 11.6912 16.4711 11.6296 16.5344 11.5577L18.8893 9.55892C19.1397 9.34838 19.034 8.97583 18.8234 8.72544Z" fill="#F4F4F4"/>
            <path d="M15.8447 7.30102C16.7563 7.30102 17.4952 6.56206 17.4952 5.65051C17.4952 4.73896 16.7563 4 15.8447 4C14.9332 4 14.1942 4.73896 14.1942 5.65051C14.1942 6.56206 14.9332 7.30102 15.8447 7.30102Z" fill="#F4F4F4"/>
          </svg>
        </div>
        <h3 class="exercises__content__main__cards-item-title">${
          exercise.name
        }</h3>
      </div>
      <div class="exercises__content__main__cards-item-footer">
        <div class="exercises__content__main__cards-item-info">
          <span class="exercises__content__main__cards-item-info-label">Burned calories:</span>
          <span class="exercises__content__main__cards-item-info-value">${burnedCalories} / ${time} min</span>
        </div>
        <div class="exercises__content__main__cards-item-info">
          <span class="exercises__content__main__cards-item-info-label">Body part:</span>
          <span class="exercises__content__main__cards-item-info-value">${bodyPart}</span>
        </div>
        <div class="exercises__content__main__cards-item-info">
          <span class="exercises__content__main__cards-item-info-label">Target:</span>
          <span class="exercises__content__main__cards-item-info-value">${target}</span>
        </div>
      </div>
    </div>
  `;
}

function renderExerciseCards(exercises) {
  const cardsContainer = document.querySelector(
    '.exercises__content__main__cards'
  );

  if (!cardsContainer) {
    return;
  }

  cardsContainer.classList.remove('exercises__content__main__cards--exercises');

  cardsContainer.innerHTML = '';

  exercises.forEach(exercise => {
    const cardHTML = createExerciseCard(exercise);
    cardsContainer.insertAdjacentHTML('beforeend', cardHTML);
  });
}

function renderExerciseItemCards(exercises) {
  const cardsContainer = document.querySelector(
    '.exercises__content__main__cards'
  );

  if (!cardsContainer) {
    return;
  }

  cardsContainer.classList.add('exercises__content__main__cards--exercises');

  cardsContainer.innerHTML = '';

  exercises.forEach(exercise => {
    const cardHTML = createExerciseItemCard(exercise);
    cardsContainer.insertAdjacentHTML('beforeend', cardHTML);
  });
}

function renderEmptyState() {
  const cardsContainer = document.querySelector(
    '.exercises__content__main__cards'
  );

  if (!cardsContainer) {
    return;
  }

  cardsContainer.classList.add('exercises__content__main__cards--exercises');

  cardsContainer.innerHTML = '';

  const emptyStateHTML = `
    <div class="exercises__content__main__empty-state">
      <p class="exercises__content__main__empty-state-text">
        Unfortunately, no results were found. You may want to consider other search options.
      </p>
    </div>
  `;

  cardsContainer.insertAdjacentHTML('beforeend', emptyStateHTML);
}

export function updateBreadcrumbs(categoryName = null) {
  const breadcrumbsContainer = document.getElementById(
    'js-exercises-breadcrumbs'
  );

  if (!breadcrumbsContainer) {
    return;
  }

  breadcrumbsContainer.innerHTML = '';

  if (currentMode === 'favorites') {
    const favoritesTitle = document.createElement('button');
    favoritesTitle.className =
      'exercises__content__header-breadcrumbs-item exercises__content__header-breadcrumbs-item--active';
    favoritesTitle.textContent = 'Favorites';
    favoritesTitle.setAttribute('data-breadcrumb', 'favorites');
    breadcrumbsContainer.appendChild(favoritesTitle);
    return;
  }

  const exercisesBtn = document.createElement('button');
  exercisesBtn.className = 'exercises__content__header-breadcrumbs-item';
  exercisesBtn.textContent = 'Exercises';
  exercisesBtn.setAttribute('data-breadcrumb', 'exercises');

  if (!categoryName) {
    exercisesBtn.classList.add(
      'exercises__content__header-breadcrumbs-item--active'
    );
  }

  exercisesBtn.addEventListener('click', () => {
    currentCategory = null;
    currentPage = 1;
    loadExerciseCards(currentFilter, currentPage);
  });

  breadcrumbsContainer.appendChild(exercisesBtn);

  if (categoryName) {
    const separator = document.createElement('span');
    separator.className = 'exercises__content__header-breadcrumbs-separator';
    separator.textContent = '/';
    breadcrumbsContainer.appendChild(separator);

    const categoryBtn = document.createElement('button');
    categoryBtn.className =
      'exercises__content__header-breadcrumbs-item exercises__content__header-breadcrumbs-item--active';
    categoryBtn.textContent = categoryName;
    breadcrumbsContainer.appendChild(categoryBtn);
  }
}

function renderPagination(totalPages, page = 1) {
  const paginationContainer = document.querySelector(
    '.exercises__content__pagination'
  );

  if (!paginationContainer) {
    return;
  }

  paginationContainer.innerHTML = '';
  
  if (totalPages <= 1) {
    return;
  }

  const isMobile = window.innerWidth < 768;

  const goToPage = pageNumber => {
    currentPage = pageNumber;
    if (currentMode === 'favorites') {
      loadFavoritesExercises(pageNumber);
    } else if (currentCategory) {
      loadExercisesByCategory(currentCategory, pageNumber, currentSearchKeyword);
    } else {
      loadExerciseCards(currentFilter, pageNumber);
    }
  };

  const createArrow = (html, isDisabled, onClick) => {
    const btn = document.createElement('button');
    btn.className = 'exercises__content__pagination-arrow';
    btn.innerHTML = html;
    btn.disabled = isDisabled;
    btn.addEventListener('click', onClick);
    return btn;
  };

  const createPageBtn = num => {
    const btn = document.createElement('button');
    btn.className = 'exercises__content__pagination-page';
    btn.textContent = num;
    if (num === page) btn.classList.add('exercises__content__pagination-page--active');
    btn.addEventListener('click', () => goToPage(num));
    return btn;
  };

  const createEllipsis = () => {
    const span = document.createElement('span');
    span.className = 'exercises__content__pagination-ellipsis';
    span.textContent = '...';
    return span;
  }

  
  paginationContainer.appendChild(createArrow('&laquo;', page === 1, () => goToPage(1)));
  paginationContainer.appendChild(createArrow('&lsaquo;', page === 1, () => goToPage(page - 1)));

  const pages = [];

  if (isMobile) {
    // СТРОГАЯ ЛОГИКА ДЛЯ МОБИЛКИ (максимум 3 элемента пагинации)
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page === 1) {
        // Если мы на первой странице: [1, ..., последняя]
        pages.push(1);
        pages.push('...');
        pages.push(totalPages);
      } else if (page === totalPages) {
        // Если мы на последней: [1, ..., последняя]
        pages.push(1);
        pages.push('...');
        pages.push(totalPages);
      } else {
        // Если где-то посередине: [1, текущая, последняя]
        // Это дает ровно 3 кликабельных элемента
        pages.push(1);
        pages.push(page);
        pages.push(totalPages);
      }
    }
  } else {
    pages.push(1);
    if (totalPages <= 7) {
      for (let i = 2; i <= totalPages; i++) {
          pages.push(i);
      }
    } else {
      let leftBound = page - 1;
      let rightBound = page + 1;

      if (page < 5) {
          leftBound = 2;
          rightBound = 5;
      }

      if (page > totalPages - 4) {
          leftBound = totalPages - 4;
          rightBound = totalPages - 1;
      }

      if (leftBound > 2) {
          pages.push('...');
      }

      for (let i = leftBound; i <= rightBound; i++) {
          if (i > 1 && i < totalPages) {
              pages.push(i);
          }
      }

      if (rightBound < totalPages - 1) {
          pages.push('...');
      }
      
      if (totalPages > 1) {
          pages.push(totalPages);
      }
    }
  }

  pages.forEach(item => {
    if (item === '...') {
        paginationContainer.appendChild(createEllipsis());
    } else {
        paginationContainer.appendChild(createPageBtn(item));
    }
  });

  paginationContainer.appendChild(createArrow('&rsaquo;', page === totalPages, () => goToPage(page + 1)));
  paginationContainer.appendChild(createArrow('&raquo;', page === totalPages, () => goToPage(totalPages)));
}

export function loadExerciseCards(filter, page = 1) {
  currentFilter = filter;
  currentPage = page;

  hideSearchField();

  const limit = getItemsPerPage(false);
  const encodedFilter = encodeURIComponent(filter);
  const url = `https://your-energy.b.goit.study/api/filters?filter=${encodedFilter}&page=${page}&limit=${limit}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const exercises = data.results || data.exercises || data || [];

      const totalPages =
        data.totalPages || data.total_pages || data.pageCount || 1;

      if (Array.isArray(exercises) && exercises.length > 0) {
        currentCategory = null;
        updateBreadcrumbs(null);
        renderExerciseCards(exercises);
        renderPagination(totalPages, page);
      } else {
        updateBreadcrumbs(null);
        renderPagination(1, 1);
      }
    })
}

export function loadExercisesByCategory(
  categoryName,
  page = 1,
  keyword = currentSearchKeyword
) {
  currentCategory = categoryName;
  currentPage = page;
  currentSearchKeyword = keyword;

  showSearchField();

  let paramName = '';
  if (currentFilter === 'Muscles') {
    paramName = 'muscles';
  } else if (currentFilter === 'Body parts') {
    paramName = 'bodypart';
  } else if (currentFilter === 'Equipment') {
    paramName = 'equipment';
  }

  const limit = getItemsPerPage(true);
  const encodedCategory = encodeURIComponent(categoryName);
  let url = `https://your-energy.b.goit.study/api/exercises?${paramName}=${encodedCategory}&page=${page}&limit=${limit}`;

  if (keyword && keyword.trim() !== '') {
    const encodedKeyword = encodeURIComponent(keyword.trim());
    url += `&keyword=${encodedKeyword}`;
  }

  fetch(url)
    .then(response => {
      if (response.status === 409) return { results: [], totalPages: 0 };
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    })
    .then(data => {
      const exercises = data.results || [];

      const totalPages = data.totalPages || 1;

      updateBreadcrumbs(categoryName);

      if (Array.isArray(exercises) && exercises.length > 0) {
        renderExerciseItemCards(exercises);
        renderPagination(totalPages, page);
      } else {
        renderEmptyState();
        const paginationContainer = document.querySelector(
          '.exercises__content__pagination'
        );
        if (paginationContainer) {
          paginationContainer.innerHTML = '';
        }
      }
    })
}

export function initSearch() {
  const searchContainer = document.getElementById('js-exercises-search');
  const searchInput = document.getElementById('js-exercises-search-input');

  if (!searchContainer || !searchInput) return;

  const handleSearchSubmit = () => {
    const keyword = searchInput.value.trim().toLowerCase();

    if (currentCategory) {
      loadExercisesByCategory(currentCategory, 1, keyword);
    } else {
        showGlobalNotification('Please select a category first', 'error');
    }
  };

  searchInput.addEventListener('input', (event) => {
    const text = event.target.value.trim();
        
    if (text === '' && currentCategory) {
      loadExercisesByCategory(currentCategory, 1, '');
    }
  });

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSearchSubmit();
    }
  });

  const searchIcon = searchContainer.querySelector('.exercises__content__header-search-icon');
  if (searchIcon) {
    searchIcon.addEventListener('click', handleSearchSubmit);
  } 
}

function renderFavoritesEmptyState() {
  const cardsContainer = document.querySelector(
    '.exercises__content__main__cards'
  );

  if (!cardsContainer) {
    return;
  }

  
  cardsContainer.classList.add('exercises__content__main__cards--exercises');

  cardsContainer.innerHTML = '';

  const emptyStateHTML = `
    <div class="exercises__content__main__empty-state">
      <p class="exercises__content__main__empty-state-text">
        It appears that you haven't added any exercises to your favorites yet. 
        To get started, you can add exercises that you like to your favorites 
        for easier access in the future.
      </p>
    </div>
  `;

  cardsContainer.insertAdjacentHTML('beforeend', emptyStateHTML);
}

export function loadFavoritesExercises() {
  const favoriteIds = getFavorites();
  const cardsContainer = document.getElementById('favorites-cards-root') || document.querySelector('.exercises__content__main__cards');
  
  if (!cardsContainer) return;
  
  if (favoriteIds.length === 0) {
    renderFavoritesEmptyState();    
    return;
  }  
  
  const promises = favoriteIds.map(id =>
    fetch(`https://your-energy.b.goit.study/api/exercises/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch exercise');
        }
        return response.json();
      })
      .catch(error => {
        return null;
      })
  );

  Promise.all(promises).then(exercises => {
    const validExercises = exercises.filter(ex => ex !== null);

    if (validExercises.length > 0) {
      cardsContainer.classList.add('exercises__content__main__cards--exercises');
      cardsContainer.innerHTML = validExercises.map(ex => createExerciseItemCard(ex)).join('');

      const paginationContainer = document.querySelector('.exercises__content__pagination');
      if (paginationContainer) paginationContainer.innerHTML = '';
    } else {
      renderFavoritesEmptyState();
    }
  });
}

export function switchToHome() {
  currentMode = 'home';
  currentCategory = null;
  currentSearchKeyword = '';

  // Показуємо фільтри
  const filtersContainer = document.querySelector(
    '.exercises__content__header-filters'
  );
  if (filtersContainer) {
    filtersContainer.style.display = 'flex';
  }

  // Видаляємо клас favorites з контейнера
  const contentContainer = document.querySelector('.exercises__content');
  if (contentContainer) {
    contentContainer.classList.remove('exercises__content--favorites');
  }

  // Завантажуємо стандартні картки
  loadExerciseCards(currentFilter, 1);
}

export function switchToFavorites() {
  currentMode = 'favorites';  

  const filtersContainer = document.querySelector('.exercises__content__header-filters');
  if (filtersContainer) {
    filtersContainer.style.display = 'none';
  }

  hideSearchField();

  const contentContainer = document.querySelector('.exercises__content');
  if (contentContainer) {
    contentContainer.classList.add('exercises__content--favorites');
  }
  initCardsEventListener();
  loadFavoritesExercises();
}

function debounce(func, delay = 25) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

const handleResize = debounce(() => {
  if (currentMode === 'favorites') {
    loadFavoritesExercises(currentPage);
  } else if (currentCategory) {
    loadExercisesByCategory(currentCategory, currentPage, currentSearchKeyword);
  } else {
    loadExerciseCards(currentFilter, currentPage);
  }
});

window.addEventListener('resize', handleResize);