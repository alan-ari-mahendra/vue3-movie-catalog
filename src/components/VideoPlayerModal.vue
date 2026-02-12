<script setup lang="ts">
import { ref, watch } from "vue";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Maximize,
  Pause,
  Play as PlayIcon,
} from "lucide-vue-next";

interface Props {
  movie: any | null;
  modelValue: boolean;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "back"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isPlaying = ref(false);
const isMuted = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const isDragging = ref(false);

const videoUrl =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      setTimeout(() => {
        playVideo();
      }, 100);
    } else {
      pauseVideo();
    }
  }
);

const playVideo = () => {
  if (videoRef.value) {
    videoRef.value.play();
    isPlaying.value = true;
  }
};

const pauseVideo = () => {
  if (videoRef.value) {
    videoRef.value.pause();
    isPlaying.value = false;
  }
};

const togglePlay = () => {
  if (isPlaying.value) {
    pauseVideo();
  } else {
    playVideo();
  }
};

const toggleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted;
    isMuted.value = videoRef.value.muted;
  }
};

const toggleFullscreen = () => {
  if (videoRef.value) {
    if (!document.fullscreenElement) {
      videoRef.value.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
};

const handleTimeUpdate = () => {
  if (videoRef.value && !isDragging.value) {
    currentTime.value = videoRef.value.currentTime;
  }
};

const handleLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration;
  }
};

const handleProgressClick = (event: MouseEvent) => {
  const progressBar = event.currentTarget as HTMLElement;
  const rect = progressBar.getBoundingClientRect();
  const pos = (event.clientX - rect.left) / rect.width;

  if (videoRef.value) {
    videoRef.value.currentTime = pos * duration.value;
    currentTime.value = videoRef.value.currentTime;
  }
};

const handleProgressDrag = (event: MouseEvent) => {
  if (!isDragging.value) return;

  const progressBar = (event.currentTarget as HTMLElement).closest(
    ".progress-bar"
  ) as HTMLElement;
  if (!progressBar) return;

  const rect = progressBar.getBoundingClientRect();
  const pos = Math.max(
    0,
    Math.min(1, (event.clientX - rect.left) / rect.width)
  );

  if (videoRef.value) {
    videoRef.value.currentTime = pos * duration.value;
    currentTime.value = videoRef.value.currentTime;
  }
};

const startDragging = () => {
  isDragging.value = true;
};

const stopDragging = () => {
  isDragging.value = false;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const handleBack = () => {
  emit("update:modelValue", false);
  emit("back");
};

const closePlayer = () => {
  emit("update:modelValue", false);
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="closePlayer"
    fullscreen
    transition="dialog-bottom-transition"
  >
    <div v-if="movie" class="video-player">
      <video
        ref="videoRef"
        class="video-element"
        :src="videoUrl"
        @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata"
        @click="togglePlay"
      />

      <div class="video-controls">
        <div class="controls-top">
          <button class="btn-back" @click="handleBack">
            <ArrowLeft :size="24" />
            <span>Back</span>
          </button>

          <div class="movie-info">
            <h2>{{ movie.Title }}</h2>
            <span class="movie-year">{{ movie.Year }}</span>
          </div>
        </div>

        <div v-if="!isPlaying" class="center-play" @click="togglePlay">
          <div class="play-circle">
            <PlayIcon :size="48" :fill="'white'" />
          </div>
        </div>

        <div class="controls-bottom">
          <div
            class="progress-bar"
            @click="handleProgressClick"
            @mousemove="handleProgressDrag"
            @mousedown="startDragging"
            @mouseup="stopDragging"
            @mouseleave="stopDragging"
          >
            <div class="progress-track">
              <div
                class="progress-filled"
                :style="{ width: `${(currentTime / duration) * 100}%` }"
              >
                <div class="progress-handle" />
              </div>
            </div>
          </div>

          <div class="controls-buttons">
            <div class="controls-left">
              <button class="control-btn" @click="togglePlay">
                <Pause v-if="isPlaying" :size="24" />
                <PlayIcon v-else :size="24" />
              </button>

              <button class="control-btn" @click="toggleMute">
                <Volume2 v-if="!isMuted" :size="24" />
                <VolumeX v-else :size="24" />
              </button>

              <div class="time-display">
                <span>{{ formatTime(currentTime) }}</span>
                <span class="time-separator">/</span>
                <span>{{ formatTime(duration) }}</span>
              </div>
            </div>

            <div class="controls-right">
              <button class="control-btn" @click="toggleFullscreen">
                <Maximize :size="24" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<style lang="scss" scoped>
.video-player {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.video-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.video-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    transparent 20%,
    transparent 80%,
    rgba(0, 0, 0, 0.9) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;

  &:hover {
    opacity: 1;
  }

  * {
    pointer-events: auto;
  }
}

.video-player:hover .video-controls {
  opacity: 1;
}

.controls-top {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 30px 40px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateX(-4px);
    opacity: 0.8;
  }
}

.movie-info {
  display: flex;
  align-items: center;
  gap: 12px;

  h2 {
    font-size: 24px;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .movie-year {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
  }
}

.center-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-player:hover .center-play {
  opacity: 1;
}

.play-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
}

.controls-bottom {
  padding: 0 40px 30px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  cursor: pointer;
  margin-bottom: 16px;
  padding: 8px 0;
}

.progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  position: relative;
  transition: height 0.2s;

  .progress-bar:hover & {
    height: 6px;
  }
}

.progress-filled {
  height: 100%;
  background: #ef4444;
  border-radius: 2px;
  position: relative;
  transition: background 0.2s;
}

.progress-handle {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;

  .progress-bar:hover & {
    opacity: 1;
  }
}

.controls-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  transition: all 0.2s;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }
}

.time-display {
  display: flex;
  align-items: center;
  gap: 4px;
  color: white;
  font-size: 14px;
  font-weight: 500;

  .time-separator {
    opacity: 0.5;
    margin: 0 4px;
  }
}

@media (max-width: 768px) {
  .controls-top {
    padding: 20px;
  }

  .controls-bottom {
    padding: 0 20px 20px;
  }

  .movie-info h2 {
    font-size: 18px;
  }

  .btn-back {
    font-size: 16px;
  }

  .play-circle {
    width: 80px;
    height: 80px;
  }
}
</style>
