<script setup>
import { profile } from '../data/profile'

// Request path from the visitor's browser to the database, drawn left to right
const layers = [
  { name: 'Browser', tech: 'Vue 3 · Vue Router', note: 'Single-page app built with Vite' },
  { name: 'API', tech: 'Node.js · Express', note: 'REST endpoints for every section' },
  { name: 'Database', tech: 'MongoDB · GridFS', note: 'Content, CV files and photos' },
]

const features = [
  {
    title: 'Content from a database',
    text: 'Projects, experience, skills, links and my CV are loaded from the API when the page opens, not hard-coded into it.',
  },
  {
    title: 'Admin portal I built',
    text: 'A password-protected dashboard where I add and edit everything on this page, and upload new CV and cover letter versions, without touching code.',
  },
  {
    title: 'Secure by default',
    text: 'Anyone can read; only a signed-in admin can write. Logins are rate-limited, input is validated and uploads are checked by file signature.',
  },
  {
    title: 'Containerised and deployed',
    text: 'Runs locally with Docker Compose (nginx, API, MongoDB) and in production on Render with MongoDB Atlas.',
  },
]
</script>

<template>
  <section aria-labelledby="built-title" class="built">
    <div class="container inner">
      <header class="intro">
        <p class="eyebrow mono">About this site</p>
        <h2 id="built-title" class="section-title">How this site works</h2>
        <p class="lead">
          This isn't a static page. It's a full-stack application I designed, built and deployed
          myself, and it's one of the projects I'm proudest of.
        </p>
      </header>

      <ol class="flow" aria-label="How a page request travels">
        <li v-for="layer in layers" :key="layer.name" class="layer">
          <span class="layer-name mono">{{ layer.name }}</span>
          <span class="layer-tech">{{ layer.tech }}</span>
          <span class="layer-note">{{ layer.note }}</span>
        </li>
      </ol>

      <div class="features">
        <div v-for="feature in features" :key="feature.title" class="feature">
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-text">{{ feature.text }}</p>
        </div>
      </div>

      <div v-if="profile.sourceUrl" class="actions">
        <a :href="profile.sourceUrl" target="_blank" rel="noopener" class="btn btn-outline">
          View the source on GitHub ↗
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.built {
  border-top: 1px solid var(--border);
}

.inner {
  padding-top: 88px;
  padding-bottom: 88px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.intro {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 640px;
}

.eyebrow {
  margin: 0;
  font-size: 13px;
  color: var(--accent);
  text-transform: uppercase;
}

.lead {
  margin: 0;
  font-size: 19px;
  line-height: 1.6;
  color: var(--muted);
}

/* Three boxes joined by arrows; stacks vertically on narrow screens */
.flow {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 40px;
}

.layer {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 24px;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  background: var(--surface-alt);
}

.layer + .layer::before {
  content: '→';
  position: absolute;
  top: 50%;
  left: -30px;
  transform: translateY(-50%);
  font-size: 20px;
  color: var(--muted);
}

.layer-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.layer-tech {
  font-size: 18px;
  font-weight: 600;
}

.layer-note {
  font-size: 15px;
  color: var(--muted);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 32px;
}

.feature {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.feature-text {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: var(--muted);
}

.actions {
  display: flex;
}

@media (max-width: 720px) {
  .flow {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .layer + .layer::before {
    content: '↓';
    top: -27px;
    left: 24px;
    transform: none;
  }
}
</style>
