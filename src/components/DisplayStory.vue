<template>
  <div>
    <SimpleLayout :header="false" style="max-height: 70vh">
      <template #body>
        <QMarkdown
            v-if="story"
            class="q-pa-sm"
            :src="story.description"
            style="max-width: 64em"
        />
      </template>
    </SimpleLayout>
  </div>
</template>

<script setup lang="ts">
import usePivotalStore, { PivotalStoryId } from 'src/pinia/pivotalStore';
import { computed, defineAsyncComponent, onMounted } from 'vue';

const SimpleLayout = defineAsyncComponent(() => import('src/components/SimpleLayout.vue'));
const QMarkdown = defineAsyncComponent(() => import('@quasar/quasar-ui-qmarkdown'));

const props = defineProps<{
    storyId: PivotalStoryId;
}>();

const store = usePivotalStore();

const story = computed(() => {

    return store.get(props.storyId);
})

const description = computed(() =>
{
    return !story.value ? undefined : story.value.description;
});

onMounted(async () =>
{
    await store.load({
        id: parseInt(`${props.storyId}`, 10)
    });
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
