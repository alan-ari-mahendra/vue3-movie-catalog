import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import MyList from "../views/MyList.vue";
import Help from "../views/Help.vue";
import SearchList from "../views/SearchList.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/my-list", name: "my-list", component: MyList },
  { path: "/support-our-dream", name: "support-our-dream", component: Help },
  {
    path: "/search",
    name: "search",
    component: SearchList,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
