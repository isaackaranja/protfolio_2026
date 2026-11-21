<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AdminNav from '../components/AdminNav.vue'
import ContactNumbersEditor from '../components/ContactNumbersEditor.vue'
import {
  deleteProfilePhoto,
  getProfilePhoto,
  photoUrl,
  uploadProfilePhoto,
} from '../api/profilePhoto'
import './admin.css'

const MAX_BYTES = 5 * 1024 * 1024

const photo = ref(null)
const loading = ref(true)
const loadError = ref('')

const fileInput = ref(null)
const file = ref(null)
// Local preview of the chosen file, before it's uploaded
const preview = ref('')
const saving = ref(false)
const error = ref('')

const shownImage = computed(() => preview.value || (photo.value && photoUrl(photo.value)))

onMounted(async () => {
  try {
    ;({ photo: photo.value } = await getProfilePhoto())
  } catch (err) {
    loadError.value = err.message
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(clearPreview)

function clearPreview() {
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = ''
}

function resetChoice() {
  clearPreview()
  file.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function chooseFile(event) {
  clearPreview()
  file.value = event.target.files[0] ?? null
  error.value = ''
  if (!file.value) return
  if (file.value.size > MAX_BYTES) {
    error.value = 'Images must be 5 MB or smaller.'
    return
  }
  preview.value = URL.createObjectURL(file.value)
}

async function upload() {
  if (!file.value || file.value.size > MAX_BYTES) return
  saving.value = true
  error.value = ''
  try {
    ;({ photo: photo.value } = await uploadProfilePhoto(file.value))
    resetChoice()
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (!confirm('Remove your profile photo? The About section will show a placeholder.')) return
  saving.value = true
  error.value = ''
  try {
    await deleteProfilePhoto()
    photo.value = null
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main class="container admin">
    <header class="intro">
      <p class="eyebrow mono">Admin</p>
      <h1 class="section-title">Profile</h1>
      <AdminNav />
    </header>

    <section class="panel" aria-labelledby="photo-title">
      <h2 id="photo-title" class="panel-title">Profile photo</h2>

      <p v-if="loading" class="muted">Loading…</p>
      <p v-else-if="loadError" class="error" role="alert">{{ loadError }}</p>

      <div v-else class="photo-editor">
        <!-- Same size and crop as the About section on the homepage -->
        <div class="frame">
          <img v-if="shownImage" :src="shownImage" alt="Profile photo preview" />
          <span v-else class="mono">No photo yet</span>
        </div>

        <form class="form" @submit.prevent="upload">
          <p v-if="preview" class="status">Preview: not saved yet.</p>
          <p v-else-if="photo" class="status">This photo is on your homepage, in the About section.</p>

          <label class="field">
            <span>{{ photo ? 'Replace photo' : 'Choose a photo' }}</span>
            <span class="hint">
              JPEG, PNG or WebP, up to 5 MB. A portrait photo works best; it's cropped to fit the frame.
            </span>
            <input
              ref="fileInput"
              type="file"
              class="file"
              accept="image/jpeg,image/png,image/webp"
              required
              @change="chooseFile"
            />
          </label>

          <p v-if="error" class="error" role="alert">{{ error }}</p>

          <div class="actions">
            <button type="submit" class="btn btn-dark" :disabled="saving || !preview">
              {{ saving ? 'Saving…' : 'Save photo' }}
            </button>
            <button v-if="preview" type="button" class="btn btn-outline" @click="resetChoice">
              Cancel
            </button>
            <button
              v-else-if="photo"
              type="button"
              class="btn btn-outline danger"
              :disabled="saving"
              @click="remove"
            >
              Remove photo
            </button>
          </div>
        </form>
      </div>
    </section>

    <section class="panel" aria-labelledby="numbers-title">
      <h2 id="numbers-title" class="panel-title">Contact numbers</h2>
      <ContactNumbersEditor />
    </section>
  </main>
</template>

<style scoped>
.photo-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  align-items: flex-start;
}

.frame {
  flex: 0 0 240px;
  height: 280px;
  border-radius: 16px;
  overflow: hidden;
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--placeholder);
}

.frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form {
  flex: 1 1 280px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status {
  margin: 0;
  font-size: 15px;
  color: var(--muted);
}

.file {
  font: inherit;
  font-size: 15px;
  font-weight: 400;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
