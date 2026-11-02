<script setup>
import { skills } from '../data/profile'
</script>

<template>
  <section aria-labelledby="skills-title" class="skills">
    <div class="container inner">
      <h2 id="skills-title" class="section-title title">Skills &amp; tools</h2>
      <div class="grid">
        <div v-for="skill in skills" :key="skill.group" class="group">
          <h3 class="label mono">{{ skill.group }}</h3>
          <p class="items">{{ skill.items }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills {
  background: var(--surface-alt);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.inner {
  padding-top: 88px;
  padding-bottom: 88px;
}

.title {
  margin-bottom: 40px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
}

.group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.label {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.items {
  margin: 0;
  font-size: 17px;
  line-height: 1.8;
}
</style>
