<template>
  <SimpleModal>
    <template #activator="{ open }">
      <slot name="activator" v-bind="{ open }" />
    </template>
    <template #content>
      <div style="display: flex; flex-direction: column">
        <q-input
          v-model="value"
          placeholder="Add a tag..."
          class="q-mb-xs"
          filled
          dense
        />
        <q-list style="max-height: 50vh; overflow-y: scroll">
          <q-item
            v-for="(tag, t) in filteredList"
            :key="`list-tag-${t}`"
            clickable
            v-close-popup
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
      <q-btn
        v-close-popup
        icon="save"
        dense
        color="green-9"
        @click="pickTag(value)"
      />
    </template>
  </SimpleModal>
</template>

<script>
import { getTasks } from "src/storeHelpers";

export default {
  components: {
    SimpleModal: () => import("src/components/SimpleModal.vue"),
  },
  data() {
    return {
      value: "",
    };
  },
  computed: {
    tasksList() {
      return getTasks(this.$store);
    },
    allTags() {
      if (!this.tasksList || !this.tasksList.length) {
        return [];
      }

      return this.tasksList.reduce((agg, task) => {
        const tags = [...(task.tags || [])].filter((tag) => !agg.includes(tag));

        if (tags.length) {
          return agg.concat(tags);
        }

        return agg;
      }, []);
    },
    filteredList() {
      if (!this.value) {
        return this.allTags;
      } else {
        return this.allTags.filter(
          (v) => v.toLowerCase().indexOf(this.value.toLowerCase()) > -1
        );
      }
    },
  },
  methods: {
    pickTag(tag) {
      this.$emit("input", tag);
      this.value = "";
    },
  },
};
</script>
