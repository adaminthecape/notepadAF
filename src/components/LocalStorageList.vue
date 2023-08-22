<template>
  <SimpleModal full-width>
    <template #activator="{ open }">
      <q-btn
          icon="category"
          class="q-ml-xs"
          color="primary"
          dense
          flat
          @click="open"
      >
        <q-tooltip>{{ title }}</q-tooltip>
      </q-btn>
    </template>
    <template #title>
      {{ extrasTitle || title }}
    </template>
    <template #content>
      <div v-if="extrasId > -1">
        <h6 class="q-my-sm">Select tags</h6>
        <q-card
            v-if="items[extrasId].extra.tags"
        >
          <TaskTagSelector
              v-model:value="items[extrasId].extra.tags"
              class="full-width"
              multiple
              @update:model-value="addValue"
          />
        </q-card>
        <q-btn
            label="Back"
            class="q-mt-sm"
            @click="closeExtras"
        />
      </div>
      <q-list v-else class="clickable-list">
        <q-item
            v-for="(item, i) in items"
            :key="`clickable-list-item-${i}`"
            clickable
            :class="{
              'clickable-list-item': true,
              'selected': item.active
            }"
            @click="toggleItem(i)"
        >
          <q-item-section>
            <div class="row items-center">
              <div class="q-mr-lg">{{ item.title }}</div>
              <q-space />
              <q-btn
                  v-if="Object.keys(item.extra || {}).length"
                  icon="settings"
                  flat
                  dense
                  size="xs"
                  @click.stop.prevent="openExtras(i)"
              >
                <q-tooltip>Edit extras</q-tooltip>
              </q-btn>
              <q-icon v-if="item.active" name="check" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </SimpleModal>
</template>

<script setup lang="ts">
import { getFromLocalStorage, LocalStorageName, saveToLocalStorage } from 'src/utils';
import { ref, onMounted, watch, defineAsyncComponent } from 'vue';

function test(...args: any) {
  console.log('test:', ...args);
}

const SimpleModal = defineAsyncComponent(() => import('src/components/SimpleModal.vue'));
const TaskTagSelector = defineAsyncComponent(() => import('src/components/TaskTagSelector.vue'));

const items = ref<Record<string, any>[]>([]);
const extrasId = ref<number>(-1);
const extrasTitle = ref<string>();

const emit = defineEmits<{
  (event: 'input', value: any): void;
  (event: 'updated'): void;
}>();

const props = defineProps<{
  value: Record<string, any>[];
  listKey: string;
  title: string;
}>();

function toggleItem(num: number) {
  if (items.value[num]) {
    items.value[num].active = !items.value[num].active;

    if (props.listKey) {
      saveToLocalStorage(props.listKey as LocalStorageName, items.value);
      emit('updated');
    }
  }
}
function openExtras(i: number) {
  extrasId.value = i;
  extrasTitle.value = items.value[i].title;
}
function closeExtras() {
  extrasId.value = -1;
  extrasTitle.value = undefined;
}

onMounted(() => {
  if (props.listKey) {
    const storedItems = getFromLocalStorage(props.listKey as LocalStorageName, true);

    if (storedItems) {
      items.value = storedItems;
    }
  }

  setTimeout(() => {
    items.value = [...props.value || []];
  }, 500);
});

function addValue(val: string[]) {
  if (extrasId.value < 0) {
    return;
  }

  if (!items.value[extrasId.value].extra.tags) {
    items.value[extrasId.value].extra.tags = val?.length ? [...val] : [];

    return;
  }

  (val || []).forEach((v) => {
    if (!items.value[extrasId.value].extra.tags.includes(v)) {
      items.value[extrasId.value].extra.tags.push(v);
    }
    else {
      items.value[extrasId.value].extra.tags = items.value[extrasId.value].extra.tags.filter((x: string) => x !== v);
    }
  });
}

function save(newVal: Record<string, any>[]) {
  console.log('save:', props.value, items.value);
  emit('input', newVal);
  items.value = newVal;
  if (props.listKey) {
    saveToLocalStorage(props.listKey as LocalStorageName, newVal);
    emit('updated');
  }
}

watch(props.value, (newVal) => {
  save(newVal);
});

console.log('init:', props.value, items.value);
if (props.value?.length && !items.value?.length) {
  save(props.value);
}
</script>

<style scoped>
.clickable-list {
  border-radius: 6px;
  border: 1px solid #9C27B0;
}

.clickable-list-item {
  min-width: 12em;
}

.clickable-list-item.selected {
  background-color: #21BA4540;
}

.clickable-list-item:not(:last-child) {
  border-bottom: 1px solid #9C27B0;
}
</style>
