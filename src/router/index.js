import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    // Admin pages: not linked from the site, visit them directly
    {
      path: '/admin/projects',
      name: 'admin-projects',
      component: () => import('../views/AdminProjectsView.vue'),
    },
    {
      path: '/admin/skills',
      name: 'admin-skills',
      component: () => import('../views/AdminSkillsView.vue'),
    },
    {
      path: '/admin/experience',
      name: 'admin-experience',
      component: () => import('../views/AdminExperienceView.vue'),
    },
    // Unknown paths fall back to the home page
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    // Header links like /#work scroll to their section
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router
