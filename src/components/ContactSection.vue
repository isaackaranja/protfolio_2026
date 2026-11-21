<script setup>
import { reactive, ref } from 'vue'
import { profile } from '../data/profile'

const form = reactive({ name: '', email: '', message: '' })
// 'idle' | 'sending' | 'sent' | 'error'
const status = ref('idle')
const errorText = ref('')

async function sendMessage() {
  status.value = 'sending'
  try {
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? 'Could not send your message.')
    }
    Object.assign(form, { name: '', email: '', message: '' })
    status.value = 'sent'
  } catch (err) {
    errorText.value = err.message
    status.value = 'error'
  }
}
</script>

<template>
  <section id="contact" aria-labelledby="contact-title" class="contact">
    <div class="container inner">
      <h2 id="contact-title" class="title">Let's build something together.</h2>
      <p class="text">{{ profile.contactText }}</p>
      <div class="actions">
        <a :href="`mailto:${profile.email}`" class="btn btn-light">{{ profile.email }}</a>
        <a :href="profile.linkedinUrl" class="btn btn-ghost">LinkedIn ↗</a>
        <a :href="profile.githubUrl" class="btn btn-ghost">GitHub ↗</a>
      </div>

      <form class="form" @submit.prevent="sendMessage">
        <div class="row">
          <label class="field">
            <span>Name</span>
            <input v-model="form.name" type="text" name="name" autocomplete="name" maxlength="100" required />
          </label>
          <label class="field">
            <span>Email</span>
            <input v-model="form.email" type="email" name="email" autocomplete="email" maxlength="200" required />
          </label>
        </div>
        <label class="field">
          <span>Message</span>
          <textarea v-model="form.message" name="message" rows="5" maxlength="5000" required></textarea>
        </label>
        <div class="submit">
          <button type="submit" class="btn btn-light" :disabled="status === 'sending'">
            {{ status === 'sending' ? 'Sending…' : 'Send message' }}
          </button>
          <p class="status" role="status">
            <template v-if="status === 'sent'">Thanks! Your message was sent.</template>
            <template v-else-if="status === 'error'">{{ errorText }}</template>
          </p>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.contact {
  background: var(--ink);
  color: #ffffff;
}

.inner {
  padding-top: 104px;
  padding-bottom: 104px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.title {
  margin: 0;
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.1;
  max-width: 720px;
}

.text {
  margin: 0;
  font-size: 19px;
  line-height: 1.6;
  color: var(--on-dark-muted);
  max-width: 560px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.btn-light {
  background: #ffffff;
  color: var(--ink);
}

.btn-light:hover {
  color: var(--ink);
  background: var(--surface);
}

.btn-ghost {
  padding: 13px 21px;
  border: 1px solid var(--muted);
  color: #ffffff;
}

.btn-ghost:hover {
  color: #ffffff;
  border-color: #ffffff;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
  margin-top: 32px;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: var(--on-dark-muted);
}

.field input,
.field textarea {
  font: inherit;
  font-size: 16px;
  color: #ffffff;
  background: var(--ink-soft);
  border: 1px solid var(--muted);
  border-radius: 8px;
  padding: 12px 14px;
  resize: vertical;
}

.field input:focus-visible,
.field textarea:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 1px;
}

.submit {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.status {
  margin: 0;
  color: var(--on-dark-muted);
}

.contact a:focus-visible,
.contact button:focus-visible {
  outline-color: #ffffff;
}
</style>
