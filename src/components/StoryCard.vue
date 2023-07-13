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
          <q-btn
              v-if="clearable"
              icon="close"
              color="negative"
              :dense="dense"
              flat
              :size="dense ? 'sm' : 'md'"
              class="q-mr-xs"
              @click.stop.prevent="removeStory"
          />
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
              @click.stop.prevent="$emit('checkoutBoth', story.id)"
          />
          <q-btn
              :label="story.id"
              color="secondary"
              :dense="dense"
              flat
              @click.stop.prevent="copy(story.id)"
          />
          <q-btn
              label="Open tasks"
              color="primary"
              :dense="dense"
              flat
              @click.stop.prevent="openTasksForStory"
          />
          <AddTask
              :initialTaskData="{ stories: [story.id] }"
              dense
          />
          <SimpleModal
            v-if="relatedNotes.length"
            style="display: inline"
          >
            <template #activator="{ open }">
              <q-btn
                  :label="`${relatedNotes.length} notes`"
                  color="primary"
                  :dense="dense"
                  flat
                  @click.stop.prevent="open"
              />
            </template>
            <template #content>
              <q-card
                  v-for="noteId in relatedNotes"
                  :key="`noteCard-${noteId}`"
                  bordered
                  class="q-pa-none q-ma-none"
              >
                <NoteCard
                    :noteId="noteId"
                    @selectedNote="$openNote(noteId)"
                />
              </q-card>
            </template>
          </SimpleModal>
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
  import NoteCard from './NoteCard';
  import SimpleModal from './SimpleModal';
  import { copyToClipboard } from 'quasar';
  import AddTask from "components/AddTask";
  import { saveToLocalStorage } from "src/utils";

  export default {
    name: 'StoryCard',
    components: {
      AddTask,
      DisplayStory,
      NoteCard,
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
      clearable: {
        type: Boolean,
        default: false
      }
    },
    inject: ['$openLink', '$openNote', '$addOrUpdateTask', '$openTab'],
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
      async copy(text)
      {
        await copyToClipboard(text);
      },
      removeStory()
      {
        if(!this.noteId)
        {
          return;
        }

        this.$store.dispatch('notes/removeStory', {
          noteId: this.noteId,
          storyId: this.story.id
        });

        this.$emit('removed');
      },
      openTasksForStory()
      {
        saveToLocalStorage('taskFilters', { keyword: `${this.storyId}` });
        this.$openTab('tasks');
      }
    }
  };
</script>