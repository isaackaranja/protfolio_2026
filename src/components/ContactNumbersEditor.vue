<script setup>
import { nextTick, onMounted, reactive, ref } from 'vue'
import {
  createContactNumber,
  deleteContactNumber,
  listContactNumbers,
  updateContactNumber,
} from '../api/contactNumbers'

// Same rule as the API: digits with optional +, spaces, dashes, dots and brackets.
// Browsers check pattern in strict regex mode, where ( ) . - must be escaped inside [ ].
const NUMBER_PATTERN = '\\+?[\\d\\s\\(\\)\\.\\-]{7,}'
const NUMBER_HINT = 'A phone number with at least 7 digits, e.g. +254 712 345 678'

const numbers = ref([])
const loading = ref(true)
const loadError = ref('')

const newNumber = reactive({ label: '', number: '' })
const labelInput = ref(null)
const creating = ref(false)
const createError = ref('')

// _id of the number being edited, and its unsaved values
const editingId = ref(null)
const draft = reactive({ label: '', number: '' })
const updating = ref(false)
const updateError = ref('')

onMounted(async () => {
  try {
    numbers.value = await listContactNumbers()
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
    numbers.value.push(await createContactNumber(newNumber))
    Object.assign(newNumber, { label: '', number: '' })
    await nextTick()
    labelInput.value.focus()
  } catch (err) {
    createError.value = err.message
  } finally {
    creating.value = false
  }
}

function startEditing(item) {
  editingId.value = item._id
  Object.assign(draft, { label: item.label, number: item.number })
  updateError.value = ''
}

async function update(id) {
  updating.value = true
  updateError.value = ''
  try {
    const updated = await updateContactNumber(id, draft)
    numbers.value = numbers.value.map((item) => (item._id === id ? updated : item))
    editingId.value = null
  } catch (err) {
    updateError.value = err.message
  } finally {
    updating.value = false
  }
}

async function remove(item) {
  if (!confirm(`Delete ${item.label} (${item.number})?`)) return
  try {
    await deleteContactNumber(item._id)
    numbers.value = numbers.value.filter(({ _id }) => _id !== item._id)
  } catch (err) {
    alert(err.message)
  }
}
</script>

<template>
  <div class="editor">
    <p class="muted intro-text">
      Shown in the Get in touch section of your homepage, in this order. Anyone who visits the site can
      see them.
    </p>

    <form class="row-form" @submit.prevent="create">
      <label class="field">
        <span>Label</span>
        <input
          ref="labelInput"
          v-model="newNumber.label"
          type="text"
          maxlength="40"
          placeholder="e.g. Mobile"
          list="number-labels"
          required
        />
      </label>
      <label class="field">
        <span>Number</span>
        <input
          v-model="newNumber.number"
          type="tel"
          maxlength="30"
          placeholder="+254 712 345 678"
          autocomplete="tel"
          :pattern="NUMBER_PATTERN"
          :title="NUMBER_HINT"
          required
        />
      </label>
      <button type="submit" class="btn btn-dark" :disabled="creating">
        {{ creating ? 'Adding…' : 'Add' }}
      </button>
    </form>
    <p v-if="createError" class="error" role="alert">{{ createError }}</p>

    <datalist id="number-labels">
      <option value="Mobile" />
      <option value="WhatsApp" />
      <option value="Office" />
    </datalist>

    <p v-if="loading" class="muted">Loading…</p>
    <p v-else-if="loadError" class="error" role="alert">{{ loadError }}</p>
    <p v-else-if="!numbers.length" class="muted">No contact numbers yet.</p>

    <ul v-else class="list">
      <li v-for="item in numbers" :key="item._id" class="item">
        <form v-if="editingId === item._id" class="edit" @submit.prevent="update(item._id)">
          <div class="row-form">
            <input
              v-model="draft.label"
              type="text"
              maxlength="40"
              list="number-labels"
              aria-label="Label"
              required
            />
            <input
              v-model="draft.number"
              type="tel"
              maxlength="30"
              :pattern="NUMBER_PATTERN"
              :title="NUMBER_HINT"
              aria-label="Number"
              required
            />
            <div class="actions">
              <button type="submit" class="btn btn-dark small" :disabled="updating">
                {{ updating ? 'Saving…' : 'Save' }}
              </button>
              <button type="button" class="btn btn-outline small" @click="editingId = null">
                Cancel
              </button>
            </div>
          </div>
          <p v-if="updateError" class="error" role="alert">{{ updateError }}</p>
        </form>

        <template v-else>
          <p class="number">
            <span class="label">{{ item.label }}</span>
            <span class="mono">{{ item.number }}</span>
          </p>
          <div class="actions">
            <button type="button" class="btn btn-outline small" @click="startEditing(item)">
              Edit
            </button>
            <button
              type="button"
              class="btn btn-outline small danger"
              :aria-label="`Delete ${item.label}`"
              @click="remove(item)"
            >
              Delete
            </button>
          </div>
        </template>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.intro-text {
  font-size: 15px;
}

.row-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) auto;
  align-items: end;
  gap: 12px;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  padding: 14px 0;
  border-top: 1px solid var(--border);
}

.item:last-child {
  border-bottom: 1px solid var(--border);
}

.edit {
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.number {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  font-size: 16px;
}

.label {
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 560px) {
  .row-form {
    grid-template-columns: 1fr;
  }
}
</style>
