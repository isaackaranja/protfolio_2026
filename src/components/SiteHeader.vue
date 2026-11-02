<script setup>
import { RouterLink } from 'vue-router'
import { profile } from '../data/profile'

const links = [
  { label: 'Work', hash: '#work' },
  { label: 'Experience', hash: '#experience' },
  { label: 'About', hash: '#about' },
]
</script>

<template>
  <header class="header">
    <nav aria-label="Main" class="container nav">
      <RouterLink :to="{ path: '/', hash: '#top' }" class="brand">{{ profile.name }}</RouterLink>
      <div class="links">
        <RouterLink
          v-for="link in links"
          :key="link.hash"
          :to="{ path: '/', hash: link.hash }"
          class="link"
        >
          {{ link.label }}
        </RouterLink>
        <RouterLink :to="{ path: '/', hash: '#contact' }" class="cta">Get in touch</RouterLink>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header {
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}

.nav {
  padding-top: 20px;
  padding-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  font-weight: 600;
  font-size: 17px;
  text-decoration: none;
  letter-spacing: -0.01em;
}

.links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.link {
  font-size: 15px;
  text-decoration: none;
  padding: 12px;
  color: var(--muted);
}

.link:hover {
  color: var(--accent);
}

.cta {
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  padding: 11px 18px;
  border-radius: 8px;
  background: var(--accent);
  color: #ffffff;
}

.cta:hover {
  color: #ffffff;
  filter: brightness(1.1);
}
</style>
