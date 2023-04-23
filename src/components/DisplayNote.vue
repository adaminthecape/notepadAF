<template>
  <div>
    <div v-if="!editable">
      {{ noteContent }}
    </div>
    <div
        style="font-size: 1.2em"
    >
      <q-editor
          ref="editor"
          v-model="noteContent"
          min-height="20rem"
      />
    </div>
    <div class="q-mt-md">
      <TaskList :noteId="noteId" />
    </div>
  </div>
</template>

<script>
import { debounce } from 'quasar';
import Pivotal from '../mixins/Pivotal';
import TaskList from './TaskList';
import NoteControlsMixin from '../mixins/NoteControlsMixin.js';

export default {
  name: 'DisplayNote',
  components: {
    TaskList
  },
  mixins: [Pivotal, NoteControlsMixin],
  props: {
    editable: {
      type: Boolean,
      default: false
    }
  },
  data()
  {
    return {
      isContentUpdated: false,
      updatedContent: null,
      pivotalStories: {}
    };
  },
  inject: ['$updateNote'],
  computed: {
    attachedStories()
    {
      return this.stories && this.stories.map((storyId) => (
          this.$store.getters['pivotal/get'](parseInt(storyId, 10))
      ));
    },
    noteContent: {
      get()
      {
        if(this.updatedContent)
        {
          return this.updatedContent;
        }

        return this.note ? this.note.content : '';
      },
      set(data)
      {
        this.isContentUpdated = true;
        this.updatedContent = data;
      }
    }
  },
  watch: {
    noteId()
    {
      this.updatedContent = this.note ? this.note.content : null;
    },
    updatedContent(newVal)
    {
      if(this.note)
      {
        this.debounceUpdate({ ...this.note, content: newVal });
      }
    },
    stories(newVal)
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
  methods: {
    debounceUpdate: debounce(function updateDebounce(data)
    {
      if(!this.isContentUpdated)
      {
        return;
      }

      this.$store.dispatch('notes/update', {
        note: {
          id: this.note.id,
          content: this.updatedContent
        }
      });
    }, 500)
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
