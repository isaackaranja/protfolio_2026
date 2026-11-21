<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { PUBLIC_CV_URL, getPublicDocuments } from '../api/documents'
import { isWebLink, loadHomepageLinks } from '../api/links'
import { profile } from '../data/profile'

// The CV chosen on /admin/documents; the button stays hidden until there is one
const cv = ref(null)
// Links added on /admin/links, e.g. GitHub and LinkedIn
const links = ref([])

onMounted(async () => {
  try {
    ;({ cv: cv.value } = await getPublicDocuments())
  } catch {
    // API unavailable: leave the button hidden rather than show a broken link
  }
})

onMounted(async () => {
  try {
    links.value = await loadHomepageLinks()
  } catch {
    // API unavailable: the email link still shows
  }
})
</script>

<template>
  <section aria-labelledby="hero-title" class="container hero">
    <p class="status mono">
      <span aria-hidden="true" class="dot"></span>
      hello {{ profile.name }}
      {{ profile.status }} · {{ profile.location }} · {{ profile.workMode }}
    </p>
    <h1 id="hero-title" class="title">
      I'm {{ profile.name }}, a {{ profile.role }} who builds {{ profile.pitch }}.
    </h1>
    <p class="intro">{{ profile.intro }}</p>

    <div class="actions">
      <RouterLink :to="{ path: '/', hash: '#work' }" class="btn btn-dark">
        See my work
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 5v14M5 12l7 7 7-7"></path>
        </svg>
      </RouterLink>
      <a v-if="cv" :href="PUBLIC_CV_URL" target="_blank" rel="noopener" class="btn btn-outline">
        Download résumé{{ cv.contentType === 'application/pdf' ? ' (PDF)' : '' }}
      </a>
    </div>

    <div class="socials mono">
      <a
        v-for="item in links"
        :key="item._id"
        :href="item.link"
        :title="item.description || undefined"
        :target="isWebLink(item.link) ? '_blank' : undefined"
        rel="noopener"
      >
        {{ item.linkName }}{{ isWebLink(item.link) ? ' ↗' : '' }}
      </a>
      <a :href="`mailto:${profile.email}`">{{ profile.email }}</a>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding-top: 112px;
  padding-bottom: 96px;
}

.status {
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #16a34a;
  display: inline-block;
  flex-shrink: 0;
}

.title {
  margin: 0;
  font-size: clamp(40px, 6vw, 68px);
  line-height: 1.05;
  font-weight: 600;
  letter-spacing: -0.035em;
  max-width: 880px;
}

.intro {
  margin: 28px 0 0;
  font-size: 20px;
  line-height: 1.6;
  color: var(--muted);
  max-width: 640px;
}

.actions {
  margin-top: 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.socials {
  margin-top: 56px;
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  font-size: 14px;
}

.socials a {
  text-decoration: underline;
  text-underline-offset: 4px;
  color: var(--muted);
  padding: 8px 0;
}

.socials a:hover {
  color: var(--accent);
}
</style>
