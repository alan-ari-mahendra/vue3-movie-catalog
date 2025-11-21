<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
const isDev = import.meta.env.DEV
</script>

<template>
  <v-app>
    <v-main>
      <router-view />
       <VueQueryDevtools v-if="isDev" :initial-is-open="false" />
    </v-main>
  </v-app>
</template>
