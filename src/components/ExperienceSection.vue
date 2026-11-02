<script setup>
import { experience } from '../data/profile'
</script>

<template>
  <section id="experience" aria-labelledby="exp-title">
    <div class="container inner">
      <h2 id="exp-title" class="section-title title">Experience</h2>
      <ol class="list">
        <li v-for="(item, index) in experience" :key="index" class="item">
          <p class="period mono">{{ item.period }}</p>
          <div class="body">
            <h3 class="role">{{ item.title }}</h3>
            <p class="summary">{{ item.summary }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.inner {
  padding-top: 96px;
  padding-bottom: 96px;
}

.title {
  margin-bottom: 40px;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.item {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 40px;
  padding: 28px 0;
  border-top: 1px solid var(--border);
}

.item:last-child {
  border-bottom: 1px solid var(--border);
}

.period {
  margin: 0;
  flex: 0 0 200px;
  font-size: 14px;
  color: var(--muted);
  padding-top: 4px;
}

.body {
  flex: 1 1 420px;
  min-width: 0;
}

.role {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.summary {
  margin: 10px 0 0;
  font-size: 17px;
  line-height: 1.6;
  color: var(--muted);
}
</style>
