<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../api/auth'
import './admin.css'

const route = useRoute()
const router = useRouter()

const password = ref('')
const loggingIn = ref(false)
const error = ref('')

// Only follow redirects to admin pages, so the link can't send you to another site
function nextPage() {
  const redirect = String(route.query.redirect ?? '')
  return redirect.startsWith('/admin/') ? redirect : '/admin/projects'
}

async function submit() {
  loggingIn.value = true
  error.value = ''
  try {
    await login(password.value)
    router.replace(nextPage())
  } catch (err) {
    error.value = err.message
    password.value = ''
  } finally {
    loggingIn.value = false
  }
}
</script>

<template>
  <main class="container admin">
    <header class="intro">
      <p class="eyebrow mono">Admin</p>
      <h1 class="section-title">Log in</h1>
    </header>

    <section class="panel login">
      <form class="form" @submit.prevent="submit">
        <label class="field">
          <span>Password</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            autofocus
            required
          />
        </label>
        <p v-if="error" class="error" role="alert">{{ error }}</p>
        <div>
          <button type="submit" class="btn btn-dark" :disabled="loggingIn">
            {{ loggingIn ? 'Logging in…' : 'Log in' }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.login {
  width: 100%;
  max-width: 420px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
