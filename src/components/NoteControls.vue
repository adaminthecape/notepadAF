<template>
  <div
      v-if="note"
      :style="addStyle"
      :key="renderIndex"
  >
    <div class="wikiEditor">
      <div class="row items-center">
        <slot name="before" />
        <q-btn
            icon="task"
            :label="!dense ? 'Stories' : undefined"
            class="q-mr-xs"
            dense
            flat
            @click="isAttachingStory = !isAttachingStory"
        />
        <q-dialog v-model="isAttachingStory">
          <q-card>
            <!-- attach story -->
            <q-item class="q-mb-xs q-pa-sm">
              <q-item-section class="full-width">
                <q-input
                    v-model="storyIdToAttach"
                    placeholder="Story ID"
                    class="q-mr-sm"
                    outlined
                    dense
                >
                  <template #append>
                    <q-btn
                        aria-label="Attach story"
                        label="Attach"
                        dense
                        flat
                        @click="attachStory(note.id, storyIdToAttach)"
                    />
                  </template>
                </q-input>
              </q-item-section>
            </q-item>

            <!-- story card list -->
            <div v-if="note && note.stories" class="q-pa-xs">
              <q-item
                  v-for="(story, s) in attachedStories"
                  :key="`story-container-${story.id}-${s}`"
                  class="q-mb-xs"
                  clickable
              >
                <StoryCard
                    :storyId="story.id"
                    :noteId="note.id"
                    :key="`story-card-${story.id}`"
                    clearable
                    dense
                    @checkoutBoth="checkoutBoth($event)"
                />
              </q-item>
            </div>
          </q-card>
        </q-dialog>
        <q-btn
            :label="!dense ? 'Alerts' : undefined"
            :icon="note.alerts && note.alerts.length ? 'notifications_active' : 'notifications'"
            class="q-mr-xs"
            dense
            flat
            @click="isShowingAlerts = true"
        />
        <q-dialog v-model="isShowingAlerts" fullWidth>
          <q-card>
            <q-card-section>
              <h5 class="justify-center">
                Alerts for {{ note.title }}
              </h5>
              <div class="col">
                <div
                    v-if="note.alerts && note.alerts.length"
                    class="col"
                >
                  <div
                      v-for="(alert, a) in note.alerts"
                      :key="`alert-${note.id}-${a}`"
                  >
                    <q-item clickable>
                      <q-item-section>
                        <div class="row items-center">
                          <q-icon
                              name="timer"
                              size="sm"
                              class="q-mr-sm"
                          />
                          <div class="col">
                            <div>{{ alert.message }}</div>
                            <div class="text-grey-9">
                              {{ alert.date }} at {{ alert.time }}
                            </div>
                            <div class="text-grey-9">
                              Created {{ $timeSince(alert.created) }}
                            </div>
                          </div>
                        </div>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
                <div v-else>
                  No alerts for this note.
                </div>
                <q-btn
                    :label="!dense ? 'Add new' : undefined"
                    icon="add_alert"
                    class="q-mt-md"
                    dense
                    flat
                    @click="isCreatingAlert = true"
                />
                <q-dialog v-model="isCreatingAlert" fullWidth>
                  <q-card>
                    <q-card-section>
                      <h5 class="justify-center">
                        Create alert for {{ note.title }}
                      </h5>
                      <div class="row items-center">
                        <q-date
                            v-model="createAlertDate"
                            type="text"
                            label="Date"
                        />
                        <q-time
                            v-model="createAlertTime"
                            type="text"
                            label="Time"
                            class="q-mx-sm"
                        />
                      </div>
                      <div class="row q-mt-md">
                        <q-input
                            v-model="createAlertMessage"
                            placeholder="Alert message..."
                            class="full-width"
                            filled
                        />
                      </div>
                      <div class="row q-mt-md">
                        <q-space />
                        <q-btn
                            label="Save"
                            color="secondary"
                            @click="createAlert"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </q-dialog>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
        <ButtonWrapper
            v-if="note.isStarred"
            :label="!dense ? 'UnStar' : undefined"
            icon="star"
            class="q-mr-xs"
            :qProps="{ dense: true, flat: true }"
            @click="toggleStarred"
        />
        <q-btn
            v-else
            :label="!dense ? 'Star' : undefined"
            icon="star_border"
            class="q-mr-xs"
            dense
            flat
            @click="toggleStarred"
        />
        <q-btn
            :label="!dense ? 'Save' : undefined"
            icon="save"
            class="q-mr-xs"
            dense
            flat
            @click="saveNote(note)"
        />
        <q-btn
            :label="!dense ? 'Delete' : undefined"
            icon="delete"
            dense
            flat
            @click="isConfirmingDeletion = true"
        />
        <q-dialog v-model="isConfirmingDeletion">
          <q-card>
            <q-card-section>
              <div>Are you sure you want to delete this note?</div>
              <div class="row q-mt-md">
                <q-space />
                <q-btn
                    :label="!dense ? 'Delete' : undefined"
                    icon="delete"
                    color="negative"
                    dense
                    flat
                    @click="deleteNote(note); isConfirmingDeletion = false"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>

        <slot name="after" />
      </div>
    </div>
  </div>
</template>

<script>
import { checkoutBoth } from '../mixins/git';
import StoryCard from './StoryCard';
import ButtonWrapper from './ButtonWrapper';
import NoteControlsMixin from '../mixins/NoteControlsMixin.js';

export default {
  name: 'NoteControls',
  components: {
    StoryCard,
    ButtonWrapper
  },
  mixins: [NoteControlsMixin],
  props: {
    addStyle: {
      type: String,
      default: undefined
    },
    dense: {
      type: Boolean,
      default: false
    }
  },
  data()
  {
    const d = new Date();
    const time = `${d.getHours()}:${d.getMinutes()}`;
    const date = `${d.getMonth()}/${d.getDate()}/${d.getFullYear()}`;

    return {
      renderIndex: 0,
      isShowingAlerts: false,
      isCreatingAlert: false,
      isConfirmingDeletion: false,
      isAttachingStory: false,
      storyIdToAttach: null,
      createAlertDate: date,
      createAlertTime: time,
      createAlertMessage: ''
    };
  },
  inject: ['$timeSince', '$notify'],
  computed: {
    attachedStories()
    {
      if(!this.note)
      {
        return [];
      }

      const stories = this.$store.getters['pivotal/all'] || [];
      const storiesForNote = (this.note.stories || [])
          .map((id) => parseInt(id, 10));

      if(!stories.length || !storiesForNote.length)
      {
        return [];
      }

      return stories.filter((s) => storiesForNote.includes(s.id));
    }
  },
  watch: {
  },
  methods: {
    checkoutBoth,
    attachStory(noteId, storyId)
    {
      if(!storyId || !noteId)
      {
        return;
      }

      const note = this.$store.getters['notes/getNote'](noteId);

      if(note)
      {
        if(!Array.isArray(note.stories))
        {
          note.stories = [];
        }

        storyId = parseInt(storyId.replace(/ /g, ''));

        note.stories = note.stories.map((storyId) =>
        {
          if(typeof storyId === 'string')
          {
            return parseInt(storyId.replace(/ /g, ''), 10)
          }

          return storyId;
        });

        console.log('stories', note.stories);
        console.log('storyId', storyId);

        if(!note.stories.includes(storyId))
        {
          note.stories.push(storyId);
        }

        this.$store.dispatch('notes/update', { note });

        this.$notify(`Attached PT: ${storyId}`);
      }

      this.storyIdToAttach = null;
    },
    deleteNote()
    {
      this.$store.dispatch('notes/deleteNote', { id: this.note.id });
    },
    saveNote()
    {
      this.$store.dispatch('notes/saveAll');
    },
    createAlert(data)
    {
      // todo: convert to unix timestamp
      this.$emit('createAlert', {
        id: this.noteId,
        created: new Date().getTime(),
        time: this.createAlertTime,
        date: this.createAlertDate,
        unix: new Date(`${this.createAlertDate} ${this.createAlertTime}`).getTime(),
        message: this.createAlertMessage
      });

      this.isCreatingAlert = false;
    },
    toggleStarred()
    {
      this.$store.dispatch('notes/starNote', this.noteId);
    }
  }
};
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

h1, h2, h3, h4, h5, h6 { line-height: 1em; }
h1 { font-size: 2em; }
h2 { font-size: 1.8em; }
h3 { font-size: 1.6em; }
h4 { font-size: 1.4em; }
h5 { font-size: 1.2em; }
h6 { font-size: 1em; }
</style>
