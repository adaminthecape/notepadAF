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
          dense
        />
        <q-list style="max-height: 50vh; overflow-y: scroll">
          <q-item
            v-for="(tag, t) in filteredList"
            :key="`list-tag-${t}`"
            clickable
            v-close-popup
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
      <q-btn
        v-close-popup
        icon="save"
        dense
        color="green-9"
        @click="pickTag(value)"
      />
    </template>
  </SimpleModal>
</template>

<script setup lang="ts">
import { Task } from "src/types";
import {
  ref,
  defineAsyncComponent,
computed
} from 'vue';
import { useVuexStore } from 'src/store';

const store = useVuexStore();

const SimpleModal = defineAsyncComponent(() => import("src/components/SimpleModal.vue"));

const value = ref<string>('');

const tasksList = computed(() => {
  return Object.values(store.getters['notes/getTasks']);
});

const allTags = computed(() => {
  if (!tasksList.value || !tasksList.value.length) {
    return [];
  }

  return tasksList.value.reduce((agg, task: Task) => {
    const tags = [...(task.tags || [])].filter(
      (tag) => !agg.includes(tag)
    );

    if (tags.length) {
      return agg.concat(tags);
    }

    return agg;
  }, []);
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
</script>

<script lang="ts">
export default {
  computed: {
    tasksList() {
      return Object.values(this.$store.getters['notes/getTasks']);
    },
    allTags() {
      if (!this.tasksList || !this.tasksList.length) {
        return [];
      }

      return this.tasksList.reduce((agg, task) => {
        const tags = [...(task.tags || [])].filter((tag) => !agg.includes(tag));

        if (tags.length) {
          return agg.concat(tags);
        }

        return agg;
      }, []);
    },
    filteredList() {
      if (!this.value) {
        return this.allTags;
      } else {
        return this.allTags.filter(
          (v) => v.toLowerCase().indexOf(this.value.toLowerCase()) > -1
        );
      }
    },
  },
  methods: {
    pickTag(tag) {
      this.$emit("input", tag);
      this.value = "";
    },
  },
};
</script>
