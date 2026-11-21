// Calls to the Express API at /api/contact-numbers
import { request } from './request'

const BASE = '/api/contact-numbers'

export function listContactNumbers() {
  return request(BASE)
}

export function createContactNumber(input) {
  return request(BASE, { method: 'POST', body: JSON.stringify(input) })
}

export function updateContactNumber(id, input) {
  return request(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
}

export function deleteContactNumber(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}

// "+254 (712) 345-678" → "tel:+254712345678", so tapping it on a phone starts a call
export function telHref(number) {
  return `tel:${number.replace(/[^\d+]/g, '')}`
}
