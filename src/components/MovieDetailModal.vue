<script setup lang="ts">
import { computed, ref } from "vue";
import { Star, Heart, Play, X, Users } from "lucide-vue-next";
import { useFavorites } from "../hooks/useFavorites";
import VideoPlayerModal from "./VideoPlayerModal.vue";

interface Props {
  movie: any | null;
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { isFavorite, toggleFavorite } = useFavorites();

const showVideoPlayer = ref(false);

const isMovieFavorited = computed(() => {
  return props.movie ? isFavorite(props.movie.imdbID) : false;
});

const handleToggleFavorite = () => {
  if (props.movie) {
    toggleFavorite(props.movie.imdbID);
  }
};

const handlePlayMovie = () => {
  showVideoPlayer.value = true;
};

const handleBackFromPlayer = () => {
  showVideoPlayer.value = false;
};

const closeModal = () => {
  emit("update:modelValue", false);
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="900px"
    @click:outside="closeModal"
  >
    <v-card v-if="movie" class="modal-card">
      <button class="modal-close" @click="closeModal">
        <X :size="24" />
      </button>

      <div class="modal-banner">
        <img
          :src="`https://picsum.photos/1200/500?random=${movie.imdbID}`"
          :alt="movie.Title"
        />
        <div class="modal-banner-overlay">
          <h1 class="modal-title">{{ movie.Title }}</h1>
          <div class="modal-actions">
            <v-btn
              color="white"
              class="btn-play-modal"
              @click="handlePlayMovie"
            >
              <Play :size="20" :fill="'black'" />
              Play
            </v-btn>
            <button
              class="btn-heart-modal"
              :class="{ 'is-favorite': isMovieFavorited }"
              @click="handleToggleFavorite"
            >
              <Heart
                :size="20"
                :fill="isMovieFavorited ? '#ef4444' : 'none'"
                :color="isMovieFavorited ? '#ef4444' : 'white'"
              />
            </button>
          </div>
        </div>
      </div>

      <div class="modal-details">
        <div class="detail-row">
          <div class="rating-large">
            <Star :size="20" :fill="'#ffd700'" color="#ffd700" />
            <span>{{ movie.rating }}</span>
          </div>
          <span class="duration">{{ movie.duration }}</span>
          <span class="year">{{ movie.Year }}</span>
        </div>

        <p class="description">{{ movie.description }}</p>

        <div class="genres">
          <v-chip v-for="genre in movie.genres" :key="genre" size="small">
            {{ genre }}
          </v-chip>
        </div>

        <div class="cast-section">
          <div class="cast-header">
            <Users :size="18" />
            <span>Cast</span>
          </div>
          <div class="cast-list">
            <span
              v-for="(actor, index) in movie.cast"
              :key="actor"
              class="cast-name"
            >
              {{ actor }}<span v-if="index < movie.cast.length - 1">, </span>
            </span>
          </div>
        </div>
      </div>
    </v-card>
  </v-dialog>

  <VideoPlayerModal
    v-model="showVideoPlayer"
    :movie="movie"
    @back="handleBackFromPlayer"
  />
</template>

<style lang="scss" scoped>
:deep(.v-dialog) {
  background: transparent;
}

.modal-card {
  background: #181818 !important;
  color: white !important;
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
}

.modal-banner {
  position: relative;
  height: 400px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.modal-banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px;
  background: linear-gradient(to top, rgba(24, 24, 24, 1) 0%, transparent 100%);
}

.modal-title {
  font-size: 48px;
  font-weight: 900;
  margin-bottom: 20px;
  color: white;
}

.modal-actions {
  display: flex;
  gap: 12px;

  .btn-play-modal {
    color: black !important;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-heart-modal {
    width: 44px;
    height: 44px;
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
}

.modal-details {
  padding: 30px 40px 40px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.rating-large {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 20px;
  font-weight: 700;
}

.duration,
.year {
  font-size: 16px;
  opacity: 0.7;
}

.description {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.9;
  margin-bottom: 20px;
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.cast-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.cast-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 12px;
  opacity: 0.7;
}

.cast-list {
  display: flex;
  flex-wrap: wrap;
  font-size: 14px;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .modal-title {
    font-size: 32px;
  }

  .modal-details {
    padding: 20px;
  }

  .modal-banner {
    height: 300px;
  }
}
</style>
