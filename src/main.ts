import { createApp } from 'vue'
import './styles/main.scss'
import App from './App.vue'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { queryClient } from './utils/vue-query'

// import 'vuetify/styles'
import 'vuetify/lib/styles/main.sass'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import router from './router'

const vuetify = createVuetify({
  components,
  directives,
})

createApp(App)
  .use(VueQueryPlugin, { queryClient })
  .use(router)
  .use(vuetify)
  .mount('#app')
