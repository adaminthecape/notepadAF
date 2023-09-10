<template>
  <q-btn-group>
    <q-btn
      color="primary"
      icon="keyboard_double_arrow_left"
      size="md"
      class="full-width"
      dense
      flat
      :v-close-popup="false"
      @click.stop.prevent="emit('far-left')"
    />
    <q-btn
      color="primary"
      icon="keyboard_arrow_left"
      size="md"
      class="full-width"
      dense
      flat
      @click.stop.prevent="emit('near-left')"
    />
    <q-btn :label="label" no-caps dense />
    <q-btn
      color="primary"
      icon="keyboard_arrow_right"
      size="md"
      class="full-width"
      dense
      flat
      @click.stop.prevent="emit('near-right')"
    />
    <q-btn
      color="primary"
      icon="keyboard_double_arrow_right"
      size="md"
      class="full-width"
      dense
      flat
      @click.stop.prevent="emit('far-right')"
    />
  </q-btn-group>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    default: 'Change me'
  }
});

const emit = defineEmits<{
  (event: 'far-left'): void;
  (event: 'near-left'): void;
  (event: 'near-right'): void;
  (event: 'far-right'): void;
}>();
</script>
