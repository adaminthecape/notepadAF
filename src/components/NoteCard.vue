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
<!--      <div v-if="showControls">-->
<!--        <q-btn-->
<!--            icon="menu"-->
<!--            dense-->
<!--            class="q-ml-sm"-->
<!--            @click.stop.prevent="isShowingControls = !isShowingControls"-->
<!--        />-->
<!--      </div>-->
<!--      <q-dialog v-model="isShowingControls">-->
<!--        <q-card class="q-pa-md">-->
<!--          <q-item class="q-ma-sm">-->
<!--            <NoteMiniDisplay :noteId="noteId" />-->
<!--          </q-item>-->
<!--        </q-card>-->
<!--      </q-dialog>-->
      <Modal v-if="showControls" fullWidth>
        <template #activator="{ open }">
          <q-btn
              icon="menu"
              dense
              class="q-ml-sm"
              @click.stop.prevent="open"
          />
        </template>
        <template #content>
          <NoteMiniDisplay :noteId="noteId" />
        </template>
      </Modal>
    </div>
  </q-item>
</template>

<script>
  import NoteMiniDisplay from './NoteMiniDisplay';
  import NoteControlsMixin from '../mixins/NoteControlsMixin.js';
  import Modal from "components/SimpleModal";

  export default {
    components: {
      Modal,
      NoteMiniDisplay
    },
    mixins: [NoteControlsMixin],
    props: {
      clickOverride: {
        type: Function,
        default: undefined
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