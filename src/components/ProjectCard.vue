<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  // A project sample from the API
  project: { type: Object, required: true },
  index: { type: Number, required: true },
})

// Longer text fields shown under "Read more", in this order
const DETAILS = [
  { field: 'working', label: 'How it works' },
  { field: 'contribution', label: 'My contribution' },
  { field: 'businessValue', label: 'Business value' },
]

const number = String(props.index + 1).padStart(2, '0')

// The first image is the cover; if it fails to load the card shows text only
const imageBroken = ref(false)
const cover = computed(() => (imageBroken.value ? null : props.project.images?.[0]))

const details = computed(() => DETAILS.filter(({ field }) => props.project[field]))
</script>

<template>
  <article class="card" :class="{ 'no-media': !cover }">
    <img
      v-if="cover"
      :src="cover"
      :alt="`Screenshot of ${project.name}`"
      class="media"
      loading="lazy"
      @error="imageBroken = true"
    />

    <div class="body">
      <p class="meta mono">{{ number }}</p>
      <h3 class="name">{{ project.name }}</h3>
      <p v-if="project.description" class="description">{{ project.description }}</p>

      <details v-if="details.length" class="more">
        <summary>Read more</summary>
        <div v-for="detail in details" :key="detail.field" class="detail">
          <h4 class="detail-title">{{ detail.label }}</h4>
          <p class="detail-text">{{ project[detail.field] }}</p>
        </div>
      </details>
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

.card.no-media {
  align-items: flex-start;
}

.media {
  flex: 1 1 420px;
  min-width: 0;
  aspect-ratio: 16 / 10;
  border-radius: 10px;
  object-fit: cover;
  background: var(--surface);
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
  white-space: pre-line;
}

/* Without an image, keep lines a readable length */
.no-media .description,
.no-media .more {
  max-width: 760px;
}

.more summary {
  width: fit-content;
  padding: 10px 0;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.more summary:hover {
  color: var(--accent);
}

.more summary:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}

.more[open] summary {
  margin-bottom: 8px;
}

.detail {
  padding: 16px 0;
  border-top: 1px solid var(--border);
}

.detail-title {
  margin: 0 0 8px;
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Keep the line breaks typed into the admin form */
.detail-text {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--ink-soft);
  white-space: pre-line;
}

@media (max-width: 560px) {
  .card {
    padding: 20px;
    gap: 24px;
  }
}
</style>
