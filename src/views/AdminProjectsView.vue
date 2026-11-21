<script setup>
import { onMounted, reactive, ref } from 'vue'
import AdminNav from '../components/AdminNav.vue'
import ProjectSampleForm from '../components/ProjectSampleForm.vue'
import {
  createProjectSample,
  deleteProjectSample,
  listProjectSamples,
  updateProjectSample,
} from '../api/projectSamples'
import './admin.css'

// Longer text fields shown under each project, in this order
const DETAILS = [
  { field: 'working', label: 'How it works' },
  { field: 'contribution', label: 'My contribution' },
  { field: 'businessValue', label: 'Business value' },
]

const projects = ref([])
const loading = ref(true)
const loadError = ref('')

const createForm = ref(null)
const creating = ref(false)
const createError = ref('')

// _id of the project shown as an edit form, or null
const editingId = ref(null)
const updating = ref(false)
const updateError = ref('')

// Image links that failed to load, shown as a placeholder instead
const broken = reactive(new Set())

onMounted(async () => {
  try {
    projects.value = await listProjectSamples()
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
    projects.value.unshift(await createProjectSample(input))
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
    const updated = await updateProjectSample(id, input)
    projects.value = projects.value.map((project) => (project._id === id ? updated : project))
    editingId.value = null
  } catch (err) {
    updateError.value = err.message
  } finally {
    updating.value = false
  }
}

async function remove(project) {
  if (!confirm(`Delete "${project.name}"? This can't be undone.`)) return
  try {
    await deleteProjectSample(project._id)
    projects.value = projects.value.filter(({ _id }) => _id !== project._id)
  } catch (err) {
    alert(err.message)
  }
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' })
}
</script>

<template>
  <main class="container admin">
    <header class="intro">
      <p class="eyebrow mono">Admin</p>
      <h1 class="section-title">Project samples</h1>
      <AdminNav />
    </header>

    <section class="panel" aria-labelledby="new-title">
      <h2 id="new-title" class="panel-title">Add a project</h2>
      <ProjectSampleForm
        ref="createForm"
        submit-label="Add project"
        :saving="creating"
        :error="createError"
        @submit="create"
      />
    </section>

    <section aria-labelledby="list-title">
      <h2 id="list-title" class="panel-title">
        All projects <span class="count mono">{{ projects.length }}</span>
      </h2>

      <p v-if="loading" class="muted">Loading…</p>
      <p v-else-if="loadError" class="error" role="alert">{{ loadError }}</p>
      <p v-else-if="!projects.length" class="muted">No projects yet. Add your first one above.</p>

      <ul v-else class="list">
        <li v-for="project in projects" :key="project._id" class="item">
          <ProjectSampleForm
            v-if="editingId === project._id"
            :initial="project"
            submit-label="Save changes"
            :saving="updating"
            :error="updateError"
            @submit="update(project._id, $event)"
            @cancel="editingId = null"
          />

          <template v-else>
            <div v-if="project.images?.length" class="thumbs">
              <a
                v-for="(url, index) in project.images"
                :key="index"
                :href="url"
                target="_blank"
                rel="noopener"
              >
                <span v-if="broken.has(url)" class="thumb-missing mono">Can't load</span>
                <img
                  v-else
                  :src="url"
                  :alt="`${project.name} image ${index + 1}`"
                  @error="broken.add(url)"
                />
              </a>
            </div>

            <h3 class="item-name">{{ project.name }}</h3>
            <p v-if="project.description" class="muted">{{ project.description }}</p>
            <template v-for="detail in DETAILS" :key="detail.field">
              <div v-if="project[detail.field]" class="detail">
                <h4 class="detail-title">{{ detail.label }}</h4>
                <p class="muted">{{ project[detail.field] }}</p>
              </div>
            </template>
            <p class="date mono">Added {{ formatDate(project.createdAt) }}</p>

            <div class="item-actions">
              <button type="button" class="btn btn-outline small" @click="startEditing(project._id)">
                Edit
              </button>
              <button type="button" class="btn btn-outline small danger" @click="remove(project)">
                Delete
              </button>
            </div>
          </template>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.item {
  min-width: 0;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.thumbs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.thumbs a {
  flex: none;
  text-decoration: none;
  border-radius: 6px;
}

.thumbs img,
.thumb-missing {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96px;
  aspect-ratio: 4 / 3;
  border-radius: 6px;
  object-fit: cover;
  background: var(--surface);
}

.thumb-missing {
  font-size: 11px;
  color: var(--placeholder);
}

.item-name {
  margin: 0;
  font-size: 19px;
  font-weight: 600;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

/* Keep the line breaks typed into the form */
.detail .muted {
  white-space: pre-line;
}

.date {
  margin: 0;
  font-size: 13px;
  color: var(--placeholder);
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

@media (max-width: 560px) {
  .list {
    grid-template-columns: 1fr;
  }
}
</style>
