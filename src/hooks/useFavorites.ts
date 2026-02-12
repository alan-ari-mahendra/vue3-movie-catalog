import { ref, computed } from 'vue';

const FAVORITES_KEY = 'movie_favorites';

// Reactive state yang di-share across components
const favoriteIds = ref<Set<string>>(new Set());

// Load favorites dari localStorage saat pertama kali
const loadFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      favoriteIds.value = new Set(parsed);
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
};

// Save favorites ke localStorage
const saveFavorites = () => {
  try {
    const array = Array.from(favoriteIds.value);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(array));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

// Initialize saat pertama kali import
loadFavorites();

export const useFavorites = () => {
  // Check if movie is favorited
  const isFavorite = (movieId: string) => {
    return favoriteIds.value.has(movieId);
  };

  // Toggle favorite status
  const toggleFavorite = (movieId: string) => {
    if (favoriteIds.value.has(movieId)) {
      favoriteIds.value.delete(movieId);
    } else {
      favoriteIds.value.add(movieId);
    }
    
    // Trigger reactivity
    favoriteIds.value = new Set(favoriteIds.value);
    
    // Save to localStorage
    saveFavorites();
  };

  // Add to favorites
  const addFavorite = (movieId: string) => {
    if (!favoriteIds.value.has(movieId)) {
      favoriteIds.value.add(movieId);
      favoriteIds.value = new Set(favoriteIds.value);
      saveFavorites();
    }
  };

  // Remove from favorites
  const removeFavorite = (movieId: string) => {
    if (favoriteIds.value.has(movieId)) {
      favoriteIds.value.delete(movieId);
      favoriteIds.value = new Set(favoriteIds.value);
      saveFavorites();
    }
  };

  // Get total favorites count
  const favoritesCount = computed(() => favoriteIds.value.size);

  // Get all favorite IDs as array
  const allFavoriteIds = computed(() => Array.from(favoriteIds.value));

  // Clear all favorites
  const clearAllFavorites = () => {
    favoriteIds.value.clear();
    favoriteIds.value = new Set(favoriteIds.value);
    saveFavorites();
  };

  return {
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    favoritesCount,
    allFavoriteIds,
    clearAllFavorites,
  };
};