<template>
  <SimpleModal>
    <template #activator="{ open }">
      <slot name="activator" v-bind="{ open }" />
    </template>
    <template #content>
      <div style="display: flex; flex-direction: column">
        <q-chip
          v-if="selectedTags && selectedTags.length"
          color="info"
          square
          dense
          dark
        >
          <q-icon name="sell" />
          <span class="q-mb-xs q-ml-xs">{{ selectedTags.join(', ') }}</span>
        </q-chip>
        <q-input
            v-if="!disableAdd"
            v-model="value"
            placeholder="Search tags..."
            class="q-mb-xs"
            filled
            dense />
        <q-list style="max-height: 50vh; overflow-y: scroll">
          <q-item
              v-for="(tag, t) in filteredList"
              :v-close-popup="!multiple"
              :key="`list-tag-${t}`"
              clickable
              @click="pickTag(tag)"
            >
            <q-item-section>
              {{ tag }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </template>
    <template #close>
      <q-btn v-close-popup icon="save" dense color="green-9" @click="pickTag(value)" />
    </template>
  </SimpleModal>
</template>

<script setup lang="ts">
import { Task } from 'src/types';
import {
  ref,
  defineAsyncComponent,
  computed
} from 'vue';
import useTaskStore from 'src/pinia/taskStore';

const props = defineProps<{
  selectedTags?: string[];
  multiple?: boolean;
  tags?: string[];
  disableAdd?: boolean;
}>();

const selected = ref(['personal', 'shopping']);

const store = useTaskStore();

const SimpleModal = defineAsyncComponent(() => import('src/components/SimpleModal.vue'));

const value = ref<string>('');

const tasksList = computed<Task[]>(() => {
  return Object.values(store.getTasks);
});

function isStoryId(x: string | number) {
  return `${x}` === `${parseInt(String(x), 10)}`;
}

const allTags = computed(() => {
  if (!tasksList.value || !tasksList.value.length) {
    return [];
  }

  if (props.tags?.length) {
    return props.tags;
  }

  const { other, stories } = tasksList.value.reduce(
    (agg: string[], task: Task) => {
      const tags = [...(task.tags || [])].filter(
        (tag) => !agg.includes(tag)
      );

      if (tags.length) {
        return agg.concat(tags);
      }

      return agg;
    },
    [] as string[]
  ).sort()
    .reduce((agg: { stories: string[], other: string[] }, item: string) => {
      if (isStoryId(item)) {
        agg.stories.push(item);
      }
      else {
        agg.other.push(item);
      }
      return agg;
    }, {
      stories: [],
      other: []
    });

  return [...other, ...stories];
});

const filteredList = computed(() => {
  if (props.tags?.length) {
    return props.tags.filter(
      (v) => v.toLowerCase().indexOf(value.value.toLowerCase()) > -1
    );
  }
  else if (!value.value) {
    return allTags.value;
  } else {
    return allTags.value.filter(
      (v) => v.toLowerCase().indexOf(value.value.toLowerCase()) > -1
    );
  }
});

const emit = defineEmits<{
  (event: 'input', tag: string): void
}>();

function pickTag(tag: string) {
  emit('input', tag);
  value.value = '';
}
</script>
