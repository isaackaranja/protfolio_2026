<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AdminNav from '../components/AdminNav.vue'
import {
  deleteDocument,
  downloadDocument,
  listDocuments,
  updateDocument,
  uploadDocument,
} from '../api/documents'
import './admin.css'

const SECTIONS = [
  {
    kind: 'cv',
    title: 'CVs',
    empty: 'No CVs yet. The first one you upload goes on the homepage.',
  },
  {
    kind: 'coverLetter',
    title: 'Cover letters',
    empty: 'No cover letters yet. These stay private; only you can download them.',
  },
]

const MAX_BYTES = 10 * 1024 * 1024

const docs = ref([])
const loading = ref(true)
const loadError = ref('')

const upload = reactive({ kind: 'cv', label: '', notes: '' })
const fileInput = ref(null)
const file = ref(null)
const uploading = ref(false)
const uploadError = ref('')

// _id of the version being edited, and its unsaved values
const editingId = ref(null)
const draft = reactive({ label: '', notes: '' })
const saving = ref(false)
const editError = ref('')

// _id of a version whose action (download, publish) is running
const busyId = ref(null)

const sections = computed(() =>
  SECTIONS.map((section) => ({
    ...section,
    items: docs.value.filter(({ kind }) => kind === section.kind),
  })),
)

onMounted(async () => {
  try {
    docs.value = await listDocuments()
  } catch (err) {
    loadError.value = err.message
  } finally {
    loading.value = false
  }
})

function chooseFile(event) {
  file.value = event.target.files[0] ?? null
  uploadError.value =
    file.value && file.value.size > MAX_BYTES ? 'Files must be 10 MB or smaller.' : ''
}

async function submitUpload() {
  if (!file.value || file.value.size > MAX_BYTES) return
  uploading.value = true
  uploadError.value = ''
  try {
    docs.value.unshift(await uploadDocument(file.value, upload))
    Object.assign(upload, { label: '', notes: '' })
    file.value = null
    fileInput.value.value = ''
  } catch (err) {
    uploadError.value = err.message
  } finally {
    uploading.value = false
  }
}

function replaceDoc(updated) {
  docs.value = docs.value.map((doc) => (doc._id === updated._id ? updated : doc))
}

function startEditing(doc) {
  editingId.value = doc._id
  Object.assign(draft, { label: doc.label, notes: doc.notes })
  editError.value = ''
}

async function saveEdit(id) {
  saving.value = true
  editError.value = ''
  try {
    replaceDoc(await updateDocument(id, draft))
    editingId.value = null
  } catch (err) {
    editError.value = err.message
  } finally {
    saving.value = false
  }
}

async function publish(doc) {
  busyId.value = doc._id
  try {
    const updated = await updateDocument(doc._id, { isPublic: true })
    // The server takes every other CV off the homepage
    docs.value = docs.value.map((item) =>
      item._id === updated._id ? updated : item.kind === 'cv' ? { ...item, isPublic: false } : item,
    )
  } catch (err) {
    alert(err.message)
  } finally {
    busyId.value = null
  }
}

async function download(doc) {
  busyId.value = doc._id
  try {
    await downloadDocument(doc)
  } catch (err) {
    alert(err.message)
  } finally {
    busyId.value = null
  }
}

async function remove(doc) {
  const warning = doc.isPublic ? ' It is the CV on your homepage, so the download button will disappear.' : ''
  if (!confirm(`Delete "${doc.label}"?${warning} This can't be undone.`)) return
  try {
    await deleteDocument(doc._id)
    docs.value = docs.value.filter(({ _id }) => _id !== doc._id)
  } catch (err) {
    alert(err.message)
  }
}

function formatSize(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { dateStyle: 'medium' })
}
</script>

<template>
  <main class="container admin">
    <header class="intro">
      <p class="eyebrow mono">Admin</p>
      <h1 class="section-title">CV &amp; cover letters</h1>
      <AdminNav />
    </header>

    <section class="panel" aria-labelledby="upload-title">
      <h2 id="upload-title" class="panel-title">Upload a version</h2>
      <form class="form" @submit.prevent="submitUpload">
        <fieldset class="kinds">
          <legend>Type</legend>
          <label class="choice">
            <input v-model="upload.kind" type="radio" value="cv" />
            <span>CV</span>
          </label>
          <label class="choice">
            <input v-model="upload.kind" type="radio" value="coverLetter" />
            <span>Cover letter</span>
          </label>
        </fieldset>

        <label class="field">
          <span>Version name</span>
          <input
            v-model="upload.label"
            type="text"
            maxlength="100"
            :placeholder="upload.kind === 'cv' ? 'e.g. Backend roles — Nov 2026' : 'e.g. Acme fintech application'"
            required
          />
        </label>

        <label class="field">
          <span>Notes</span>
          <span class="hint">Optional: what this version is for or what changed.</span>
          <textarea v-model="upload.notes" rows="2" maxlength="500"></textarea>
        </label>

        <label class="field">
          <span>File</span>
          <span class="hint">PDF or Word (.docx), up to 10 MB. PDF is best for the homepage.</span>
          <input
            ref="fileInput"
            type="file"
            class="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            @change="chooseFile"
          />
        </label>

        <p v-if="uploadError" class="error" role="alert">{{ uploadError }}</p>

        <div>
          <button type="submit" class="btn btn-dark" :disabled="uploading">
            {{ uploading ? 'Uploading…' : 'Upload' }}
          </button>
        </div>
      </form>
    </section>

    <p v-if="loading" class="muted">Loading…</p>
    <p v-else-if="loadError" class="error" role="alert">{{ loadError }}</p>

    <template v-else>
      <section
        v-for="section in sections"
        :key="section.kind"
        :aria-labelledby="`${section.kind}-title`"
      >
        <h2 :id="`${section.kind}-title`" class="panel-title">
          {{ section.title }} <span class="count mono">{{ section.items.length }}</span>
        </h2>

        <p v-if="!section.items.length" class="muted">{{ section.empty }}</p>

        <ul v-else class="list">
          <li v-for="doc in section.items" :key="doc._id" class="item">
            <form v-if="editingId === doc._id" class="form" @submit.prevent="saveEdit(doc._id)">
              <label class="field">
                <span>Version name</span>
                <input v-model="draft.label" type="text" maxlength="100" required />
              </label>
              <label class="field">
                <span>Notes</span>
                <textarea v-model="draft.notes" rows="2" maxlength="500"></textarea>
              </label>
              <p v-if="editError" class="error" role="alert">{{ editError }}</p>
              <div class="actions">
                <button type="submit" class="btn btn-dark small" :disabled="saving">
                  {{ saving ? 'Saving…' : 'Save' }}
                </button>
                <button type="button" class="btn btn-outline small" @click="editingId = null">
                  Cancel
                </button>
              </div>
            </form>

            <template v-else>
              <div class="info">
                <h3 class="item-name">
                  {{ doc.label }}
                  <span v-if="doc.isPublic" class="badge">On homepage</span>
                </h3>
                <p class="meta mono">
                  {{ doc.filename }} · {{ formatSize(doc.size) }} · {{ formatDate(doc.createdAt) }}
                </p>
                <p v-if="doc.notes" class="muted notes">{{ doc.notes }}</p>
              </div>

              <div class="actions">
                <button
                  type="button"
                  class="btn btn-outline small"
                  :disabled="busyId === doc._id"
                  @click="download(doc)"
                >
                  Download
                </button>
                <button
                  v-if="doc.kind === 'cv' && !doc.isPublic"
                  type="button"
                  class="btn btn-outline small"
                  :disabled="busyId === doc._id"
                  @click="publish(doc)"
                >
                  Use on homepage
                </button>
                <button type="button" class="btn btn-outline small" @click="startEditing(doc)">
                  Edit
                </button>
                <button type="button" class="btn btn-outline small danger" @click="remove(doc)">
                  Delete
                </button>
              </div>
            </template>
          </li>
        </ul>
      </section>
    </template>
  </main>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.kinds {
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
}

.kinds legend {
  padding: 0;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.choice {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  cursor: pointer;
}

.choice input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--accent);
}

.file {
  font: inherit;
  font-size: 15px;
  font-weight: 400;
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

.item > .form {
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.badge {
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
}

.meta {
  margin: 0;
  font-size: 13px;
  color: var(--placeholder);
  overflow-wrap: anywhere;
}

/* Keep the line breaks typed into the form */
.notes {
  white-space: pre-line;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
