<script setup>
import { profile } from '../data/profile'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container inner">
      <p>© {{ year }} {{ profile.name }}</p>
      <p>
        Built with Vue, Express &amp; MongoDB in {{ profile.city }}
        <template v-if="profile.sourceUrl">
          · <a :href="profile.sourceUrl" target="_blank" rel="noopener">Source ↗</a>
        </template>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--ink);
  border-top: 1px solid var(--ink-soft);
}

.inner {
  padding-top: 28px;
  padding-bottom: 28px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--footer-text);
}

p {
  margin: 0;
}

a {
  color: inherit;
}

a:hover {
  color: #ffffff;
}
</style>
