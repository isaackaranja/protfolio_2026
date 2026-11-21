// Admin login. The session token is kept in localStorage so it survives page reloads.
import { request } from './request'

const KEY = 'adminSession'

// Returns { token, expiresAt } while logged in, otherwise null
export function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(KEY))
    return session?.expiresAt > Date.now() ? session : null
  } catch {
    return null
  }
}

export function isLoggedIn() {
  return getSession() !== null
}

export async function login(password) {
  const session = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
  localStorage.setItem(KEY, JSON.stringify(session))
}

export function logout() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Storage blocked: nothing was saved, so there's nothing to clear
  }
}
