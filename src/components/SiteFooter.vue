<script setup>
import { profile } from '../data/profile'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container inner">
      <p>© {{ year }} {{ profile.name }}</p>
      <p>Built with care in {{ profile.city }}</p>
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
</style>
