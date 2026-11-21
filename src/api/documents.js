// Calls to the Express API at /api/documents (CV and cover letter versions)
import { API_URL, request } from './request'

const BASE = '/api/documents'

// Link to the CV marked for the homepage; works without logging in
export const PUBLIC_CV_URL = `${API_URL}${BASE}/public/cv`

// { cv: { filename, contentType } } or { cv: null } when no CV is on the homepage
export function getPublicDocuments() {
  return request(`${BASE}/public`)
}

export function listDocuments() {
  return request(BASE)
}

// input: { kind: 'cv' | 'coverLetter', label, notes }
export function uploadDocument(file, input) {
  const params = new URLSearchParams({ ...input, filename: file.name })
  return request(`${BASE}?${params}`, { method: 'POST', body: file })
}

export function updateDocument(id, input) {
  return request(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
}

export function deleteDocument(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}

// Downloads a version with the admin login and saves it under its original file name
export async function downloadDocument(doc) {
  const blob = await request(`${BASE}/${doc._id}/file`, { asBlob: true })
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: doc.filename })
  link.click()
  URL.revokeObjectURL(url)
}
