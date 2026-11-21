<script setup>
import { onMounted, ref } from 'vue'
import AdminNav from '../components/AdminNav.vue'
import ExperienceForm from '../components/ExperienceForm.vue'
import {
  createExperience,
  deleteExperience,
  listExperience,
  updateExperience,
} from '../api/experience'
import { formatPeriod } from '../utils/formatPeriod'
import './admin.css'

const entries = ref([])
const loading = ref(true)
const loadError = ref('')

const createForm = ref(null)
const creating = ref(false)
const createError = ref('')

// _id of the entry shown as an edit form, or null
const editingId = ref(null)
const updating = ref(false)
const updateError = ref('')

// Same order as the API: most recent start date first
function sortEntries(list) {
  return [...list].sort((a, b) => b.startDate.localeCompare(a.startDate))
}

onMounted(async () => {
  try {
    entries.value = await listExperience()
  } catch (err) {
    loadError.value = err.message
  } finally {
    loading.value = false
  }
})

async function create(input) {
  creating.value = true
  createError.value = ''
  try {
    entries.value = sortEntries([...entries.value, await createExperience(input)])
    createForm.value.reset()
  } catch (err) {
    createError.value = err.message
  } finally {
    creating.value = false
  }
}

function startEditing(id) {
  editingId.value = id
  updateError.value = ''
}

async function update(id, input) {
  updating.value = true
  updateError.value = ''
  try {
    const updated = await updateExperience(id, input)
    entries.value = sortEntries(entries.value.map((entry) => (entry._id === id ? updated : entry)))
    editingId.value = null
  } catch (err) {
    updateError.value = err.message
  } finally {
    updating.value = false
  }
}

async function remove(entry) {
  if (!confirm(`Delete "${entry.title} at ${entry.company}"? This can't be undone.`)) return
  try {
    await deleteExperience(entry._id)
    entries.value = entries.value.filter(({ _id }) => _id !== entry._id)
  } catch (err) {
    alert(err.message)
  }
}
</script>

<template>
  <main class="container admin">
    <header class="intro">
      <p class="eyebrow mono">Admin</p>
      <h1 class="section-title">Work experience</h1>
      <AdminNav />
    </header>

    <section class="panel" aria-labelledby="new-title">
      <h2 id="new-title" class="panel-title">Add a role</h2>
      <ExperienceForm
        ref="createForm"
        submit-label="Add role"
        :saving="creating"
        :error="createError"
        @submit="create"
      />
    </section>

    <section aria-labelledby="list-title">
      <h2 id="list-title" class="panel-title">
        All roles <span class="count mono">{{ entries.length }}</span>
      </h2>

      <p v-if="loading" class="muted">Loading…</p>
      <p v-else-if="loadError" class="error" role="alert">{{ loadError }}</p>
      <p v-else-if="!entries.length" class="muted">No experience yet. Add your first role above.</p>

      <ol v-else class="list">
        <li v-for="entry in entries" :key="entry._id" class="item">
          <ExperienceForm
            v-if="editingId === entry._id"
            :initial="entry"
            submit-label="Save changes"
            :saving="updating"
            :error="updateError"
            @submit="update(entry._id, $event)"
            @cancel="editingId = null"
          />

          <template v-else>
            <p class="period mono">
              {{ formatPeriod(entry) }}
              <span v-if="!entry.endDate" class="badge">Current</span>
            </p>
            <div class="body">
              <h3 class="item-name">{{ entry.title }} · {{ entry.company }}</h3>
              <p v-if="entry.location" class="location">{{ entry.location }}</p>
              <p v-if="entry.description" class="muted description">{{ entry.description }}</p>
              <div class="item-actions">
                <button type="button" class="btn btn-outline small" @click="startEditing(entry._id)">
                  Edit
                </button>
                <button type="button" class="btn btn-outline small danger" @click="remove(entry)">
                  Delete
                </button>
              </div>
            </div>
          </template>
        </li>
      </ol>
    </section>
  </main>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* Same layout as the public Experience section: dates on the left, details on the right */
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

.item > .form {
  flex: 1 1 100%;
  max-width: 720px;
}

.period {
  margin: 0;
  flex: 0 0 200px;
  font-size: 14px;
  color: var(--muted);
  padding-top: 4px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.badge {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
}

.body {
  flex: 1 1 420px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-name {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.location {
  margin: 0;
  font-size: 15px;
  color: var(--muted);
}

/* Keep the line breaks typed into the form */
.description {
  white-space: pre-line;
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
</style>
