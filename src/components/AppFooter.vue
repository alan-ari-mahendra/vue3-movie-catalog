<script setup lang="ts">
import { Facebook, Instagram, Twitter, Youtube } from "lucide-vue-next";

const socialIcons = [
  { icon: Facebook, link: "#", name: "Facebook" },
  { icon: Instagram, link: "#", name: "Instagram" },
  { icon: Twitter, link: "#", name: "Twitter" },
  { icon: Youtube, link: "#", name: "YouTube" },
];

const footerGroups = [
  ["Audio Description", "Investor Relations", "Legal Notices"],
  ["Help Center", "Jobs", "Cookie Preferences"],
  ["Gift Cards", "Terms of Use", "Corporate Information"],
  ["Media Center", "Privacy", "Contact Us"],
];
</script>

<template>
  <v-footer class="movie-footer" padless>
    <v-container class="py-10">
      <div class="socials mb-6">
        <a
          v-for="(social, i) in socialIcons"
          :key="i"
          :href="social.link"
          class="social-link"
          :aria-label="social.name"
        >
          <component :is="social.icon" :size="24" />
        </a>
      </div>

      <v-row class="footer-links mb-8">
        <v-col cols="6" sm="3" v-for="(group, idx) in footerGroups" :key="idx">
          <ul>
            <li v-for="(item, i) in group" :key="i">
              <a href="#">{{ item }}</a>
            </li>
          </ul>
        </v-col>
      </v-row>

      <div class="text-center text-grey text-caption mt-6">
        © {{ new Date().getFullYear() }} MovieApp — Built with Vue 3 + Vuetify +
        Lucide Icons
      </div>
    </v-container>
  </v-footer>
</template>

<style scoped lang="scss">
.movie-footer {
  background: #111;
  color: #757575;
  border-top: 1px solid #333;
  margin-top: 16rem;

  a {
    color: #757575;
    font-size: 0.85rem;
    line-height: 2;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      text-decoration: underline;
      color: #fff;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .socials {
    display: flex;
    gap: 16px;
    justify-content: center;
  }

  .social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    color: #757575;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      transform: translateY(-2px);
    }
  }

  .text-grey {
    opacity: 0.7;
  }
}
</style>
