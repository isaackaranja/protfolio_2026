<script setup>
import { onMounted, ref } from 'vue'
import { listExperience } from '../api/experience'
import { formatPeriod } from '../utils/formatPeriod'

// Roles added on the /admin/experience page, most recent first
const experience = ref([])
const loading = ref(true)
const loadError = ref(false)

onMounted(async () => {
  try {
    experience.value = await listExperience()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section id="experience" aria-labelledby="exp-title">
    <div class="container inner">
      <h2 id="exp-title" class="section-title title">Experience</h2>

      <!-- On free hosting the API can take up to a minute to wake up -->
      <p v-if="loading" class="status" role="status">Loading experience…</p>
      <p v-else-if="loadError" class="status">
        Experience couldn't be loaded right now. Please refresh the page in a moment.
      </p>
      <p v-else-if="!experience.length" class="status">Experience coming soon.</p>

      <ol v-else class="list">
        <li v-for="item in experience" :key="item._id" class="item">
          <p class="period mono">{{ formatPeriod(item) }}</p>
          <div class="body">
            <h3 class="role">{{ item.title }} · {{ item.company }}</h3>
            <p v-if="item.location" class="location">{{ item.location }}</p>
            <p v-if="item.description" class="summary">{{ item.description }}</p>
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

.status {
  margin: 0;
  font-size: 17px;
  color: var(--muted);
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

.location {
  margin: 6px 0 0;
  font-size: 15px;
  color: var(--muted);
}

/* Keep the line breaks typed into the admin form */
.summary {
  margin: 10px 0 0;
  font-size: 17px;
  line-height: 1.6;
  color: var(--muted);
  white-space: pre-line;
}
</style>
