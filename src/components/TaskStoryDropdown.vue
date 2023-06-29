<template>
  <div>
    <q-btn-dropdown
        v-for="story in stories"
        :key="story.id"
        size="sm"
        unelevated
        outline
        dense
    >
      <template #label>
        <span style="margin-right: -10px">{{ story.id }}</span>
      </template>
      <q-item clickable style="min-width: 90%;">
        <q-item-section>
          <StoryCard
              :storyId="story.id"
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
  data()
  {
    return {
    };
  },
  computed: {
  },
  methods: {
  }
};
</script>