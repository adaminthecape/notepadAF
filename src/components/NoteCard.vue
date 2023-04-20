<template>
  <q-item
      v-if="note && note.id"
      style="min-width: 400px"
      class="q-pa-sm full-width"
      clickable
      dense
      @click="$emit('selectedNote', note.id)"
  >
    <div class="row items-center full-width">
      <div>
        <q-icon name="description" size="md" class="q-mr-sm" />
      </div>
      <div class="col full-width">
        <div class="row items-center">
          <div>
            {{ note.title }}
          </div>
          <q-space />
        </div>
        <div class="row items-center">
          <q-icon
              v-if="note.isStarred"
              name="star"
              class="q-ma-xs"
              color="warning"
          />
          <div v-if="taskMeta">
            <q-chip
                dense
                :color="chipColor"
                :dark="dark"
            >
              <q-icon name="task_alt" class="q-mr-xs" />
              <span class="text-bold" :class="{ 'text-green-9': !dark, 'text-green': dark }">{{ taskMeta.done }}</span>
              <span> / </span>
              <span class="text-bold">{{ taskMeta.total }}</span>
            </q-chip>
          </div>
          <q-space />
          <q-chip
              v-if="created && !updated"
              dense
              :color="chipColor"
              :dark="dark"
          >
            Created {{ created }}
          </q-chip>
          <q-chip
              v-if="updated"
              dense
              :color="chipColor"
              :dark="dark"
          >
            Updated {{ updated }}
          </q-chip>
        </div>
      </div>
      <div v-if="showControls">
        <q-btn
            icon="menu"
            dense
            class="q-ml-sm"
            @click.stop.prevent="isShowingControls = !isShowingControls"
        />
      </div>
      <q-dialog v-model="isShowingControls">
        <q-card class="q-pa-md">
          <h5 class="q-pa-sm q-ma-none">
            <span class="text-bold text-grey-9">{{ note.title }}</span>
          </h5>
          <q-item class="q-ma-sm">
            <NoteControlsInCard :noteId="note.id" />
          </q-item>
        </q-card>
      </q-dialog>
    </div>
  </q-item>
</template>

<script>
  import { timeSince } from '../utils.js';

  export default {
    components: {
      NoteControlsInCard: import('./NoteControls')
    },
    props: {
      noteId: {
        type: String,
        required: true
      },
      clickOverride: {
        type: Function,
        default: undefined
      },
      dark: {
        type: Boolean,
        default: false
      },
      showControls: {
        type: Boolean,
        default: true
      }
    },
    inject: ['$openNote'],
    data()
    {
      return {
        isShowingControls: false
      };
    },
    computed: {
      chipColor()
      {
        return this.dark ? 'grey-9' : 'grey-3';
      },
      note()
      {
        return this.$store.getters['notes/getNote'](this.noteId);
      },
      created()
      {
        return this.note.created ?
            timeSince(this.note.created) :
            null;
      },
      updated()
      {
        return this.note.updated ?
            timeSince(this.note.updated) :
            null;
      },
      taskMeta()
      {
        if(!this.note || !this.note.tasks || !this.note.tasks.length)
        {
          return null;
        }

        return this.note.tasks.reduce((agg, task) =>
        {
          agg.total += 1;

          if(task.done)
          {
            agg.done += 1;
          }

          return agg;
        }, {
          total: 0,
          done: 0,
          todo: 0
        });
      }
    },
    methods: {
    }
  };
</script>