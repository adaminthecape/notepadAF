<template>
  <q-input
    v-model="keyword"
    placeholder="Filter by keyword"
    class="q-mr-xs"
    style="flex-grow: 1;"
    filled
    dense
  >
    <template #append>
      <q-btn
        v-if="keyword" icon="close"
        round
        dense
        flat
        size="xs"
        @click.stop.prevent="emit('input', ''); keyword = ''"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  value: {
    type: String,
    default: undefined
  }
});

const emit = defineEmits<{
  (event: 'input', keyword: string): void
}>();

const keyword = ref<string>(props.value || '');

watch(keyword, (n: string) => {
  emit('input', n);
});
</script>
