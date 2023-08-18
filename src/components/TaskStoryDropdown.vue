<template>
  <div v-if="stories && stories.length">
    <q-btn-dropdown
        size="sm"
        unelevated
        outline
        dense
    >
      <template #label>
        <span style="margin-right: -10px">{{ storyIds }}</span>
      </template>
      <q-item clickable style="min-width: 90%;">
        <q-item-section>
          <StoryCard
              v-for="story in stories"
              :key="story.id"
              :story-id="story.id"
          />
        </q-item-section>
      </q-item>
    </q-btn-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

const StoryCard = defineAsyncComponent(() => import('src/components/StoryCard.vue'));

const props = defineProps<{
    stories: Array<{ id: string|number }>;
}>();

const storyIds = computed(() => {
    return props.stories.map((s: { id: string|number }) => s.id).join(', ');
});
</script>
