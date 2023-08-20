<template>
<!--  :options="allTags.map((t) => ({ label: t, value: t }))"-->
  <q-select
      ref="selector"
      v-model="value"
      :options="tagsToShow"
      :label="label"
      :multiple="multiple"
      dense
      filled
      use-input
      :hide-selected="!multiple"
      fill-input
      input-debounce="0"
      :new-value-mode="newValueMode ? 'add-unique' : undefined"
      style="width: 12em"
      @filter="filterFn"
      @keydown.tab="emitInput(value, true)"
      @input="emitInput(value, false)"
  >
    <template #no-option>
      <q-item :clickable="newValueMode">
        <q-item-section class="text-grey">
          <div v-if="!newValueMode">No results</div>
        </q-item-section>
      </q-item>
    </template>
    <template #append>
      <q-btn
          v-if="newValueMode"
          icon="add"
          round
          dense
          flat
          size="xs"
          @click.stop.prevent="addValue"
      >
        <q-tooltip>Add</q-tooltip>
      </q-btn>
      <q-btn
          v-if="value && value.length && !newValueMode"
          icon="content_copy"
          round
          dense
          flat
          size="xs"
          @click.stop.prevent="copyTags"
      >
        <q-tooltip>Copy</q-tooltip>
      </q-btn>
      <q-btn
          v-if="value && value.length"
          icon="close"
          round
          dense
          flat
          size="xs"
          @click.stop.prevent="clearInput"
      />
    </template>
  </q-select>
</template>

<script setup lang="ts">
import useTaskStore from 'src/pinia/taskStore';
import { computed, ref, watch } from 'vue';
import { Task } from 'src/types';

const props = defineProps<{
  inputValue?: string | string[];
  label?: string;
  multiple?: boolean;
  dark?: boolean;
  newValueMode?: boolean;
}>();

const store = useTaskStore();

const tagsToShow = ref<string[]>([]);
const value = ref<string[]>([]);

const tasksList = computed(() => store.all);

const allTags = computed(() => {
  if (!tasksList.value || !tasksList.value.length) {
    return [];
  }

  return tasksList.value.reduce((agg: string[], task: Task) => {
    const tags = [...task.tags || []]
      .filter((tag) => !agg.includes(tag));

    if (tags.length) {
      return agg.concat(tags);
    }

    return agg;
  }, []);
});

const emit = defineEmits<{
  (event: 'input', tags: string[]): void;
  (event: 'cancel'): void;
}>();

function addValue() {
  // const v = this.$refs.selector.$refs.target.value;
  const v = '';

  if (v) {
    emit('input', v);
  }
}

function copyTags() {
  navigator.clipboard.writeText(value.value.join(', '));
}

function filterFn(val: string, update: (cb: () => void) => void/*, abort*/) {
  update(() => {
    if (val === '') {
      tagsToShow.value = allTags.value;
    }
    else {
      tagsToShow.value = allTags.value.filter(v => v.toLowerCase().indexOf(val.toLowerCase()) > -1);
    }
  })
}

function emitInput(value: string[], tab = false) {
  console.log('emitInput:', JSON.stringify(value), tab);
  if (tab && props.multiple) {
    return;
  }

  if (!tab && !props.multiple) {
    return;
  }

  emit('input', value);
}

function clearInput() {
  value.value = [];
  emit('cancel');
}

function syncInputValues() {
  if (props.inputValue) {
    value.value = typeof props.inputValue === 'string' ? [props.inputValue] : props.inputValue;
  }
}

if (props.inputValue) {
  syncInputValues();
}

watch(() => props.inputValue, () => {
  syncInputValues();
});
</script>
