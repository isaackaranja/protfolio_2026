<script setup>
import { reactive, ref } from 'vue'

const props = defineProps({
  // The experience entry being edited; leave out to create a new one
  initial: { type: Object, default: null },
  submitLabel: { type: String, default: 'Save' },
  saving: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['submit', 'cancel'])

// Same month format the API accepts, e.g. 2024-03
const MONTH_PATTERN = '\\d{4}-(0[1-9]|1[0-2])'

const form = reactive({
  title: props.initial?.title ?? '',
  company: props.initial?.company ?? '',
  location: props.initial?.location ?? '',
  startDate: props.initial?.startDate ?? '',
  endDate: props.initial?.endDate ?? '',
  description: props.initial?.description ?? '',
})

// A current role is saved with an empty end date. Existing entries without one start ticked.
const current = ref(Boolean(props.initial) && !props.initial.endDate)

function submit() {
  emit('submit', { ...form, endDate: current.value ? '' : form.endDate })
}

// Lets the parent clear the form after a successful create
function reset() {
  Object.assign(form, {
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
  })
  current.value = false
}

defineExpose({ reset })
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <div class="pair">
      <label class="field">
        <span>Job title</span>
        <input v-model="form.title" type="text" maxlength="100" placeholder="e.g. Frontend engineer" required />
      </label>
      <label class="field">
        <span>Company</span>
        <input v-model="form.company" type="text" maxlength="100" required />
      </label>
    </div>

    <label class="field">
      <span>Location</span>
      <span class="hint">Optional, e.g. Nairobi, Kenya or Remote.</span>
      <input v-model="form.location" type="text" maxlength="100" />
    </label>

    <div class="pair">
      <label class="field">
        <span>Start date</span>
        <!-- Browsers without a month picker (Safari) show a text box, hence the placeholder and pattern -->
        <input v-model="form.startDate" type="month" placeholder="2024-03" :pattern="MONTH_PATTERN" required />
      </label>
      <label class="field">
        <span>End date</span>
        <input
          v-model="form.endDate"
          type="month"
          placeholder="2024-03"
          :pattern="MONTH_PATTERN"
          :min="form.startDate || undefined"
          :disabled="current"
          :required="!current"
        />
      </label>
    </div>

    <label class="check">
      <input v-model="current" type="checkbox" />
      <span>I currently work here</span>
    </label>

    <label class="field">
      <span>Description</span>
      <span class="hint">What you built or owned, and the impact. Numbers help.</span>
      <textarea v-model="form.description" rows="5" maxlength="5000"></textarea>
    </label>

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

.pair {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.check {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  cursor: pointer;
}

.check input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--accent);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
