import { createRouter, createWebHistory } from 'vue-router';
import MainView from '../views/MainView.vue';
import EmbedView from '../views/EmbedView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainView,
    },
    {
      path: '/embed',
      component: EmbedView,
      meta: { embed: true },
    },
  ],
});

export default router;
