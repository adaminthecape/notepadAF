<template>
  <SimpleModal>
    <template #activator="{ open }">
      <slot name="activator" v-bind="{ open }" />
    </template>
    <template #content>
      <div style="display: flex; flex-direction: column">
        <!-- <q-chip
          v-if="selectedTags && selectedTags.length"
          color="info"
          :size="transformSizeProp('md')"
          square
          dense
          dark
        >
          <q-icon name="sell" />
          <span class="q-mb-xs q-ml-xs">{{ selectedTags.join(', ') }}</span>
        </q-chip> -->
        <q-input
            v-if="!disableAdd"
            v-model="value"
            placeholder="Search tags..."
            class="q-mb-xs"
            filled
            dense />
        <q-list style="max-height: 50vh; overflow-y: scroll">
          <q-item
              v-for="(sel, s) in props.selectedTags"
              :key="`selected-tag-${s}`"
              clickable
              selected
              @click="unpickTag(sel)"
            >
            <q-item-section>
              <div class="row items-center">
                <span>{{ sel }}</span>
                <q-space />
                <q-icon name="check" />
              </div>
            </q-item-section>
          </q-item>
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
import {
  ref,
  computed
} from 'vue';
import SimpleModal from 'src/components/SimpleModal.vue';
import { useTaskTags } from 'src/components/composables/taskTags';

const props = defineProps<{
  selectedTags?: string[] | '';
  multiple?: boolean;
  tags?: string[];
  disableAdd?: boolean;
}>();

const value = ref<string>('');

const allTags = computed<string[]>(() => {
  if(props.tags)
  {
    return props.tags;
  }

  const { allTags: allComputedTags } = useTaskTags();

  return allComputedTags.value;
});

const filteredList = computed(() => {
  let res = [];

  if (props.tags?.length) {
    res = props.tags.filter(
      (v) => v.toLowerCase().indexOf(value.value.toLowerCase()) > -1
    );
  }
  else if (!value.value) {
    res = allTags.value;
  } else {
    res = allTags.value.filter(
      (v) => v.toLowerCase().indexOf(value.value.toLowerCase()) > -1
    );
  }

  if (props.selectedTags?.length) {
    return res.filter((t) => !props.selectedTags?.includes(t));
  }

  return res;
});

const emit = defineEmits<{
  (event: 'input', tag: string): void
  (event: 'remove', tag: string): void
}>();

function pickTag(tag: string) {
  emit('input', tag);
  value.value = '';
}

function unpickTag(tag: string) {
  emit('remove', tag);
}
</script>
