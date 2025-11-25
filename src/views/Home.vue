<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useGetMovies } from "../api/getMovies";
import { Star, Heart, Play } from "lucide-vue-next";
import MovieDetailModal from "../components/MovieDetailModal.vue";
import VideoPlayerModal from "../components/VideoPlayerModal.vue";
import { useFavorites } from "../hooks/useFavorites";

interface BaseMovie {
  imdbID: string;
  Title: string;
  Year: number | string;
  Poster?: string;
}

interface EnrichedMovie extends BaseMovie {
  rating: number;
  description: string;
  duration: string;
  cast: string[];
  genres: string[];
}

const page = ref<number>(1);
const totalPages = ref<number | null>(null);

const { data: movies, isLoading } = useGetMovies({
  page: computed(() => page.value),
});

const allMovies = ref<EnrichedMovie[]>([]);
const lastLoadedPage = ref<number>(0);
const isFirstLoading = computed(() => isLoading.value && page.value === 1);

const loadedImages = ref<Record<string, boolean>>({});
const isBannerLoaded = ref<boolean>(false);

const loadLimit: number = 50;
const loadedCount = ref<number>(0);
const showLoadMore = ref<boolean>(false);

const hoveredMovieId = ref<string | null>(null);
const selectedMovie = ref<EnrichedMovie | null>(null);
const showModal = ref<boolean>(false);
const showVideoPlayer = ref<boolean>(false);
const heroBanner = ref<EnrichedMovie | null>(null);

const { isFavorite, toggleFavorite } = useFavorites();

const generateMockMovie = (movie: BaseMovie): EnrichedMovie => ({
  ...movie,
  rating: 7.4,
  description:
    "A mind-bending thriller that explores the depths of human consciousness and reality. An epic journey through time and space that will leave you questioning everything.",
  duration: "2h 28m",
  cast: [
    "Leonardo DiCaprio",
    "Tom Hardy",
    "Ellen Page",
    "Joseph Gordon-Levitt",
  ],
  genres: ["Action", "Sci-Fi", "Thriller"],
});

watch(movies, () => {
  if (!movies.value?.data) return;

  totalPages.value = movies.value.total_pages;

  if (movies.value.page === lastLoadedPage.value) return;
  lastLoadedPage.value = movies.value.page;

  if (loadedCount.value >= loadLimit) {
    showLoadMore.value = true;
    return;
  }

  const remaining = loadLimit - loadedCount.value;
  const incoming = movies.value.data;
  const appendData = incoming.slice(0, remaining);

  allMovies.value.push(...appendData.map(generateMockMovie));
  loadedCount.value += appendData.length;

  if (loadedCount.value >= loadLimit) {
    showLoadMore.value = true;
  }

  if (allMovies.value.length > 0 && !heroBanner.value) {
    heroBanner.value = allMovies.value[0] ?? null;
  }
});

const sentinel = ref<HTMLElement | null>(null);

onMounted(() => {
  let isWaiting = false;

  const checkAndLoad = (): boolean => {
    if (isLoading.value) return false;
    if (isWaiting) return false;
    if (showLoadMore.value) return false;
    if (totalPages.value && page.value >= totalPages.value) return false;

    isWaiting = true;
    page.value += 1;

    setTimeout(() => {
      isWaiting = false;
    }, 300);

    return true;
  };

  const observer = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0] && entries[0].isIntersecting) {
        checkAndLoad();
      }
    },
    {
      threshold: 0.1,
      rootMargin: "200px",
    }
  );

  if (sentinel.value) observer.observe(sentinel.value);

  const handleScroll = (): void => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage >= 0.95) {
      checkAndLoad();
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    observer.disconnect();
    window.removeEventListener("scroll", handleScroll);
  };
});

const handleLoadMore = (): void => {
  showLoadMore.value = false;
  loadedCount.value = 0;
  page.value += 1;
};

const handleBannerLoaded = (): void => {
  isBannerLoaded.value = true;
};

const handleImageLoaded = (id: string): void => {
  loadedImages.value[id] = true;
};

const handleMovieClick = (movie: EnrichedMovie): void => {
  selectedMovie.value = movie;
  showModal.value = true;
  heroBanner.value = movie;
};

const handleToggleFavorite = (movieId: string, event: Event): void => {
  event.stopPropagation();
  toggleFavorite(movieId);
};

const handlePlayBanner = (): void => {
  if (heroBanner.value) {
    showVideoPlayer.value = true;
  }
};

const handleBackFromPlayer = (): void => {
  showVideoPlayer.value = false;
};
</script>

<template>
  <div class="home">
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

    <section class="hero" v-if="heroBanner">
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
          <v-btn color="white" class="btn-play" @click="handlePlayBanner">
            <Play :size="20" :fill="'black'" />
            Play
          </v-btn>

          <v-btn
            color="grey-darken-4"
            class="btn-more"
            @click="handleToggleFavorite(heroBanner.imdbID, $event)"
          >
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

    <section class="movie-grid">
      <h2 class="grid-title">Popular Movies</h2>

      <div class="grid-list">
        <template v-if="isFirstLoading">
          <div v-for="n in 10" :key="'sk' + n" class="grid-item sk-item"></div>
        </template>

        <template v-else>
          <div
            v-for="movie in allMovies"
            :key="movie.imdbID"
            class="grid-item"
            @mouseenter="hoveredMovieId = movie.imdbID"
            @mouseleave="hoveredMovieId = null"
            @click="handleMovieClick(movie)"
          >
            <div v-if="!loadedImages[movie.imdbID]" class="img-skeleton"></div>

            <img
              :src="`https://picsum.photos/450/300?random=${movie.imdbID}`"
              :alt="movie.Title"
              @load="handleImageLoaded(movie.imdbID)"
              :class="{ hidden: !loadedImages[movie.imdbID] }"
            />

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

    <div v-if="isLoading && page > 1" class="loading">
      <v-progress-circular indeterminate color="primary" size="50" />
    </div>

    <div v-if="showLoadMore" class="load-more-container">
      <v-btn color="primary" size="large" @click="handleLoadMore">
        Load More
      </v-btn>
    </div>

    <div ref="sentinel" style="height: 20px; margin-bottom: 40px"></div>

    <MovieDetailModal v-model="showModal" :movie="selectedMovie" />

    <VideoPlayerModal
      v-model="showVideoPlayer"
      :movie="heroBanner"
      @back="handleBackFromPlayer"
    />
  </div>
</template>

<style lang="scss" scoped>
.home {
  background: #000;
  color: #fff;
  min-height: 100vh;
}

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
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  }

  &__desc {
    font-size: 18px;
    line-height: 1.5;
    opacity: 0.9;
    margin-bottom: 18px;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.8);
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

.movie-grid {
  margin-top: -40px;
  position: relative;
  z-index: 5;

  .grid-title {
    font-size: 24px;
    font-weight: 600;
    margin: 30px 0 20px 20px;
  }

  .grid-list {
    margin-left: 4rem;
    margin-right: 4rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
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

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.95) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    transparent 100%
  );
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
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
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

.loading {
  text-align: center;
  margin: 40px 0;
}

.load-more-container {
  width: fit-content;
  margin-top: 4rem;
  margin-left: auto;
  margin-right: auto;
}

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

@media (max-width: 768px) {
  .movie-grid .grid-list {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .hero__title {
    font-size: 36px;
  }
}
</style>
