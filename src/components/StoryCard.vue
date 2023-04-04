<template>
  <SimpleModal fullWidth>
    <template #title>
      <div class="col">
        <h5 class="q-mb-sm">{{ story.name }}</h5>
        <div>
          <q-chip
              v-for="label in story.labels"
              :label="label.name"
              :key="label.name"
              :color="label.name.includes('(') ? 'primary' : 'secondary'"
              class="q-ma-none q-mr-xs"
              style="color: #ddd"
              size="sm"
          />
        </div>
      </div>
    </template>
    <template #activator="{ open }">
      <div v-if="story" class="col" @click="open">
        <div class="items-center q-my-sm">
          <q-btn
              icon="close"
              color="negative"
              dense
              flat
              size="sm"
              class="q-mr-xs"
              @click.stop.prevent="removeStory"
          />
          <q-badge
              :label="story.estimate"
              class="q-mr-xs"
          />
          <q-icon
              :name="story.story_type === 'feature' ? 'star' : 'bug_report'"
              :color="story.story_type === 'feature' ? 'warning' : 'negative'"
          />
          {{ story.name }}
        </div>
        <div>
          <q-chip
              v-for="label in story.labels"
              :label="label.name"
              :key="label.name"
              :color="label.name.includes('(') ? 'primary' : 'secondary'"
              class="q-ma-none q-mr-xs"
              style="color: #ddd"
              size="sm"
          />
        </div>
        <div class="q-mt-sm">
          <q-btn
              label="View"
              color="primary"
              dense
              flat
              class="q-mr-xs"
              @click.stop.prevent="$openLink(story.url)"
          />
          <q-btn
              label="Git C/O"
              color="negative"
              dense
              flat
              @click.stop.prevent="$emit('checkoutBoth', story.id)"
          />
        </div>
      </div>
    </template>
    <template #content>
      <DisplayStory :storyId="story.id" />
    </template>
  </SimpleModal>
</template>

<script>
  import DisplayStory from './DisplayStory';
  import SimpleModal from './SimpleModal';

  export default {
    components: {
      DisplayStory,
      SimpleModal
    },
    props: {
      // story: {
      //   type: Object,
      //   required: true
      // },
      noteId: {
        type: String,
        default: null
      },
      storyId: {
        type: [String, Number],
        required: true
      }
    },
    inject: ['$openLink'],
    computed: {
      story()
      {
        return this.$store.getters['pivotal/get'](this.storyId);
      }
    },
    methods: {
      removeStory()
      {
        if(!this.noteId)
        {
          return;
        }

        this.$store.dispatch('notes/removeStory', {
          noteId: this.noteId,
          storyId: this.story.id
        });
      }
    }
  };
</script>