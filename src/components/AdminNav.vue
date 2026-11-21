<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { logout } from '../api/auth'

const router = useRouter()

function logOut() {
  logout()
  router.push({ name: 'admin-login' })
}

const tabs = [
  { label: 'Projects', to: '/admin/projects' },
  { label: 'Skills & tools', to: '/admin/skills' },
  { label: 'Experience', to: '/admin/experience' },
  { label: 'CV & cover letters', to: '/admin/documents' },
  { label: 'Profile', to: '/admin/profile' },
  { label: 'Links', to: '/admin/links' },
]
</script>

<template>
  <nav aria-label="Admin pages" class="tabs">
    <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" class="tab">
      {{ tab.label }}
    </RouterLink>
    <button type="button" class="tab logout" @click="logOut">Log out</button>
  </nav>
</template>

<style scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 16px;
  border-bottom: 1px solid var(--border);
}

.tab {
  padding: 10px 14px;
  margin-bottom: -1px;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  color: var(--muted);
  border-bottom: 2px solid transparent;
}

.tab:hover {
  color: var(--ink);
}

.logout {
  margin-left: auto;
  font-family: inherit;
  background: none;
  border-top: 0;
  border-left: 0;
  border-right: 0;
  cursor: pointer;
}

/* Vue Router adds this class to the link for the current page */
.tab.router-link-active {
  color: var(--ink);
  border-bottom-color: var(--accent);
}
</style>
