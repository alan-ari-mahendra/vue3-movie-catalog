<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Search, X } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const searchQuery = ref('');
const isSearchActive = ref(false);
const searchInputRef = ref<HTMLInputElement | null>(null);

const isActive = (path: string) => route.path === path;

// Watch route changes to sync search query
watch(() => route.query.q, (newQuery) => {
  if (newQuery && typeof newQuery === 'string') {
    searchQuery.value = newQuery;
    isSearchActive.value = true;
  } else {
    searchQuery.value = '';
    isSearchActive.value = false;
  }
}, { immediate: true });

const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value;
  
  if (isSearchActive.value) {
    setTimeout(() => {
      searchInputRef.value?.focus();
    }, 100);
  } else {
    clearSearch();
  }
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    });
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  isSearchActive.value = false;
  
  // Navigate back to home if currently on search page
  if (route.path === '/search') {
    router.push('/');
  }
};

const handleInput = () => {
  // Auto search while typing (debounce bisa ditambahkan nanti)
  if (searchQuery.value.trim()) {
    handleSearch();
  }
};
</script>

<template>
  <header class="navbar">
    <div class="navbar__left">
      <div class="navbar__logo" @click="router.push('/')">
        <h1>MovieApp</h1>
      </div>

      <nav class="navbar__menu">
        <router-link to="/" :class="{ active: isActive('/') }">Home</router-link>
        <router-link to="/my-list" :class="{ active: isActive('/my-list') }">My List</router-link>
      </nav>
    </div>

    <div class="navbar__right">
      <!-- Search Bar -->
      <div class="search-container" :class="{ active: isSearchActive }">
        <button class="search-icon-btn" @click="toggleSearch">
          <Search :size="20" />
        </button>
        
        <transition name="search-expand">
          <div v-if="isSearchActive" class="search-input-wrapper">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search movies..."
              class="search-input"
              @input="handleInput"
              @keyup.enter="handleSearch"
              @keyup.esc="clearSearch"
            />
            <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
              <X :size="16" />
            </button>
          </div>
        </transition>
      </div>

      <img
        class="navbar__avatar"
        src="https://i.pravatar.cc/50"
        alt="User"
      />
    </div>
  </header>
</template>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  height: 70px;
  z-index: 999;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0 40px;

  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(6px);

  transition: background 0.3s ease;

  &__left {
    display: flex;
    align-items: center;
    gap: 30px;
  }

  &__logo {
    cursor: pointer;
    
    h1 {
      font-size: 28px;
      font-weight: 900;
      color: #ef4444;
      margin: 0;
    }
  }

  &__menu {
    display: flex;
    gap: 20px;

    a {
      color: #e5e5e5;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s;

      &:hover,
      &.active {
        color: #ffffff;
      }
    }
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__avatar {
    width: 34px;
    height: 34px;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}

/* Search Container */
.search-container {
  display: flex;
  align-items: center;
  position: relative;

  &.active {
    .search-icon-btn {
      color: #fff;
    }
  }
}

.search-icon-btn {
  background: none;
  border: none;
  color: #e5e5e5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0 12px;
  margin-left: 8px;
  overflow: hidden;
}

.search-input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
  padding: 8px 8px 8px 0;
  width: 250px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
}

.clear-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
}

/* Search Expand Animation */
.search-expand-enter-active,
.search-expand-leave-active {
  transition: all 0.3s ease;
}

.search-expand-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.search-expand-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    padding: 0 20px;

    &__left {
      gap: 16px;
    }

    &__logo h1 {
      font-size: 22px;
    }

    &__menu {
      gap: 12px;

      a {
        font-size: 13px;
      }
    }
  }

  .search-input {
    width: 180px;
  }
}
</style>