<template>
  <div class="col bordered q-pa-sm">
    <div v-if="showControls">
      <NoteControls :noteId="noteId" />
    </div>
    <div>
      <h4 class="text-grey-9 q-my-none">{{ note.title }}</h4>
      <q-separator class="q-my-sm" />
    </div>
    <div>
      <div
          v-html="note.content"
      />
    </div>
    <div v-if="stories && stories.length">
      <q-separator class="q-my-sm" />
      <div class="text-bold">Stories:</div>
      <q-btn
          v-for="(storyId, s) in stories"
          :key="`story-container-${storyId}-${s}`"
          icon="open_in_new"
          :label="storyId"
          class="q-mb-xs q-mr-xs"
          outline
          dense
          @click="openInBrowser(`https://www.pivotaltracker.com/stories/show/${storyId}`)"
      />
<!--      <q-item-->
<!--          v-for="(storyId, s) in stories"-->
<!--          :key="`story-container-${storyId}-${s}`"-->
<!--          class="q-mb-xs"-->
<!--          clickable-->
<!--      >-->
<!--        <StoryCard-->
<!--            name="StoryCardInMiniDisplay"-->
<!--            :storyId="storyId"-->
<!--            :noteId="note.id"-->
<!--            :key="`story-card-${storyId}`"-->
<!--            clearable-->
<!--            dense-->
<!--        />-->
<!--      </q-item>-->
    </div>
    <div v-if="tasks && tasks.length">
      <q-separator class="q-my-sm" />
      <div class="text-bold">Tasks:</div>
      <div style="max-height: 10em; overflow-y: scroll">
        <q-input
            v-for="(task, t) in tasks"
            :key="`note-task-${noteId}-${t}`"
            :label="task.message"
            class="q-mb-xs"
            outlined
            readonly
            dense
        >
          <template #append>
            <q-icon
                v-if="task.done"
                name="done"
                color="positive"
                dense
                flat
            />
            <q-icon
                v-else
                name="radio_button_unchecked"
                dense
                flat
            />
          </template>
        </q-input>
      </div>
    </div>
  </div>
</template>

<script>
import NoteControls from "./NoteControls";
import NoteControlsMixin from '../mixins/NoteControlsMixin.js';
// import StoryCard from "./StoryCard";
import { openInBrowser } from "src/utils";

export default {
  components: {
    // StoryCard,
    NoteControls
  },
  mixins: [NoteControlsMixin],
  props: {
    showControls: {
      type: Boolean,
      default: false
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
    openInBrowser
  }
};
</script>