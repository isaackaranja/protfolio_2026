import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { Router } from 'express'

// Both must be set, or nobody can log in (and so nobody can change content)
const PASSWORD = process.env.ADMIN_PASSWORD ?? ''
const SECRET = process.env.SESSION_SECRET ?? ''

const SESSION_MS = 7 * 24 * 60 * 60 * 1000

// Wrong passwords allowed per IP address in each window
const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60 * 1000
const attempts = new Map()

export const router = Router()

if (!PASSWORD || !SECRET) {
  console.warn('ADMIN_PASSWORD or SESSION_SECRET is not set: admin login is disabled.')
}

// Compares hashes so the check takes the same time however much of the password is right
function passwordMatches(input) {
  const hash = (value) => createHash('sha256').update(value).digest()
  return Boolean(PASSWORD) && timingSafeEqual(hash(input), hash(PASSWORD))
}

function sign(expiresAt) {
  return createHmac('sha256', SECRET).update(`admin:${expiresAt}`).digest('base64url')
}

// A token is "<expiry time>.<signature>". Only the server knows SECRET, so only it can make one.
function createToken() {
  const expiresAt = Date.now() + SESSION_MS
  return { token: `${expiresAt}.${sign(expiresAt)}`, expiresAt }
}

function tokenIsValid(token) {
  if (!SECRET || typeof token !== 'string') return false
  const [expiresAt, signature = ''] = token.split('.')
  if (!(Number(expiresAt) > Date.now())) return false
  const expected = Buffer.from(sign(expiresAt))
  const actual = Buffer.from(signature)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

// Returns true when this IP has used up its wrong guesses for now
function isLockedOut(ip) {
  const entry = attempts.get(ip)
  if (entry && entry.resetAt < Date.now()) attempts.delete(ip)
  return (attempts.get(ip)?.count ?? 0) >= MAX_ATTEMPTS
}

function recordFailure(ip) {
  const entry = attempts.get(ip) ?? { count: 0, resetAt: Date.now() + WINDOW_MS }
  entry.count += 1
  attempts.set(ip, entry)
}

// Route middleware: lets the request through only with a valid admin token
export function requireAdmin(req, res, next) {
  const token = req.get('Authorization')?.replace(/^Bearer /, '')
  if (!tokenIsValid(token)) return res.status(401).json({ error: 'Please log in again.' })
  next()
}

// POST /api/auth/login — exchange the admin password for a session token
router.post('/login', (req, res) => {
  if (isLockedOut(req.ip)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' })
  }
  if (!SECRET || !passwordMatches(String(req.body?.password ?? ''))) {
    recordFailure(req.ip)
    return res.status(401).json({ error: 'Wrong password.' })
  }
  attempts.delete(req.ip)
  res.json(createToken())
})
