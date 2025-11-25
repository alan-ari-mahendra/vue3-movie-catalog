<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Star, Heart, Play, Search as SearchIcon } from 'lucide-vue-next';
import MovieDetailModal from '../components/MovieDetailModal.vue';
import { useFavorites } from '../hooks/useFavorites';
import { useSearchMovies } from '../api/searchMovie';

const route = useRoute();

// Search query from URL
const searchQuery = computed(() => (route.query.q as string) || '');

// API call
const { data: searchResults, isLoading } = useSearchMovies({
  Title: searchQuery,
});

// States
const allMovies = ref([]);
const hoveredMovieId = ref<string | null>(null);
const selectedMovie = ref(null);
const showModal = ref(false);
const heroBanner = ref(null);
const loadedImages = ref<Record<string, boolean>>({});
const isBannerLoaded = ref(false);

const isFirstLoading = computed(() => isLoading.value && allMovies.value.length === 0);
const hasResults = computed(() => allMovies.value.length > 0);

// Favorites
const { isFavorite, toggleFavorite } = useFavorites();

// Mock data generator
const generateMockMovie = (movie) => ({
  ...movie,
  rating: (7 + Math.random() * 2.5).toFixed(1),
  description: 'A mind-bending thriller that explores the depths of human consciousness and reality. An epic journey through time and space that will leave you questioning everything.',
  duration: '2h 28m',
  cast: ['Leonardo DiCaprio', 'Tom Hardy', 'Ellen Page', 'Joseph Gordon-Levitt'],
  genres: ['Action', 'Sci-Fi', 'Thriller']
});

// Watch search results
watch(searchResults, () => {
  if (!searchResults.value?.data) return;

  allMovies.value = searchResults.value.data.map(movie => generateMockMovie(movie));

  // Set hero banner to first result
  if (allMovies.value.length > 0) {
    heroBanner.value = allMovies.value[0];
  } else {
    heroBanner.value = null;
  }
});

const handleBannerLoaded = () => {
  isBannerLoaded.value = true;
};

const handleImageLoaded = (id: string) => {
  loadedImages.value[id] = true;
};

const handleMovieClick = (movie) => {
  selectedMovie.value = movie;
  showModal.value = true;
  heroBanner.value = movie;
};

const handleToggleFavorite = (movieId: string, event: Event) => {
  event.stopPropagation();
  toggleFavorite(movieId);
};
</script>

<template>
  <div class="search-list">
    <!-- HERO SKELETON -->
    <section v-if="isFirstLoading" class="hero hero-skeleton">
      <div class="hero-skeleton-bg"></div>

      <div class="hero-skeleton-content">
        <div class="sk-title"></div>
        <div class="sk-desc"></div>
        <div class="sk-btns">
          <div class="sk-btn"></div>
          <div class="sk-btn"></div>
        </div>
      </div>
    </section>

    <!-- HERO -->
    <section class="hero" v-if="heroBanner && !isFirstLoading">
      <div v-if="!isBannerLoaded" class="hero-skeleton-bg"></div>

      <img
        class="hero__bg"
        :src="`https://picsum.photos/1980/900?random=${heroBanner.imdbID}`"
        alt="Featured Movie"
        @load="handleBannerLoaded"
        :class="{ hidden: !isBannerLoaded }"
      />

      <div class="hero__content">
        <h1 class="hero__title">{{ heroBanner.Title }}</h1>
        <p class="hero__desc">{{ heroBanner.description }}</p>

        <div class="hero__buttons">
          <v-btn color="white" class="btn-play">
            <Play :size="20" :fill="'black'" />
            Play
          </v-btn>

          <v-btn color="grey-darken-4" class="btn-more">
            <Heart 
              :size="20" 
              :fill="isFavorite(heroBanner.imdbID) ? '#ef4444' : 'none'"
              :color="isFavorite(heroBanner.imdbID) ? '#ef4444' : 'white'"
            />
            My List
          </v-btn>
        </div>
      </div>

      <div class="hero__fade"></div>
    </section>

    <!-- NO RESULTS STATE -->
    <section v-if="!isFirstLoading && !hasResults && searchQuery" class="empty-state">
      <div class="empty-content">
        <SearchIcon :size="64" class="empty-icon" />
        <h2 class="empty-title">No results found</h2>
        <p class="empty-desc">
          We couldn't find any movies matching "<strong>{{ searchQuery }}</strong>"
        </p>
        <p class="empty-hint">Try searching with different keywords</p>
      </div>
    </section>

    <!-- MOVIE GRID -->
    <section class="movie-grid" v-if="hasResults">
      <h2 class="grid-title">
        Search Results for "{{ searchQuery }}" 
        <span class="result-count">({{ allMovies.length }} results)</span>
      </h2>

      <div class="grid-list">
        <!-- Skeleton -->
        <template v-if="isFirstLoading">
          <div v-for="n in 10" :key="'sk' + n" class="grid-item sk-item"></div>
        </template>

        <!-- Real items -->
        <template v-else>
          <div 
            v-for="movie in allMovies" 
            :key="movie.imdbID" 
            class="grid-item"
            @mouseenter="hoveredMovieId = movie.imdbID"
            @mouseleave="hoveredMovieId = null"
            @click="handleMovieClick(movie)"
          >
            <!-- skeleton -->
            <div v-if="!loadedImages[movie.imdbID]" class="img-skeleton"></div>

            <img
              :src="`https://picsum.photos/450/300?random=${movie.imdbID}`"
              :alt="movie.Title"
              @load="handleImageLoaded(movie.imdbID)"
              :class="{ hidden: !loadedImages[movie.imdbID] }"
            />

            <!-- Hover Overlay -->
            <div 
              class="movie-overlay"
              :class="{ visible: hoveredMovieId === movie.imdbID }"
            >
              <div class="overlay-content">
                <h3 class="movie-title">{{ movie.Title }}</h3>
                <div class="movie-meta">
                  <div class="rating">
                    <Star :size="16" :fill="'#ffd700'" color="#ffd700" />
                    <span>{{ movie.rating }}</span>
                  </div>
                  <span class="year">{{ movie.Year }}</span>
                </div>
                <button 
                  class="btn-heart-overlay"
                  :class="{ 'is-favorite': isFavorite(movie.imdbID) }"
                  @click="handleToggleFavorite(movie.imdbID, $event)"
                >
                  <Heart 
                    :size="20" 
                    :fill="isFavorite(movie.imdbID) ? '#ef4444' : 'none'"
                    :color="isFavorite(movie.imdbID) ? '#ef4444' : 'white'"
                  />
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- MODAL COMPONENT -->
    <MovieDetailModal 
      v-model="showModal"
      :movie="selectedMovie"
    />
  </div>
</template>

<style lang="scss" scoped>
.search-list {
  background: #000;
  color: #fff;
  min-height: 100vh;
}

/* HERO SECTION */
.hero {
  position: relative;
  height: 75vh;
  overflow: hidden;

  &__bg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.45);
  }

  &__content {
    position: absolute;
    bottom: 18%;
    left: 4%;
    z-index: 10;
    max-width: 600px;
  }

  &__title {
    font-size: 54px;
    font-weight: 900;
    margin-bottom: 18px;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.8);
  }

  &__desc {
    font-size: 18px;
    line-height: 1.5;
    opacity: 0.9;
    margin-bottom: 18px;
    text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
  }

  &__buttons {
    display: flex;
    gap: 12px;

    .btn-play,
    .btn-more {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-play {
      color: black !important;
      font-weight: 700;
    }

    .btn-more {
      color: white !important;
      border: 1px solid #666;
    }
  }

  &__fade {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 140px;
    background: linear-gradient(to bottom, transparent, #000);
  }
}

/* EMPTY STATE */
.empty-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.empty-content {
  text-align: center;
  max-width: 500px;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 24px;
}

.empty-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
}

.empty-desc {
  font-size: 18px;
  opacity: 0.7;
  margin-bottom: 12px;
  line-height: 1.5;

  strong {
    color: #ef4444;
  }
}

.empty-hint {
  font-size: 14px;
  opacity: 0.5;
}

/* MOVIE GRID */
.movie-grid {
  margin-top: -40px;
  position: relative;
  z-index: 5;
  padding-bottom: 60px;

  .grid-title {
    font-size: 24px;
    font-weight: 600;
    margin: 30px 0 20px 20px;

    .result-count {
      font-size: 18px;
      font-weight: 400;
      opacity: 0.6;
      margin-left: 8px;
    }
  }

  .grid-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 18px;
    padding: 0 20px;
  }

  .grid-item {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 2;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:hover {
      transform: scale(1.05);
      z-index: 10;
    }
  }
}

/* MOVIE OVERLAY */
.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;

  &.visible {
    opacity: 1;

    .overlay-content {
      transform: translateY(0);
    }
  }
}

.overlay-content {
  transform: translateY(10px);
  transition: transform 0.3s;
}

.movie-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: white;
}

.movie-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .rating {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
  }

  .year {
    opacity: 0.8;
  }
}

.btn-heart-overlay {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid white;
  background: rgba(0,0,0,0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255,255,255,0.2);
    transform: scale(1.1);
  }

  &.is-favorite {
    background: rgba(239, 68, 68, 0.2);
    border-color: #ef4444;

    &:hover {
      background: rgba(239, 68, 68, 0.3);
    }
  }
}

/* SKELETON ANIMATION */
@keyframes pulse {
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.4;
  }
}

/* HERO SKELETON */
.hero-skeleton {
  position: relative;
  height: 75vh;
  background: #2b2b2b;
  overflow: hidden;

  .hero-skeleton-bg {
    width: 100%;
    height: 100%;
    background: #1b1b1b;
    animation: pulse 1.6s infinite;
  }

  .hero-skeleton-content {
    position: absolute;
    bottom: 18%;
    left: 4%;
    width: 50%;

    .sk-title {
      width: 60%;
      height: 48px;
      background: #1b1b1b;
      border-radius: 8px;
      animation: pulse 1.6s infinite;
      margin-bottom: 12px;
    }

    .sk-desc {
      width: 40%;
      height: 18px;
      background: #1b1b1b;
      border-radius: 6px;
      animation: pulse 1.6s infinite;
      margin-bottom: 20px;
    }

    .sk-btns {
      display: flex;
      gap: 12px;

      .sk-btn {
        width: 120px;
        height: 44px;
        background: #555;
        border-radius: 8px;
        animation: pulse 1.6s infinite;
      }
    }
  }
}

/* MOVIE CARD SKELETON */
.sk-item {
  background: #1b1b1b;
  border-radius: 8px;
  animation: pulse 1.6s infinite;
}

.img-skeleton {
  width: 100%;
  height: 100%;
  background: #1b1b1b;
  border-radius: 8px;
  animation: pulse 1.6s infinite;
  position: absolute;
  top: 0;
  left: 0;
}

.grid-item {
  img.hidden {
    opacity: 0;
  }

  img {
    transition: opacity 0.25s ease;
  }
}

/* HERO IMAGE SKELETON */
.hero-skeleton-bg {
  width: 100%;
  height: 100%;
  background: #333;
  filter: brightness(0.45);
  position: absolute;
  top: 0;
  left: 0;
  animation: pulse 1.6s infinite;
}

.hero__bg.hidden {
  opacity: 0;
}

.hero__bg {
  transition: opacity 0.35s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .movie-grid .grid-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .hero__title {
    font-size: 36px;
  }

  .empty-title {
    font-size: 24px;
  }

  .grid-title {
    font-size: 20px;

    .result-count {
      font-size: 16px;
    }
  }
}
</style>