<script setup>
import { computed, onMounted, ref } from 'vue'
import { listSkills } from '../api/skills'
import { groupSkills } from '../utils/groupSkills'

// Skills added on the /admin/skills page
const skills = ref([])
const loading = ref(true)
const loadError = ref(false)

const groups = computed(() => groupSkills(skills.value))

onMounted(async () => {
  try {
    skills.value = await listSkills()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section aria-labelledby="skills-title" class="skills">
    <div class="container inner">
      <h2 id="skills-title" class="section-title title">Skills &amp; tools</h2>

      <!-- On free hosting the API can take up to a minute to wake up -->
      <p v-if="loading" class="status" role="status">Loading skills…</p>
      <p v-else-if="loadError" class="status">
        Skills couldn't be loaded right now. Please refresh the page in a moment.
      </p>
      <p v-else-if="!groups.length" class="status">Skills coming soon.</p>

      <div v-else class="grid">
        <div v-for="group in groups" :key="group.category" class="group">
          <h3 class="label mono">{{ group.category }}</h3>
          <p class="items">{{ group.items.map(({ name }) => name).join(', ') }}</p>
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

.status {
  margin: 0;
  font-size: 17px;
  color: var(--muted);
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
