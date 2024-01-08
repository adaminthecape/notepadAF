<template>
  <div>
    <SimpleLayout :header="false" style="max-height: 70vh">
      <template #body>
        <div
          v-html="parsedMarkdown"
          class="q-pa-xs"
        ></div>
      </template>
    </SimpleLayout>
  </div>
</template>

<script setup lang="ts">
import { PivotalStoryId } from 'src/pinia/pivotalStore';
import { computed, defineAsyncComponent, onMounted } from 'vue';
import MarkdownIt from 'markdown-it';
import { usePivotalStory } from 'src/components/composables/pivotalStory';

const SimpleLayout = defineAsyncComponent(() => import('src/components/SimpleLayout.vue'));

const props = defineProps<{
  storyId: PivotalStoryId;
}>();

const { story } = usePivotalStory(props.storyId);

const parsedMarkdown = computed(() => {
  if(!story.value?.description)
  {
    return '';
  }

  const markdown = new MarkdownIt();

  return markdown.render(story.value.description);
});
</script>

<style>
.full-height {
  min-height: 92vh;
  max-height: 92vh;
  max-width: 50%;
  overflow-y: scroll;
}

pre {
  white-space: pre-wrap;
}

.markdown-attention {
  color: #f00;
  background: #ff0;
  padding: 0 4px;
  border-radius: 4px;
}

#selectionMenu {
  display: none;
  position: absolute;
  left: -10000px;
  top: -10000px;
  background: white;
  border-radius: 6px;
  border: 1px solid #aaa;
  overflow-y: scroll;
  max-height: 20em;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  line-height: 1em;
}

h1 {
  font-size: 2em;
}

h2 {
  font-size: 1.8em;
}

h3 {
  font-size: 1.6em;
}

h4 {
  font-size: 1.4em;
}

h5 {
  font-size: 1.2em;
}

h6 {
  font-size: 1em;
}
</style>
