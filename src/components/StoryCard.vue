<template>
  <div v-if="!story" class="row items-center justify-center" style="width: 90vw">
    <q-spinner size="md" color="primary" class="q-ma-md" />
    <span>Loading {{ storyId }} ...</span>
  </div>
  <SimpleModal v-else full-width>
    <template #activator="{ open }">
      <div class="col full-width" @click="open">
        <div class="items-center q-my-sm full-width">
          <q-badge :label="story.estimate === 0 ? 0 : story.estimate || '?'" class="q-mr-xs" />
          <q-icon
:name="story.story_type === 'feature' ? 'star' : 'bug_report'"
            :color="story.story_type === 'feature' ? 'warning' : 'negative'" />
          {{ story.name }}
        </div>
        <div class="items-center q-my-xs full-width">
          <q-chip
v-for="label in story.labels" :label="label.name" :key="label.name"
            :color="label.name.includes('(') ? 'primary' : 'secondary'" class="q-ma-none q-mr-xs" style="color: #ddd"
            :size="transformSizeProp(dense ? 'sm' : 'md')" />
        </div>
        <div class="row q-mt-xs">
          <q-chip :color="story.created_at_color || 'primary'" square dense dark>
            {{ new Date(story.created_at).toDateString() }}
          </q-chip>
          <q-btn-group>
            <q-btn
              :label="story.id"
              color="primary"
              :dense="dense"
              flat
              @click.stop.prevent="copy(story.id)"
            >
              <q-tooltip>Copy story ID</q-tooltip>
            </q-btn>
            <q-btn
              icon="open_in_new"
              color="primary"
              :dense="dense"
              flat
              @click.stop.prevent="copy(story.url)"
            >
              <q-tooltip>Copy URL</q-tooltip>
            </q-btn>
            <GitCheckout :target="storyId.toString()">
              <template #activator="{ open }">
                <q-btn
                  icon="content_copy"
                  color="negative"
                  :dense="dense"
                  flat
                  @click.stop.prevent="open"
                />
              </template>
            </GitCheckout>
          </q-btn-group>
          <q-btn-group class="q-ml-xs">
            <q-btn
              v-if="allowAddTasks"
              label="Tasks"
              color="primary"
              :dense="dense"
              flat
              @click.stop.prevent="openTasksForStory"
            >
              <q-tooltip>View tasks for {{ storyId }}</q-tooltip>
            </q-btn>
            <AddTask
              v-if="allowAddTasks"
              :initial-task-data="{ stories: [story.id] }"
              dense
            />
            <AddSubtaskToTask
              :story-id="storyId"
              dense
            />
          </q-btn-group>
        </div>
      </div>
    </template>
    <template #title>
      <div class="col">
        <h5 class="q-mb-sm">{{ story.name }}</h5>
        <div>
          <q-chip
v-for="label in story.labels" :label="label.name" :key="label.name"
            :color="label.name.includes('(') ? 'primary' : 'secondary'" class="q-ma-none q-mr-xs" style="color: #ddd"
            :size="transformSizeProp(dense ? 'sm' : 'md')" />
        </div>
      </div>
    </template>
    <template #content>
      <DisplayStory :story-id="story.id" />
    </template>
    <template #actions>
      <q-btn
        icon="link"
        label="View"
        color="primary"
        :dense="dense"
        flat
        class="q-mr-xs"
        @click.stop.prevent="openLink(story.url)"
    />
<!--      <q-btn icon="content_copy" color="negative" :dense="dense" flat>-->
<!--        <q-tooltip>Checkout to branch</q-tooltip>-->
<!--      </q-btn>-->
    </template>
  </SimpleModal>
</template>

<script setup lang="ts">
import {
  getFromLocalStorage,
  saveToLocalStorage,
  LocalStorageName,
  saveToLocalStorageArray,
  transformSizeProp,
} from '../utils';
import DisplayStory from 'src/components/DisplayStory.vue';
import AddTask from 'src/components/AddTask.vue';
import SimpleModal from 'src/components/SimpleModal.vue';
import AddSubtaskToTask from 'src/components/AddSubtaskToTask.vue';
import GitCheckout from 'src/components/GitCheckout.vue';
import { usePivotalStory } from 'src/components/composables/pivotalStory';
import { useHelpers } from 'src/components/composables/helpers';

const props = defineProps<{
  storyId: string | number;
  dense?: boolean;
  allowAddTasks?: boolean;
}>();

const { story } = usePivotalStory(props.storyId);
const { copy, openLink } = useHelpers();

function openTasksForStory() {
  const existingFilters = getFromLocalStorage(
    LocalStorageName.taskFilters,
    true
  );
  saveToLocalStorage(LocalStorageName.taskFilters, {
    ...existingFilters,
    keyword: `${props.storyId}`,
  });
  saveToLocalStorageArray(LocalStorageName.currentTab, 'tasks');
};
</script>
