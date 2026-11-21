import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { isLoggedIn } from '../api/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    // Admin pages: not linked from the site, visit them directly. requiresAdmin pages need a login.
    {
      path: '/admin',
      redirect: '/admin/projects',
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/AdminLoginView.vue'),
    },
    {
      path: '/admin/projects',
      name: 'admin-projects',
      component: () => import('../views/AdminProjectsView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/skills',
      name: 'admin-skills',
      component: () => import('../views/AdminSkillsView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/experience',
      name: 'admin-experience',
      component: () => import('../views/AdminExperienceView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/documents',
      name: 'admin-documents',
      component: () => import('../views/AdminDocumentsView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/profile',
      name: 'admin-profile',
      component: () => import('../views/AdminProfileView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/links',
      name: 'admin-links',
      component: () => import('../views/AdminLinksView.vue'),
      meta: { requiresAdmin: true },
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

// Send logged-out visitors to the login page. This only hides the pages:
// the API itself rejects changes without a valid login.
router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !isLoggedIn()) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
})

export default router
