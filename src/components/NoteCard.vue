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
      },
      dark: {
        type: Boolean,
        default: false
      }
    },
    inject: ['$openNote'],
    data()
    {
      return {
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
            moment(this.note.created).fromNow() :
            null;
      },
      updated()
      {
        return this.note.updated ?
            moment(this.note.updated).fromNow() :
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