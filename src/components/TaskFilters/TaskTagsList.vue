<template>
  <div class="row items-center">
    <!-- ADD TAGS: -->
    <AddTag
      :selected-tags="tags || []"
      @input="addTag"
      @remove="removeTag($event)"
    >
      <template #activator="{ open }">
        <slot name="activator" v-bind="{ open }">
          <q-btn
            icon="add_box"
            :size="size"
            color="info"
            dense
            flat
            @click="open"
          ><q-tooltip>Add tags</q-tooltip></q-btn>
        </slot>
      </template>
    </AddTag>
    <div v-if="!manageOnly">
      <!-- VIEW TAGS: -->
      <q-chip
        v-for="(tag, tagIndex) in areTagsExpanded ?
              (tags || []) :
              (tags || []).slice(0, 1)"
        :key="`tag-${tagIndex}`"
        color="info"
        :size="size"
        square
        dense
        dark
        style="margin-right: -2px"
      >
        <div class="row items-center">
      <span
        style="font-size:1.2em"
        @click="emit('filterByTag', tag)"
      >{{ tag }}</span>
        </div>
      </q-chip>
      <q-chip
        v-if="(tags || []).length > 1"
        color="info"
        :size="size"
        clickable
        square
        dense
        dark
        @click="areTagsExpanded = !areTagsExpanded"
      ><q-icon :name="areTagsExpanded ? 'keyboard_arrow_left' : 'keyboard_arrow_right'" /></q-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import AddTag from 'src/components/AddTag.vue';
import { computed, ref } from 'vue';
import useTaskStore from 'src/pinia/taskStore';

const props = defineProps({
  taskId: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'sm'
  },
  manageOnly: {
    type: Boolean,
    default: false
  }
});

const tags = computed(() => store.getTaskProperty(props.taskId, 'tags') || []);

const areTagsExpanded = ref(false);
const addingTag = ref(false);

const emit = defineEmits<{
  (event: 'remove', tag: string): void;
  (event: 'filterByTag', tag: string): void;
}>();

const store = useTaskStore();

function removeTag(tag: string) {
  if (tags.value.includes(tag)) {
    store.cloudUpdateSingleProperty({
      taskId: props.taskId,
      prop: 'tags',
      data: (tags.value || []).filter((t: string) => t !== tag),
    });
  }
};

function addTag(tag: string) {
  if (!tags.value.includes(tag)) {
    store.cloudUpdateSingleProperty({
      taskId: props.taskId,
      prop: 'tags',
      data: [...(tags.value || []), tag],
    });
  }

  addingTag.value = false;
};

</script>
