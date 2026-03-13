const FAVORITES_KEY = 'favorites';

export function getFavorites() {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    return [];
  }
}

export function addToFavorites(exerciseId) {
  try {
    const favorites = getFavorites();
    if (!favorites.includes(exerciseId)) {
      favorites.push(exerciseId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export function removeFromFavorites(exerciseId) {
  try {
    const favorites = getFavorites();
    const filteredFavorites = favorites.filter(id => id !== exerciseId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filteredFavorites));
    return true;
  } catch (error) {
    return false;
  }
}

export function isFavorite(exerciseId) {
  const favorites = getFavorites();
  return favorites.includes(exerciseId);
}

export function toggleFavorite(exerciseId) {
  if (isFavorite(exerciseId)) {
    removeFromFavorites(exerciseId);
    return false; 
  } else {
    addToFavorites(exerciseId);
    return true; 
  }
}


export function renderEmptyMessage() {
  const container = document.getElementById('favorites-cards-root');
  if (!container) return;

  container.innerHTML = `
    <div class="favorites-empty-container">
      <p class="favorites-empty-text">
        It appears that you haven't added any exercises to your favorites yet. 
        To get started, you can add exercises that you like to your favorites for easier access in the future.
      </p>
    </div>
  `;
}