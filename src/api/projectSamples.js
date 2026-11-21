// Calls to the Express API at /api/project-samples
import { request } from './request'

const BASE = '/api/project-samples'

export function listProjectSamples() {
  return request(BASE)
}

export function createProjectSample(input) {
  return request(BASE, { method: 'POST', body: JSON.stringify(input) })
}

export function updateProjectSample(id, input) {
  return request(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
}

export function deleteProjectSample(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}
