<template>
  <LocalStorageList
    :value="categoriesMutable"
    title="Categories"
    list-key="taskCategories"
    @input="categoriesMutable = $event"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import useTaskStore, { TaskBucket } from 'src/pinia/taskStore';
import LocalStorageList from 'src/components/LocalStorageList.vue';

const categoriesMutable = ref<TaskBucket[]>([]);

const emit = defineEmits<{
  (event: 'updated'): void
}>();

const store = useTaskStore();

const categories = computed(() => {
  return store.getCategories;
});

function loadCategories() {
  // get saved buckets
  store.setCategoriesFromLocalStorage();
  categoriesMutable.value = [...categories.value];
}

onMounted(() => {
  loadCategories();
});
</script>
