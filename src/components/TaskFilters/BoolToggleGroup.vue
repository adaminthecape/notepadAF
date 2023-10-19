<template>
  <q-btn-group class="row items-center q-mb-xs" flat>
    <slot name="left"></slot>
    <q-btn
      :icon="filters.done ? 'check_circle' : 'check_circle_outline'"
      :color="getFilterBoolColor('done')"
      no-caps
      dense
      flat
      @click="toggleFilterBool('done')"
    ><q-tooltip>Done</q-tooltip></q-btn>
    <q-btn
      :icon="filters.active ? 'assignment_ind' : 'content_paste_go'"
      :color="getFilterBoolColor('active')"
      no-caps
      dense
      flat
      @click="toggleFilterBool('active')"
    ><q-tooltip>Active</q-tooltip></q-btn>
    <q-btn
      :icon="filters.archived ? 'unarchive' : 'move_to_inbox'"
      :color="getFilterBoolColor('archived')"
      no-caps
      dense
      flat
      @click="toggleFilterBool('archived')"
    ><q-tooltip>Archived</q-tooltip></q-btn>
  </q-btn-group>
</template>

<script setup lang="ts">
import { FilterType, FilterTypes, TaskFilters } from 'src/types';
import { ref, watch } from 'vue';

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
});

const filters = ref<Partial<TaskFilters>>({});

watch(props.filters, (n: Partial<TaskFilters>) => {
  filters.value = n;
});

const emit = defineEmits<{
  (event: 'input', ctx: Partial<TaskFilters>): void
}>();

function getFilterBoolColor(prop: FilterType) {
  return (
    (props.filters[prop] === true && 'green-6') ||
    (props.filters[prop] === false && 'red-6') ||
    'grey-6'
  );
}

function toggleFilterBool(prop: keyof typeof FilterTypes) {
  if(filters.value[prop] === false)
  {
    (filters.value[prop] as any) = null;
  }
  else if (typeof filters.value[prop] === 'boolean') {
    (filters.value[prop] as boolean) = !filters.value[prop];
  }
  else
  {
    (filters.value[prop] as boolean) = true;
  }

  emit('input', filters.value);
}
</script>
