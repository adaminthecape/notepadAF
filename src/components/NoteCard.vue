<template>
  <div>
    <q-card>
      <q-item
          class="q-py-md q-ma-sm"
          clickable
          @click="$openNote(note.id)"
      >
        {{ note.title }}
      </q-item>
    </q-card>
  </div>
</template>

<script>
  export default {
    components: {
    },
    props: {
      noteId: {
        type: String,
        required: true
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
      }
    },
    methods: {
    }
  };
</script>