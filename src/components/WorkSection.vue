<script setup>
import { computed, onMounted, ref } from 'vue'
import ProjectCard from './ProjectCard.vue'
import { listProjectSamples } from '../api/projectSamples'

// Projects added on the /admin/projects page, newest first
const projects = ref([])
const loading = ref(true)
const loadError = ref(false)

const count = computed(() => String(projects.value.length).padStart(2, '0'))

onMounted(async () => {
  try {
    projects.value = await listProjectSamples()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section id="work" aria-labelledby="work-title" class="work">
    <div class="container inner">
      <div class="heading">
        <h2 id="work-title" class="section-title">Selected work</h2>
        <p v-if="!loading && !loadError" class="count mono">
          {{ count }} {{ projects.length === 1 ? 'project' : 'projects' }}
        </p>
      </div>

      <!-- On free hosting the API can take up to a minute to wake up -->
      <p v-if="loading" class="status" role="status">Loading projects…</p>
      <p v-else-if="loadError" class="status">
        Projects couldn't be loaded right now. Please refresh the page in a moment.
      </p>
      <p v-else-if="!projects.length" class="status">Projects coming soon.</p>

      <div v-else class="list">
        <ProjectCard
          v-for="(project, index) in projects"
          :key="project._id"
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

.status {
  margin: 0;
  font-size: 17px;
  color: var(--muted);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
</style>
