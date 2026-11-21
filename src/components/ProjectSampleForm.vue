<script setup>
import { reactive } from 'vue'

const props = defineProps({
  // The project sample being edited; leave out to create a new one
  initial: { type: Object, default: null },
  submitLabel: { type: String, default: 'Save' },
  saving: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['submit', 'cancel'])

const MAX_IMAGES = 10

const form = reactive({
  name: props.initial?.name ?? '',
  description: props.initial?.description ?? '',
  working: props.initial?.working ?? '',
  contribution: props.initial?.contribution ?? '',
  businessValue: props.initial?.businessValue ?? '',
  images: [...(props.initial?.images ?? [])],
})

// Image links whose preview failed to load
const broken = reactive(new Set())

function addImage() {
  form.images.push('')
}

function removeImage(index) {
  form.images.splice(index, 1)
}

function submit() {
  emit('submit', { ...form, images: form.images.map((url) => url.trim()).filter(Boolean) })
}

// Lets the parent clear the form after a successful create
function reset() {
  Object.assign(form, {
    name: '',
    description: '',
    working: '',
    contribution: '',
    businessValue: '',
    images: [],
  })
}

defineExpose({ reset })
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <label class="field">
      <span>Name</span>
      <input v-model="form.name" type="text" maxlength="100" required />
    </label>

    <label class="field">
      <span>Description</span>
      <textarea v-model="form.description" rows="4" maxlength="2000"></textarea>
    </label>

    <label class="field">
      <span>How it works</span>
      <span class="hint">How it works and what problems it solves.</span>
      <textarea v-model="form.working" rows="6" maxlength="5000"></textarea>
    </label>

    <label class="field">
      <span>My contribution</span>
      <span class="hint">What you built or owned on this project.</span>
      <textarea v-model="form.contribution" rows="5" maxlength="5000"></textarea>
    </label>

    <label class="field">
      <span>Business value</span>
      <span class="hint">The impact for users or the business: time saved, revenue, growth.</span>
      <textarea v-model="form.businessValue" rows="5" maxlength="5000"></textarea>
    </label>

    <fieldset class="images">
      <legend>Images</legend>
      <p class="hint">
        Paste links to images hosted elsewhere (https://…), or paths to files in the
        <code>public/</code> folder (/images/app.png).
      </p>

      <div v-for="(url, index) in form.images" :key="index" class="image-row">
        <div class="preview">
          <img v-if="url && !broken.has(url)" :src="url" alt="" @error="broken.add(url)" />
          <span v-else class="mono">{{ url ? "Can't load" : 'Preview' }}</span>
        </div>
        <input
          v-model="form.images[index]"
          type="text"
          inputmode="url"
          placeholder="https://…"
          :aria-label="`Image ${index + 1} link`"
        />
        <button type="button" class="btn btn-outline small" @click="removeImage(index)">
          Remove
        </button>
      </div>

      <button
        v-if="form.images.length < MAX_IMAGES"
        type="button"
        class="btn btn-outline small"
        @click="addImage"
      >
        + Add image
      </button>
    </fieldset>

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <div class="actions">
      <button type="submit" class="btn btn-dark" :disabled="saving">
        {{ saving ? 'Saving…' : submitLabel }}
      </button>
      <button v-if="initial" type="button" class="btn btn-outline" @click="emit('cancel')">
        Cancel
      </button>
    </div>
  </form>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.images {
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.images legend {
  padding: 0;
  font-size: 14px;
  font-weight: 500;
}

.images .hint {
  margin-top: 8px;
}

.image-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

.image-row input {
  flex: 1;
}

.preview {
  flex: none;
  width: 72px;
  aspect-ratio: 4 / 3;
  border-radius: 6px;
  background: var(--surface);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--placeholder);
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 560px) {
  .image-row {
    flex-wrap: wrap;
  }

  .image-row input {
    flex-basis: calc(100% - 84px);
  }
}
</style>
