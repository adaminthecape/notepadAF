<template>
  <div>
    <SimpleLayout :header="false" style="max-height: 70vh">
      <template #body>
        <q-markdown
            class="q-pa-sm"
            :src="story.description"
            style="max-width: 64em"
        />
      </template>
    </SimpleLayout>
  </div>
</template>

<script>
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown';
import Pivotal from '../mixins/Pivotal';
import SimpleLayout from './SimpleLayout';

export default {
  name: 'Notes',
  components: {
    QMarkdown,
    SimpleLayout
  },
  mixins: [Pivotal],
  props: {
    // story: {
    //   type: Object,
    //   required: true
    // },
    storyId: {
      type: [String, Number],
      required: true
    }
  },
  data()
  {
    return {
      // story: null
    };
  },
  computed: {
    storyIdAsNumber()
    {
      return typeof this.storyId === 'string' ? parseInt(this.storyId, 10) : this.storyId;
    },
    story()
    {
      return this.$store.getters['pivotal/get'](this.storyIdAsNumber);
    },
    description()
    {
      return !this.story ? null : this.story.description;
    }
  },
  async mounted()
  {
    // load story
    await this.$store.dispatch('pivotal/load', { id: this.storyIdAsNumber });
  },
  methods: {
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
