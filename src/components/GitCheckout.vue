<template>
  <SimpleModal>
    <template #activator="{ open }">
      <slot name="activator" v-bind="{ open }">
        <q-btn
          class="q-mr-xs"
          icon="hub"
          dense
          flat
          @click="open"
        />
      </slot>
    </template>
    <template #content>
      <div style="display:flex; flex-direction: column">
        <q-input
          v-model="targetBranch"
          label="Branch (or PT #)"
          filled
          dense
        />
        <q-checkbox v-model="cls" label="Clear screen" />
        <q-checkbox v-model="lib" label="acb-lib" />
        <q-checkbox v-model="run" label="Run after checkout" />
        <q-checkbox v-model="migrateUp" label="Migrate up after checkout" />
        <q-checkbox v-model="migrateDown" label="Migrate down first" />
      </div>
      <q-card class="q-my-md">
        <q-item>
          <q-item-section>
            <code>{{ result }}</code>
          </q-item-section>
        </q-item>
      </q-card>
      <div class="row">
        <q-space />
        <q-btn label="Copy" @click="copy" />
      </div>
    </template>
  </SimpleModal>
</template>

<script setup lang="ts">
import { defineProps, computed, ref, onMounted } from 'vue';
import SimpleModal from 'src/components/SimpleModal.vue';
import { copyToClipboard } from 'src/utils';

const props = defineProps({
  target: {
    type: String,
    default: undefined
  }
});

onMounted(() => {
  targetBranch.value = props.target || '';
});

const cls = ref(true);
const lib = ref(true);
const run = ref(true);
const migrateUp = ref(false);
const migrateDown = ref(false);
const targetBranch = ref('');

const result = computed(() =>
{
  const branch = (
    parseInt(targetBranch.value, 10).toString() === targetBranch.value ?
      `PT_${targetBranch.value}` :
      targetBranch.value
  );
  const opts = {
    lib: lib.value,
    migrateUp: migrateUp.value,
    migrateDown: migrateDown.value,
    cls: cls.value,
    run: run.value
  };

  const mods = [];

  if(opts.cls) mods.push('cls');
  if(opts.migrateDown) mods.push('npm run migrate:down');

  mods.push(`git checkout ${branch}`);

  if(opts.lib) mods.push('npm link acb-lib');
  if(opts.migrateUp) mods.push('npm run migrate:up');
  if(opts.run) mods.push('npm run serve');

  return mods.join(' && ');
});

function copy()
{
  copyToClipboard(result.value);
}
</script>
