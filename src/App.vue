<script setup lang="ts">
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
const isDev = import.meta.env
</script>

<template>
  <v-app>
    <AppNavbar />

    <v-main>
      <router-view />
      <VueQueryDevtools v-if="isDev" :initial-is-open="false" />
      <AppFooter />
    </v-main>
  </v-app>
</template>
