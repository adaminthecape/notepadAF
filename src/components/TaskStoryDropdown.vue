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

<script>
import StoryCard from './StoryCard';

export default {
  components: {
    StoryCard
  },
  props: {
    stories: {
      type: Array,
      required: true
    }
  },
  computed: {
    storyIds() {
      return this.stories.map((s) => s.id).join(', ');
    }
  }
};
</script>
