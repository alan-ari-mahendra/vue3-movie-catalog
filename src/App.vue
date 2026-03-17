<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

const route = useRoute()
const isDev = import.meta.env

// Sembunyikan navbar & footer di halaman donasi (hanya akses via link)
const showLayout = computed(() => route.name !== 'support-our-dream')
</script>

<template>
  <v-app>
    <AppNavbar v-if="showLayout" />

    <v-main>
      <router-view />
      <VueQueryDevtools v-if="isDev" :initial-is-open="false" />
      <AppFooter v-if="showLayout" />
    </v-main>
  </v-app>
</template>
