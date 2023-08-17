<template>
  <SimpleModal>
    <template #activator="{ open }">
      <slot name="activator" v-bind="{ open }" />
    </template>
    <template #content>
      <div style="display: flex; flex-direction: column">
        <q-input
            v-model="value"
            placeholder="Add a tag..."
            class="q-mb-xs"
            filled
            dense />
        <q-list style="max-height: 50vh; overflow-y: scroll">
          <q-item
              v-for="(tag, t) in filteredList"
              :key="`list-tag-${t}`" clickable v-close-popup
              @click="pickTag(tag)">
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
import useTaskStore from '@/pinia/taskStore';

const store = useTaskStore();

const SimpleModal = defineAsyncComponent(() => import('src/components/SimpleModal.vue'));

const value = ref<string>('');

const tasksList = computed<Task[]>(() => {
  return Object.values(store.getTasks);
});

const allTags = computed(() => {
  if (!tasksList.value || !tasksList.value.length) {
    return [];
  }

  return tasksList.value.reduce(
    (agg, task: Task) => {
      const tags = [...(task.tags || [])].filter(
        (tag) => !agg.includes(tag)
      );

      if (tags.length) {
        return agg.concat(tags);
      }

      return agg;
    },
    [] as string[]
  );
});

const filteredList = computed(() => {
  if (!value.value) {
    return allTags.value;
  } else {
    return allTags.value.filter(
      (v) => v.toLowerCase().indexOf(value.value.toLowerCase()) > -1
    );
  }
});

const emit = defineEmits<{
  (event: 'input', tag: string): void
}>()

function pickTag(tag: string) {
  emit('input', tag);
  value.value = '';
}
</script>
