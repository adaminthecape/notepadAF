<template>
  <q-btn-dropdown
      class="q-ml-xs"
      size="md"
      emit-value
      clearable
      dense
      dark
      flat
  >
    <q-list>
      <q-item
        v-for="typeOfSort in (sortTypes || defaultSortTypes)"
        :key="`sort-type-${typeOfSort}`"
        style="min-width: 10em"
        clickable
        @click="setSort(typeOfSort)"
      >
        <q-item-section>
          <div class="row items-center">
            <span>{{ typeOfSort }}</span>
            <q-space />
            <q-icon
                v-if="sortType === typeOfSort"
                :name="inverseSort ? 'arrow_downward' : 'arrow_upward'"
                size="xs"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <template #label>
      <div class="row items-center">
        <q-btn
            v-if="sortType"
            icon="close"
            size="xs"
            class="q-mr-xs"
            color="yellow"
            flat
            @click.stop.prevent="setSort(undefined)"
        />
        <div v-if="!sortType" style="margin-right: -10px;">
          Sort
        </div>
        <div v-else class="row items-center" style="margin-right: -10px;">
          <span>{{ sortType }}</span>
          <q-icon
              :name="inverseSort ? 'arrow_downward' : 'arrow_upward'"
              size="xs"
          />
        </div>
      </div>
    </template>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { TaskSortType } from 'src/types';
import { ref } from 'vue';

defineProps<{
  sortType?: TaskSortType;
  sortTypes?: TaskSortType[];
  inverseSort?: boolean;
}>();

const defaultSortTypes = ref<TaskSortType[]>(['due', 'created', 'done']);

const emit = defineEmits<{
  (event: 'setSortType', sortType: string): void
}>();

function setSort(type: TaskSortType) {
  emit('setSortType', type);
}
</script>
