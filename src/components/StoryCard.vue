<template>
  <div v-if="!story" class="row items-center justify-center" style="width: 90vw">
    <q-spinner size="md" color="primary" class="q-ma-md" />
    <span>Loading {{ storyId }} ...</span>
  </div>
  <SimpleModal
      v-else
      fullWidth
  >
    <template #activator="{ open }">
      <div class="col" @click="open">
        <div class="items-center q-my-sm">
          <q-badge
              :label="story.estimate === 0 ? 0 : story.estimate || '?'"
              class="q-mr-xs"
          />
          <q-icon
              :name="story.story_type === 'feature' ? 'star' : 'bug_report'"
              :color="story.story_type === 'feature' ? 'warning' : 'negative'"
          />
          {{ story.name }}
        </div>
        <div>
          <q-chip
              v-for="label in story.labels"
              :label="label.name"
              :key="label.name"
              :color="label.name.includes('(') ? 'primary' : 'secondary'"
              class="q-ma-none q-mr-xs"
              style="color: #ddd"
              :size="dense ? 'sm' : 'md'"
          />
        </div>
        <div class="q-mt-sm">
          <q-btn
              label="View"
              color="primary"
              :dense="dense"
              flat
              class="q-mr-xs"
              @click.stop.prevent="$openLink(story.url)"
          />
          <q-btn
              label="Git C/O"
              color="negative"
              :dense="dense"
              flat
              @click.stop.prevent="copyToClipboard(`git checkout PT_${story.id}`)"
          />
          <q-btn
              :label="story.id"
              color="secondary"
              :dense="dense"
              flat
              @click.stop.prevent="copyToClipboard(story.id)"
          >
            <q-tooltip>Copy story ID</q-tooltip>
          </q-btn>
          <q-btn-group>
            <q-btn
                v-if="allowAddTasks"
                label="Tasks"
                color="primary"
                :dense="dense"
                flat
                @click.stop.prevent="openTasksForStory"
            >
              <q-tooltip>View tasks for {{ storyId }}</q-tooltip>
            </q-btn>
            <AddTask
                v-if="allowAddTasks"
                :initialTaskData="{ stories: [story.id] }"
                dense
            />
          </q-btn-group>
        </div>
      </div>
    </template>
    <template #title>
      <div class="col">
        <h5 class="q-mb-sm">{{ story.name }}</h5>
        <div>
          <q-chip
              v-for="label in story.labels"
              :label="label.name"
              :key="label.name"
              :color="label.name.includes('(') ? 'primary' : 'secondary'"
              class="q-ma-none q-mr-xs"
              style="color: #ddd"
              :size="dense ? 'sm' : 'md'"
          />
        </div>
      </div>
    </template>
    <template #content>
      <DisplayStory :storyId="story.id" />
    </template>
    <template #actions>
      <q-btn
          label="View"
          color="primary"
          :dense="dense"
          flat
          class="q-mr-xs"
          @click.stop.prevent="$openLink(story.url)"
      />
      <q-btn
          label="Git C/O"
          color="negative"
          :dense="dense"
          flat
          @click.stop.prevent="$emit('checkoutBoth', story.id)"
      />
    </template>
  </SimpleModal>
</template>

<script>
  import DisplayStory from './DisplayStory';
  import SimpleModal from './SimpleModal';
  import AddTask from "components/AddTask";
  import { getFromLocalStorage, saveToLocalStorage, copyToClipboard } from "src/utils";

  export default {
    name: 'StoryCard',
    components: {
      AddTask,
      DisplayStory,
      SimpleModal
    },
    props: {
      // story: {
      //   type: Object,
      //   required: true
      // },
      noteId: {
        type: String,
        default: null
      },
      storyId: {
        type: [String, Number],
        required: true
      },
      dense: {
        type: Boolean,
        default: true
      },
      allowAddTasks: {
        type: Boolean,
        default: false
      }
    },
    inject: ['$openLink', '$openNote', '$openTab'],
    computed: {
      story()
      {
        return this.$store.getters['pivotal/get'](parseInt(this.storyId, 10));
      },
      relatedNotes()
      {
        const notes = this.$store.getters['notes/all'];

        if(!notes || !notes.length)
        {
          return [];
        }

        return notes.filter((note) =>
        {
          return note && note.stories && note.stories.length && note.stories.some(
              (storyId) => parseInt(storyId, 10) === parseInt(this.storyId, 10)
          );
        }).map((note) => note.id);
      }
    },
    async mounted()
    {
      await this.$store.dispatch('pivotal/load', { id: parseInt(this.storyId, 10) });
    },
    methods: {
      copyToClipboard,
      openTasksForStory()
      {
        const existingFilters = getFromLocalStorage('taskFilters', true);
        saveToLocalStorage('taskFilters', { ...existingFilters, keyword: `${this.storyId}` });
        this.$openTab('tasks');
      }
    }
  };
</script>