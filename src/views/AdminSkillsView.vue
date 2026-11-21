<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import AdminNav from '../components/AdminNav.vue'
import { createSkill, deleteSkill, listSkills, updateSkill } from '../api/skills'
import './admin.css'

// Suggested in the category box, alongside any categories you've already used
const SUGGESTED_CATEGORIES = ['Languages', 'Frontend', 'Backend', 'Databases', 'Tools & cloud']

const skills = ref([])
const loading = ref(true)
const loadError = ref('')

const newSkill = reactive({ name: '', category: '' })
const nameInput = ref(null)
const creating = ref(false)
const createError = ref('')

// _id of the skill being edited, and its unsaved values
const editingId = ref(null)
const draft = reactive({ name: '', category: '' })
const updating = ref(false)
const updateError = ref('')

const categories = computed(() => [
  ...new Set([...SUGGESTED_CATEGORIES, ...skills.value.map(({ category }) => category)]),
])

// Skills grouped by category, in the order they're sorted
const groups = computed(() => {
  const byCategory = new Map()
  for (const skill of skills.value) {
    if (!byCategory.has(skill.category)) byCategory.set(skill.category, [])
    byCategory.get(skill.category).push(skill)
  }
  return [...byCategory].map(([category, items]) => ({ category, items }))
})

// Same order as the API: category, then name, A–Z ignoring case
function sortSkills(list) {
  const compare = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })
  return [...list].sort((a, b) => compare(a.category, b.category) || compare(a.name, b.name))
}

onMounted(async () => {
  try {
    skills.value = await listSkills()
  } catch (err) {
    loadError.value = err.message
  } finally {
    loading.value = false
  }
})

async function create() {
  creating.value = true
  createError.value = ''
  try {
    const skill = await createSkill(newSkill)
    skills.value = sortSkills([...skills.value, skill])
    // Keep the category so several skills in the same group can be added in a row
    newSkill.name = ''
    await nextTick()
    nameInput.value.focus()
  } catch (err) {
    createError.value = err.message
  } finally {
    creating.value = false
  }
}

function startEditing(skill) {
  editingId.value = skill._id
  Object.assign(draft, { name: skill.name, category: skill.category })
  updateError.value = ''
}

async function update(id) {
  updating.value = true
  updateError.value = ''
  try {
    const updated = await updateSkill(id, draft)
    skills.value = sortSkills(skills.value.map((skill) => (skill._id === id ? updated : skill)))
    editingId.value = null
  } catch (err) {
    updateError.value = err.message
  } finally {
    updating.value = false
  }
}

async function remove(skill) {
  if (!confirm(`Delete "${skill.name}"?`)) return
  try {
    await deleteSkill(skill._id)
    skills.value = skills.value.filter(({ _id }) => _id !== skill._id)
  } catch (err) {
    alert(err.message)
  }
}
</script>

<template>
  <main class="container admin">
    <header class="intro">
      <p class="eyebrow mono">Admin</p>
      <h1 class="section-title">Skills &amp; tools</h1>
      <AdminNav />
    </header>

    <section class="panel" aria-labelledby="new-title">
      <h2 id="new-title" class="panel-title">Add a skill or tool</h2>
      <form class="add-form" @submit.prevent="create">
        <label class="field">
          <span>Name</span>
          <input
            ref="nameInput"
            v-model="newSkill.name"
            type="text"
            maxlength="60"
            placeholder="e.g. TypeScript"
            required
          />
        </label>
        <label class="field">
          <span>Category</span>
          <input
            v-model="newSkill.category"
            type="text"
            list="skill-categories"
            maxlength="60"
            placeholder="e.g. Languages"
            required
          />
        </label>
        <button type="submit" class="btn btn-dark" :disabled="creating">
          {{ creating ? 'Adding…' : 'Add' }}
        </button>
      </form>
      <p v-if="createError" class="error add-error" role="alert">{{ createError }}</p>

      <!-- Suggestions for both category boxes (add and edit) -->
      <datalist id="skill-categories">
        <option v-for="category in categories" :key="category" :value="category" />
      </datalist>
    </section>

    <section aria-labelledby="list-title">
      <h2 id="list-title" class="panel-title">
        All skills &amp; tools <span class="count mono">{{ skills.length }}</span>
      </h2>

      <p v-if="loading" class="muted">Loading…</p>
      <p v-else-if="loadError" class="error" role="alert">{{ loadError }}</p>
      <p v-else-if="!skills.length" class="muted">No skills yet. Add your first one above.</p>

      <div v-else class="groups">
        <section v-for="group in groups" :key="group.category" class="group">
          <h3 class="group-title">{{ group.category }}</h3>
          <ul class="rows">
            <li v-for="skill in group.items" :key="skill._id" class="row">
              <form
                v-if="editingId === skill._id"
                class="edit-form"
                @submit.prevent="update(skill._id)"
              >
                <input
                  v-model="draft.name"
                  type="text"
                  maxlength="60"
                  aria-label="Name"
                  required
                />
                <input
                  v-model="draft.category"
                  type="text"
                  list="skill-categories"
                  maxlength="60"
                  aria-label="Category"
                  required
                />
                <div class="row-actions">
                  <button type="submit" class="btn btn-dark small" :disabled="updating">
                    {{ updating ? 'Saving…' : 'Save' }}
                  </button>
                  <button type="button" class="btn btn-outline small" @click="editingId = null">
                    Cancel
                  </button>
                </div>
                <p v-if="updateError" class="error" role="alert">{{ updateError }}</p>
              </form>

              <template v-else>
                <span class="skill-name">{{ skill.name }}</span>
                <div class="row-actions">
                  <button type="button" class="btn btn-outline small" @click="startEditing(skill)">
                    Edit
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline small danger"
                    :aria-label="`Delete ${skill.name}`"
                    @click="remove(skill)"
                  >
                    Delete
                  </button>
                </div>
              </template>
            </li>
          </ul>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped>
.add-form {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  align-items: end;
  gap: 16px;
}

.add-error {
  margin-top: 16px;
}

.groups {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  align-items: start;
}

.group {
  min-width: 0;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 24px;
}

.group-title {
  margin: 0 0 8px;
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--accent);
  text-transform: uppercase;
}

.rows {
  list-style: none;
  margin: 0;
  padding: 0;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--border);
}

.row:first-child {
  border-top: 0;
}

.skill-name {
  min-width: 0;
  font-size: 16px;
  font-weight: 500;
  overflow-wrap: anywhere;
}

.row-actions {
  flex: none;
  display: flex;
  gap: 8px;
}

.edit-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-form input[type='text'] {
  padding: 9px 12px;
  font-size: 15px;
}

@media (max-width: 560px) {
  .add-form {
    grid-template-columns: 1fr;
  }

  .groups {
    grid-template-columns: 1fr;
  }
}
</style>
