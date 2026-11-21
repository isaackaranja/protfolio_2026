// Calls to the Express API at /api/skills
import { request } from './request'

const BASE = '/api/skills'

export function listSkills() {
  return request(BASE)
}

export function createSkill(input) {
  return request(BASE, { method: 'POST', body: JSON.stringify(input) })
}

export function updateSkill(id, input) {
  return request(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
}

export function deleteSkill(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}
