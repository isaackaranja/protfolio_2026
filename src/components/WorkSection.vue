<script setup>
import ProjectCard from './ProjectCard.vue'
import { projects } from '../data/profile'

const count = String(projects.length).padStart(2, '0')
</script>

<template>
  <section id="work" aria-labelledby="work-title" class="work">
    <div class="container inner">
      <div class="heading">
        <h2 id="work-title" class="section-title">Selected work</h2>
        <p class="count mono">{{ count }} projects</p>
      </div>

      <div class="list">
        <ProjectCard
          v-for="(project, index) in projects"
          :key="index"
          :project="project"
          :index="index"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.work {
  border-top: 1px solid var(--border);
}

.inner {
  padding-top: 96px;
  padding-bottom: 96px;
}

.heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 48px;
}

.count {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
</style>
