// Calls to the Express API at /api/profile-photo
import { API_URL, request } from './request'

const BASE = '/api/profile-photo'

// Image address for a photo; the version makes browsers fetch a replaced photo instead of a cached one
export function photoUrl(photo) {
  return `${API_URL}${BASE}/file?v=${Date.parse(photo.updatedAt)}`
}

// { photo: { updatedAt } } or { photo: null }
export function getProfilePhoto() {
  return request(BASE)
}

export function uploadProfilePhoto(file) {
  return request(BASE, { method: 'PUT', body: file })
}

export function deleteProfilePhoto() {
  return request(BASE, { method: 'DELETE' })
}
