<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import AdminNav from '../components/AdminNav.vue'
import { createLink, deleteLink, isWebLink, listLinks, updateLink } from '../api/links'
import './admin.css'

const LINK_PATTERN = '(https?|mailto):.+'
const LINK_HINT = 'Starts with https://, http:// or mailto:'

const links = ref([])
const loading = ref(true)
const loadError = ref('')

const newLink = reactive({ linkName: '', link: '', description: '' })
const nameInput = ref(null)
const creating = ref(false)
const createError = ref('')

// _id of the link being edited, and its unsaved values
const editingId = ref(null)
const draft = reactive({ linkName: '', link: '', description: '' })
const updating = ref(false)
const updateError = ref('')

onMounted(async () => {
  try {
    links.value = await listLinks()
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
    links.value.push(await createLink(newLink))
    Object.assign(newLink, { linkName: '', link: '', description: '' })
    await nextTick()
    nameInput.value.focus()
  } catch (err) {
    createError.value = err.message
  } finally {
    creating.value = false
  }
}

function startEditing(item) {
  editingId.value = item._id
  Object.assign(draft, {
    linkName: item.linkName,
    link: item.link,
    description: item.description,
  })
  updateError.value = ''
}

async function update(id) {
  updating.value = true
  updateError.value = ''
  try {
    const updated = await updateLink(id, draft)
    links.value = links.value.map((item) => (item._id === id ? updated : item))
    editingId.value = null
  } catch (err) {
    updateError.value = err.message
  } finally {
    updating.value = false
  }
}

async function remove(item) {
  if (!confirm(`Delete "${item.linkName}"?`)) return
  try {
    await deleteLink(item._id)
    links.value = links.value.filter(({ _id }) => _id !== item._id)
  } catch (err) {
    alert(err.message)
  }
}
</script>

<template>
  <main class="container admin">
    <header class="intro">
      <p class="eyebrow mono">Admin</p>
      <h1 class="section-title">Links</h1>
      <AdminNav />
    </header>

    <section class="panel" aria-labelledby="new-title">
      <h2 id="new-title" class="panel-title">Add a link</h2>
      <form class="form" @submit.prevent="create">
        <div class="pair">
          <label class="field">
            <span>Name</span>
            <input
              ref="nameInput"
              v-model="newLink.linkName"
              type="text"
              maxlength="60"
              placeholder="e.g. GitHub"
              required
            />
          </label>
          <label class="field">
            <span>Link</span>
            <input
              v-model="newLink.link"
              type="text"
              inputmode="url"
              maxlength="2000"
              placeholder="https://github.com/your-name"
              :pattern="LINK_PATTERN"
              :title="LINK_HINT"
              required
            />
          </label>
        </div>
        <label class="field">
          <span>Description</span>
          <span class="hint">Optional. Shown when visitors hover over the link.</span>
          <input v-model="newLink.description" type="text" maxlength="300" />
        </label>
        <p v-if="createError" class="error" role="alert">{{ createError }}</p>
        <div>
          <button type="submit" class="btn btn-dark" :disabled="creating">
            {{ creating ? 'Adding…' : 'Add link' }}
          </button>
        </div>
      </form>
    </section>

    <section aria-labelledby="list-title">
      <h2 id="list-title" class="panel-title">
        All links <span class="count mono">{{ links.length }}</span>
      </h2>
      <p class="muted order-note">Links appear on your homepage in this order.</p>

      <p v-if="loading" class="muted">Loading…</p>
      <p v-else-if="loadError" class="error" role="alert">{{ loadError }}</p>
      <p v-else-if="!links.length" class="muted">No links yet. Add your GitHub or LinkedIn above.</p>

      <ul v-else class="list">
        <li v-for="item in links" :key="item._id" class="item">
          <form v-if="editingId === item._id" class="form edit" @submit.prevent="update(item._id)">
            <div class="pair">
              <label class="field">
                <span>Name</span>
                <input v-model="draft.linkName" type="text" maxlength="60" required />
              </label>
              <label class="field">
                <span>Link</span>
                <input
                  v-model="draft.link"
                  type="text"
                  inputmode="url"
                  maxlength="2000"
                  :pattern="LINK_PATTERN"
                  :title="LINK_HINT"
                  required
                />
              </label>
            </div>
            <label class="field">
              <span>Description</span>
              <input v-model="draft.description" type="text" maxlength="300" />
            </label>
            <p v-if="updateError" class="error" role="alert">{{ updateError }}</p>
            <div class="actions">
              <button type="submit" class="btn btn-dark small" :disabled="updating">
                {{ updating ? 'Saving…' : 'Save' }}
              </button>
              <button type="button" class="btn btn-outline small" @click="editingId = null">
                Cancel
              </button>
            </div>
          </form>

          <template v-else>
            <div class="info">
              <h3 class="item-name">{{ item.linkName }}</h3>
              <a
                :href="item.link"
                class="url mono"
                :target="isWebLink(item.link) ? '_blank' : undefined"
                rel="noopener"
              >
                {{ item.link }}
              </a>
              <p v-if="item.description" class="muted description">{{ item.description }}</p>
            </div>
            <div class="actions">
              <button type="button" class="btn btn-outline small" @click="startEditing(item)">
                Edit
              </button>
              <button
                type="button"
                class="btn btn-outline small danger"
                :aria-label="`Delete ${item.linkName}`"
                @click="remove(item)"
              >
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
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pair {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.order-note {
  margin: -12px 0 20px;
  font-size: 15px;
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
  align-items: center;
  justify-content: space-between;
  gap: 16px 32px;
  padding: 20px 0;
  border-top: 1px solid var(--border);
}

.item:last-child {
  border-bottom: 1px solid var(--border);
}

.edit {
  flex: 1 1 100%;
  max-width: 720px;
}

.info {
  flex: 1 1 320px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.url {
  width: fit-content;
  max-width: 100%;
  font-size: 13px;
  color: var(--muted);
  overflow-wrap: anywhere;
}

.description {
  font-size: 15px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
