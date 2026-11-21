<script setup>
import { RouterLink } from 'vue-router'

const tabs = [
  { label: 'Projects', to: '/admin/projects' },
  { label: 'Skills & tools', to: '/admin/skills' },
  { label: 'Experience', to: '/admin/experience' },
]
</script>

<template>
  <nav aria-label="Admin pages" class="tabs">
    <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" class="tab">
      {{ tab.label }}
    </RouterLink>
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

/* Vue Router adds this class to the link for the current page */
.tab.router-link-active {
  color: var(--ink);
  border-bottom-color: var(--accent);
}
</style>
