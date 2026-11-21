// Calls to the Express API at /api/experience
import { request } from './request'

const BASE = '/api/experience'

export function listExperience() {
  return request(BASE)
}

export function createExperience(input) {
  return request(BASE, { method: 'POST', body: JSON.stringify(input) })
}

export function updateExperience(id, input) {
  return request(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
}

export function deleteExperience(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}
