// Calls to the Express API at /api/links
import { request } from './request'

const BASE = '/api/links'

export function listLinks() {
  return request(BASE)
}

// The hero and contact sections both show the links; share one request between them
let homepageLinks = null
export function loadHomepageLinks() {
  homepageLinks ??= listLinks().catch((err) => {
    homepageLinks = null
    throw err
  })
  return homepageLinks
}

export function createLink(input) {
  return request(BASE, { method: 'POST', body: JSON.stringify(input) })
}

export function updateLink(id, input) {
  return request(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
}

export function deleteLink(id) {
  return request(`${BASE}/${id}`, { method: 'DELETE' })
}

// Web links open in a new tab and get an ↗; email links don't
export function isWebLink(link) {
  return /^https?:/i.test(link)
}
