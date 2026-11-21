import { getSession, logout } from './auth'

// Where the Express API lives. Empty locally, where /api is forwarded by Vite or nginx;
// set VITE_API_URL at build time when the API is on another domain (e.g. on Render).
export const API_URL = import.meta.env.VITE_API_URL ?? ''

// Sends a request to the Express API and returns the parsed JSON response.
// The body can be a JSON string or a File (sent as-is); asBlob returns the response as a file.
export async function request(url, { asBlob = false, ...options } = {}) {
  const session = getSession()
  const isFile = options.body instanceof Blob
  const res = await fetch(API_URL + url, {
    ...options,
    headers: {
      'Content-Type': isFile ? options.body.type || 'application/octet-stream' : 'application/json',
      ...(session && { Authorization: `Bearer ${session.token}` }),
    },
  })
  if (res.status === 204) return null
  if (asBlob && res.ok) return res.blob()

  const data = await res.json().catch(() => ({}))
  // The session expired or was revoked: send the admin back to log in
  if (res.status === 401 && session) {
    logout()
    window.location.assign(`/admin/login?redirect=${encodeURIComponent(window.location.pathname)}`)
  }
  if (!res.ok) throw new Error(data.error ?? 'Something went wrong. Please try again.')
  return data
}
