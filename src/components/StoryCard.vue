<template>
  <div v-if="!story" class="row items-center justify-center" style="width: 90vw">
    <q-spinner size="md" color="primary" class="q-ma-md" />
    <span>Loading {{ storyId }} ...</span>
  </div>
  <SimpleModal v-else full-width>
    <template #activator="{ open }">
      <div class="col full-width" @click="open">
        <div class="items-center q-my-sm full-width">
          <q-badge :label="story.estimate === 0 ? 0 : story.estimate || '?'" class="q-mr-xs" />
          <q-icon :name="story.story_type === 'feature' ? 'star' : 'bug_report'"
            :color="story.story_type === 'feature' ? 'warning' : 'negative'" />
          {{ story.name }}
        </div>
        <div class="items-center q-my-xs full-width">
          <q-chip v-for="label in story.labels" :label="label.name" :key="label.name"
            :color="label.name.includes('(') ? 'primary' : 'secondary'" class="q-ma-none q-mr-xs" style="color: #ddd"
            :size="dense ? 'sm' : 'md'" />
        </div>
        <div class="row q-mt-xs">
          <q-chip :color="story.created_at_color || 'primary'" square dense dark>
            {{ new Date(story.created_at).toDateString() }}
          </q-chip>
          <q-btn-group>
            <q-btn label="View" color="primary" :dense="dense" flat class="q-mr-xs"
              @click.stop.prevent="openInBrowser(story.url)" />
            <q-btn label="Git C/O" color="negative" :dense="dense" flat @click.stop.prevent="
              copyToClipboard(`git checkout PT_${story.id}`)
              " />
            <q-btn :label="story.id" color="secondary" :dense="dense" flat
              @click.stop.prevent="copyToClipboard(story.id)">
              <q-tooltip>Copy story ID</q-tooltip>
            </q-btn>
          </q-btn-group>
          <q-btn-group class="q-ml-xs">
            <q-btn v-if="allowAddTasks" label="Tasks" color="primary" :dense="dense" flat
              @click.stop.prevent="openTasksForStory">
              <q-tooltip>View tasks for {{ storyId }}</q-tooltip>
            </q-btn>
            <AddTask v-if="allowAddTasks" :initial-task-data="{ stories: [story.id] }" dense />
          </q-btn-group>
        </div>
      </div>
    </template>
    <template #title>
      <div class="col">
        <h5 class="q-mb-sm">{{ story.name }}</h5>
        <div>
          <q-chip v-for="label in story.labels" :label="label.name" :key="label.name"
            :color="label.name.includes('(') ? 'primary' : 'secondary'" class="q-ma-none q-mr-xs" style="color: #ddd"
            :size="dense ? 'sm' : 'md'" />
        </div>
      </div>
    </template>
    <template #content>
      <DisplayStory :story-id="story.id" />
    </template>
    <template #actions>
      <q-btn label="View" color="primary" :dense="dense" flat class="q-mr-xs"
        @click.stop.prevent="openInBrowser(story.url)" />
      <q-btn label="Git C/O" color="negative" :dense="dense" flat @click.stop.prevent="$emit('checkoutBoth', story.id)" />
    </template>
  </SimpleModal>
</template>

<script>
import {
  getFromLocalStorage,
  saveToLocalStorage,
  copyToClipboard,
  openInBrowser,
  localStorageNames,
  saveToLocalStorageArray,
} from 'src/utils';
import { getStory, loadStory } from 'src/storeHelpers';

export default {
  name: 'StoryCard',
  components: {
    AddTask: () => import('src/components/AddTask.vue'),
    DisplayStory: () => import('src/components/DisplayStory.vue'),
    SimpleModal: () => import('src/components/SimpleModal.vue'),
  },
  props: {
    noteId: {
      type: String,
      default: null,
    },
    storyId: {
      type: [String, Number],
      required: true,
    },
    dense: {
      type: Boolean,
      default: true,
    },
    allowAddTasks: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    story() {
      return getStory(this.$store, parseInt(this.storyId, 10));
    },
  },
  async mounted() {
    await loadStory(this.$store, parseInt(this.storyId, 10));
  },
  methods: {
    openInBrowser,
    copyToClipboard,
    openTasksForStory() {
      const existingFilters = getFromLocalStorage(
        localStorageNames.taskFilters,
        true
      );
      saveToLocalStorage(localStorageNames.taskFilters, {
        ...existingFilters,
        keyword: `${this.storyId}`,
      });
      saveToLocalStorageArray(localStorageNames.currentTab, 'tasks');
    },
  },
};
</script>
