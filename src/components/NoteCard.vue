<template>
  <q-item
      style="min-width: 400px"
      class="q-pa-sm full-width"
      clickable
      dense
      @click="$emit('selectedNote', note.id)"
  >
    <div class="row items-center full-width">
      <div class="col">
        <div class="row items-center">
          <q-icon
              v-if="note.isStarred"
              name="star"
              class="q-ma-xs"
              color="warning"
          />
          <div>
            {{ note.title }}
          </div>
          <q-space />
        </div>
        <div class="row items-center">
          <q-badge
              v-if="note.tasks"
              :label="`${note.tasks.length} tasks`"
              color="primary"
              class="text-bold"
          />
          <q-space />
          <q-chip v-if="created && !updated" dense>
            C: {{ created }}
          </q-chip>
          <q-chip v-if="updated" dense>
            Updated {{ updated }}
          </q-chip>
        </div>
      </div>
    </div>
  </q-item>
</template>

<script>
  import * as moment from 'moment';

  export default {
    components: {
    },
    props: {
      noteId: {
        type: String,
        required: true
      },
      clickOverride: {
        type: Function,
        default: undefined
      }
    },
    inject: ['$openNote'],
    data()
    {
      return {
      };
    },
    computed: {
      note()
      {
        return this.$store.getters['notes/getNote'](this.noteId);
      },
      created()
      {
        return this.note.created ?
            moment(this.note.created).fromNow() :
            null;
      },
      updated()
      {
        return this.note.updated ?
            moment(this.note.updated).fromNow() :
            null;
      }
    },
    methods: {
    }
  };
</script>