<template>
  <v-footer class="netflix-footer" padless>
    <v-container class="py-10">
      <!-- Social Icons -->
      <div class="socials mb-6">
        <v-btn
          v-for="(icon, i) in socialIcons"
          :key="i"
          variant="text"
          size="large"
          :href="icon.link"
          class="mx-2"
        >
          <v-icon>{{ icon.icon }}</v-icon>
        </v-btn>
      </div>

      <!-- Footer Links -->
      <v-row class="footer-links mb-8">
        <v-col cols="6" sm="3" v-for="(group, idx) in footerGroups" :key="idx">
          <ul>
            <li v-for="(item, i) in group" :key="i">
              <a href="#">{{ item }}</a>
            </li>
          </ul>
        </v-col>
      </v-row>

      <!-- Copyright -->
      <div class="text-center text-grey text-caption mt-6">
        © {{ new Date().getFullYear() }} Netflix Clone — Built with Vue 3 + Vuetify.
      </div>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
const socialIcons = [
  { icon: 'mdi-facebook', link: '#' },
  { icon: 'mdi-instagram', link: '#' },
  { icon: 'mdi-twitter', link: '#' },
  { icon: 'mdi-youtube', link: '#' },
]

const footerGroups = [
  ['Audio Description', 'Investor Relations', 'Legal Notices'],
  ['Help Center', 'Jobs', 'Cookie Preferences'],
  ['Gift Cards', 'Terms of Use', 'Corporate Information'],
  ['Media Center', 'Privacy', 'Contact Us'],
]
</script>

<style scoped lang="scss">
.netflix-footer {
  background: #111;
  color: #757575;
  border-top: 1px solid #333;
  margin-top: 16rem;

  a {
    color: #757575;
    font-size: 0.85rem;
    line-height: 2;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .socials .v-btn {
    color: #757575;

    &:hover {
      color: #fff;
    }
  }
}
</style>
