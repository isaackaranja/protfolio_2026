<script setup>
const props = defineProps({
  project: { type: Object, required: true },
  index: { type: Number, required: true },
})

const number = String(props.index + 1).padStart(2, '0')
</script>

<template>
  <article class="card">
    <img
      v-if="project.image"
      :src="project.image"
      :alt="`Screenshot of ${project.name}`"
      class="media"
    />
    <div v-else class="media placeholder-box">[Project screenshot]</div>

    <div class="body">
      <p class="meta mono">{{ number }} · {{ project.year }} · {{ project.kind }}</p>
      <h3 class="name">{{ project.name }}</h3>
      <p class="description">{{ project.description }}</p>
      <ul aria-label="Tech stack" class="stack">
        <li v-for="tech in project.stack" :key="tech" class="mono">{{ tech }}</li>
      </ul>
      <div class="links">
        <a v-if="project.demoUrl" :href="project.demoUrl">Live demo ↗</a>
        <a v-if="project.repoUrl" :href="project.repoUrl">Source code ↗</a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  align-items: center;
  padding: 32px;
  border: 1px solid var(--border);
  border-radius: 16px;
}

.media {
  flex: 1 1 420px;
  min-width: 0;
  aspect-ratio: 16 / 10;
  border-radius: 10px;
  object-fit: cover;
}

.body {
  flex: 1 1 340px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.meta {
  margin: 0;
  font-size: 13px;
  color: var(--accent);
}

.name {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.description {
  margin: 0;
  font-size: 17px;
  line-height: 1.6;
  color: var(--muted);
}

.stack {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.stack li {
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--surface);
  color: var(--ink-soft);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 8px;
}

.links a {
  font-size: 15px;
  font-weight: 500;
  padding: 10px 0;
}

@media (max-width: 560px) {
  .card {
    padding: 20px;
    gap: 24px;
  }
}
</style>
