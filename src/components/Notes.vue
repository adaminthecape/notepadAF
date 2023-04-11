<template>
  <div>
    <div v-if="reRendering">
      <q-spinner color="primary" size="sm" class="justify-center items-center" />
    </div>
    <div
        v-else
        class="col"
        :key="controlsRenderIndex"
    >
      <SimpleLayout header>
        <template #body>
          <q-drawer
              v-model="isDrawerRightOpen"
              side="right"
              unelevated
              :width="400"
              :breakpoint="100"
          >
            <!-- attach story -->
            <q-card class="q-mb-xs">
              <q-card-section>
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
                        @click="attachStory(selectedNote.id, storyIdToAttach)"
                    />
                  </template>
                </q-input>
              </q-card-section>
            </q-card>

            <!-- story card list -->
            <div v-if="selectedNote && selectedNote.stories" class="q-pa-xs">
              <q-card
                  v-for="(story, s) in attachedStories"
                  :key="`story-container-${story.id}-${s}`"
                  class="q-mb-xs"
              >
                <q-item clickable>
                  <StoryCard
                      :storyId="story.id"
                      :noteId="selectedNote.id"
                      @checkoutBoth="checkoutBoth($event)"
                  />
                </q-item>
              </q-card>
            </div>
          </q-drawer>
        </template>
        <template #header-left>
          <!-- add new note -->
          <SimpleModal>
            <template #activator="{ open }">
              <q-btn
                  aria-label="Add new"
                  icon="add_comment"
                  class="q-mr-sm"
                  dense
                  flat
                  @click="open"
              />
            </template>
            <template #title>
              <h5>Create new note</h5>
            </template>
            <template #content>
              <q-input
                  label="Title"
                  v-model="newNote.title"
                  filled
                  style="width: 24em"
              />
              <!--                <q-input-->
              <!--                    type="textarea"-->
              <!--                    label="Content"-->
              <!--                    v-model="newNote.content"-->
              <!--                />-->
            </template>
            <template #actions="{ close }">
              <q-btn
                  label="Create"
                  color="secondary"
                  flat
                  @click="createNote(); close();"
              />
            </template>
          </SimpleModal>
        </template>
        <template #header-title>
          <div class="row items-center">
            <!-- note selector -->
            <q-select
                v-model="selectedNoteId"
                :options="filteredNotesList"
                style="flex-grow: 1000"
                clearable
                filled
                dense
                useInput
                dark
                @filter="filterFn"
            >
              <template #option="{ opt }">
                <q-item clickable class="q-pa-sm full-width">
                  <div class="row items-center">
                    <div class="col">
                      <div class="row items-center">
                        <q-icon
                            v-if="getNote(opt.value).isStarred"
                            name="star"
                            class="q-ma-xs"
                            color="warning"
                        />
                        <div>
                          {{ opt.label }}
                        </div>
                        <q-space />
                        <div>
                          <q-badge
                              :label="getNote(opt.value).created"
                              dense
                          />
                          <q-badge
                              v-if="getNote(opt.value).tasks"
                              :label="`${getNote(opt.value).tasks.length} tasks`"
                              color="primary"
                              class="text-bold"
                          />
                        </div>
                      </div>
                      <div>
                        {{ opt.value }}
                      </div>
                    </div>
                  </div>
                </q-item>
              </template>
            </q-select>
            <q-space />
            <!-- note controls -->
            <div class="row items-center">
              <NoteControls
                  v-if="selectedNote"
                  :noteId="selectedNote.id"
                  class="bordered q-pa-none q-ml-sm"
                  @createAlert="createAlert"
                  @deleteNote="deleteNote"
                  @saveNote="saveNote"
                  @attachStory="attachStory"
                  @togglePivotal="toggleDrawerRight"
              />
              <q-btn
                  icon="refresh"
                  class="q-ml-sm"
                  dense
                  flat
                  @click="reRender"
              />
            </div>
          </div>
        </template>
        <template #page-content>
          <DisplayNote
              v-if="selectedNote"
              ref="noteDisplay"
              :noteId="selectedNote.id"
              class="full-width"
              editable
          />
        </template>
      </SimpleLayout>
    </div>
  </div>
</template>

<script>
import NoteControls from './NoteControls';
import DisplayNote from './DisplayNote';
import SimpleLayout from './SimpleLayout';
import SimpleModal from './SimpleModal';
import StoryCard from './StoryCard';
import Pivotal from '../mixins/Pivotal';
import DbMixin from '../mixins/jsondb';
import GitMixin from '../mixins/git';
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'Notes',
  components: {
    NoteControls,
    DisplayNote,
    StoryCard,
    SimpleModal,
    SimpleLayout
  },
  mixins: [DbMixin, Pivotal, GitMixin],
  data()
  {
    return {
      controlsRenderIndex: 0,
      reRendering: false,
      isCreateModalOpen: false,
      isNoteListDrawerOpen: true,
      filteredNotesList: [],
      selectedNoteId: null,
      selectedNote: null,
      newNote: {
        title: null,
        content: null
      },
      pivotalStories: {},
      // message to show when controls are updating
      isDrawerRightOpen: false,
      isDrawerLeftOpen: false,
      storyIdToAttach: null,
      storyBeingViewed: null
    };
  },
  provide()
  {
    return {
      $updateNote: this.updateNoteInDb,
      $getNote: this.getNote
    };
  },
  inject: ['$openLink'],
  computed: {
    notesList()
    {
      return this.$store.getters['notes/all'];
    },
    attachedStories()
    {
      if(!this.selectedNote)
      {
        return [];
      }

      const stories = this.$store.getters['pivotal/all'] || [];
      const storiesForNote = (this.selectedNote.stories || [])
          .map((id) => parseInt(id, 10));

      if(!stories.length || !storiesForNote.length)
      {
        return [];
      }

      return stories.filter((s) => storiesForNote.includes(s.id));
    },
    noteNames()
    {
      if(!this.notesList || !this.notesList.length)
      {
        return [];
      }

      return this.notesList.map((note) => note.title);
    },
    noteOptions()
    {
      if(!this.notesList || !this.notesList.length)
      {
        return [];
      }

      return this.notesList.map((note) => ({
        label: note.title,
        value: note.id
      }));
    },
    noteBeingEdited()
    {
      if(this.$refs && this.$refs.noteDisplay && this.$refs.noteDisplay.noteContent)
      {
        return {
          ...this.$refs.noteDisplay.note,
          content: this.$refs.noteDisplay.noteContent
        };
      }

      return null;
    }
  },
  watch: {
    selectedNoteId(newVal)
    {
      if(typeof newVal === 'string') // i.e., is searching
      {
        return;
      }

      this.selectedNote = this.notesList
          .find((note) => note.id === newVal.value);
    },
    'selectedNote.stories'(newVal)
    {
      if(Array.isArray(newVal))
      {
        newVal.forEach((id) =>
        {
          this.$store.dispatch('pivotal/load', { id });
        })
      }
    }
  },
  mounted()
  {
    this.loadNotes();
    this.filteredNotesList = this.noteOptions;

    setTimeout(() =>
    {
      this.setSelectedNoteById();
    }, 500);
  },
  methods: {
    reRender()
    {
      this.reRendering = true;
      this.controlsRenderIndex += 1;

      setTimeout(() =>
      {
        this.reRendering = false;
      }, 1);
    },
    toggleDrawerRight()
    {
      this.isDrawerRightOpen = !this.isDrawerRightOpen;
    },
    loadNotes()
    {
      this.$log(`loadNotes`);
      this.$store.dispatch('notes/loadAll');
      // // get the notes from the JSON repository
      // this.readFromDb('notesdb.json', (data) =>
      // {
      //   let parsed = JSON.parse(data) || {};
      //
      //   if(typeof parsed === 'string')
      //   {
      //     parsed = JSON.parse(parsed);
      //   }
      //
      //   if(!parsed.notes)
      //   {
      //     parsed.notes = [];
      //   }
      //
      //   this.$set(this, 'notesList', parsed.notes);
      // }, true);
    },
    updateNoteInDb(noteData, deleteNote = false)
    {
      this.$log('updateNoteInDb', noteData.id);

      this.$store.dispatch('notes/update', { note: noteData });

      // Working, but legacy - now doing this via the store
      // this.loadNotes();
      //
      // let allNotes = [...this.notesList];
      //
      // const now = Date.now();
      //
      // if(!noteData.created)
      // {
      //   noteData.created = now;
      // }
      //
      // noteData.updated = now;
      //
      // const existing = allNotes
      //     .find((item) => item.id && item.id === noteData.id);
      //
      // // find the existing item with this id if possible
      // const existingIndex = allNotes
      //     .findIndex((item) => item.id && item.id === noteData.id);
      //
      // if(existingIndex > -1)
      // {
      //   const toUpdate = {
      //     ...existing,
      //     ...(this.noteBeingEdited || noteData)
      //   };
      //
      //   if(deleteNote)
      //   {
      //     allNotes.splice(existingIndex, 1);
      //   }
      //   else
      //   {
      //     allNotes.splice(existingIndex, 1, toUpdate);
      //   }
      // }
      //
      // this.writeToDb(
      //     'notes',
      //     allNotes,
      //     (data) =>
      //     {
      //       console.info('updated note:', noteData.id);
      //
      //       this.loadNotes();
      //     }
      // );
    },
    getNote(id)
    {
      return this.notesList.find((note) => note.id === id);
    },
    setSelectedNoteById(id)
    {
      if(!this.notesList || !this.notesList[0])
      {
        return;
      }

      if(!id)
      {
        id = this.notesList[0].id;
      }

      if(!this.notesList || !id) return;

      this.$log('setSelectedNoteById', id);
      const index = this.notesList.findIndex((n) => n.id === id) || 0;

      if(this.notesList[index])
      {
        this.selectedNote = this.notesList[index];
        this.selectedNoteId = {
          label: this.notesList[index].title,
          value: this.notesList[index].id
        };
      }
    },
    createNote()
    {
      this.$log('createNote', this.newNote.title);
      const newId = uuidv4();

      try
      {
        if(this.newNote.title)
        {
          const newNote = {
            id: newId,
            title: this.newNote.title,
            content: '' // this.newNote.content
          };

          this.notesList.push(newNote);

          this.updateNoteInDb(newNote);
        }

        this.newNote = { title: null, content: null };

        this.loadNotes();
      }
      catch(e)
      {
        this.$log('error', e);
      }
      finally
      {
        this.isCreateModalOpen = false;
        this.setSelectedNoteById(newId);
      }
    },
    addAlertToNote(note, alert)
    {
      this.$log('addAlertToNote', `${note.id} :: ${JSON.stringify(alert)}`);
      if(!note)
      {
        console.warn('Note not found!', alert);

        return;
      }

      if(!note.alerts)
      {
        note.alerts = [];
      }

      if(alert.id)
      {
        delete alert.id;
      }

      note.alerts.push(alert);

      return note;
    },
    createAlert(alert)
    {
      this.$log('createAlert', JSON.stringify(alert));
      if(!alert || !alert.id || !alert.date)
      {
        console.warn('Not enough data for alert!', alert);

        return;
      }

      const note = this.addAlertToNote(
          this.getNote(alert.id),
          alert
      );

      this.$store.dispatch('notes/update', { note });

      this.$notify(`Created alert for ${note.title}`);
    },
    deleteNote(noteData)
    {
      this.$log('deleteNote', noteData.id);
      this.updateNoteInDb(noteData, true);

      this.$notify('note deleted!');

      setTimeout(() =>
      {
        this.setSelectedNoteById();
      }, 100);
    },
    saveNote(noteData)
    {
      this.$log('saveNote', noteData.id);
      this.updateNoteInDb(noteData, false);
      this.$notify('note saved!');
    },
    attachStory(noteId, storyId)
    {
      if(!storyId || !noteId)
      {
        return;
      }

      this.$log('attachStory', `${noteId} :: ${storyId}`);
      const note = this.getNote(noteId);

      if(note)
      {
        if(!Array.isArray(note.stories))
        {
          note.stories = [];
        }

        note.stories = note.stories.map((storyId) => storyId.toString());

        if(!note.stories.includes(storyId))
        {
          note.stories.push(storyId);
        }

        this.updateNoteInDb(note);

        this.$notify(`Attached PT: ${storyId}`);
      }

      this.storyIdToAttach = null;
    },
    filterFn(val, update)
    {
      if(!val || val === '')
      {
        update(() =>
        {
          this.filteredNotesList = this.noteOptions;
        });

        return;
      }

      update(() =>
      {
        const needle = val.toLowerCase();

        this.filteredNotesList = this.noteOptions.filter((n) => n.label.toLowerCase().indexOf(needle) > -1);
      });
    }
  }
};
</script>

<style>
body {
  background: #eee;
}

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
