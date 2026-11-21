<script setup>
import { onMounted, ref } from 'vue'
import { getProfilePhoto, photoUrl } from '../api/profilePhoto'
import { about, profile } from '../data/profile'

// The photo uploaded on /admin/profile; the placeholder shows until there is one
const photo = ref(null)

onMounted(async () => {
  try {
    ;({ photo: photo.value } = await getProfilePhoto())
  } catch {
    // API unavailable: keep the placeholder
  }
})
</script>

<template>
  <section id="about" aria-labelledby="about-title" class="about">
    <div class="container inner">
      <img
        v-if="photo"
        :src="photoUrl(photo)"
        :alt="`Photo of ${profile.name}`"
        class="photo"
        loading="lazy"
        @error="photo = null"
      />
      <div v-else role="img" aria-label="Photo placeholder" class="photo placeholder-box">
        [Your photo]
      </div>

      <div class="body">
        <h2 id="about-title" class="section-title">About me</h2>
        <p v-for="(paragraph, index) in about.paragraphs" :key="index">{{ paragraph }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  border-top: 1px solid var(--border);
}

.inner {
  padding-top: 96px;
  padding-bottom: 96px;
  display: flex;
  flex-wrap: wrap;
  gap: 56px;
  align-items: flex-start;
}

.photo {
  flex: 0 0 240px;
  /* Without these, an image grows to its natural shape inside the flex row */
  width: 240px;
  min-width: 0;
  height: 280px;
  border-radius: 16px;
  object-fit: cover;
}

.body {
  flex: 1 1 420px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.body p {
  margin: 0;
  font-size: 18px;
  line-height: 1.7;
  color: var(--ink-soft);
}
</style>
