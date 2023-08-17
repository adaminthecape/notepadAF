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

<script>
import useTaskStore from 'src/pinia/taskStore';
export default {
  props: {
    inputValue: {
      type: Array,
      default: undefined
    },
    label: {
      type: String,
      default: 'new tag...'
    },
    multiple: {
      type: Boolean,
      default: false
    },
    dark: {
      type: Boolean,
      default: false
    },
    newValueMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tagsToShow: [],
      value: null
    };
  },
  computed: {
    tasksList() {
      return useTaskStore().getTasks;
      // return this.$store.getters['notes/getTasks'];
    },
    allTags() {
      if (!this.tasksList || !this.tasksList.length) {
        return [];
      }

      return this.tasksList.reduce((agg, task) => {
        const tags = [...task.tags || []]
          .filter((tag) => !agg.includes(tag));

        if (tags.length) {
          return agg.concat(tags);
        }

        return agg;
      }, []);
    }
  },
  created() {
    this.value = this.inputValue || [];
  },
  watch: {
    inputValue(newVal) {
      this.value = newVal;
    }
  },
  methods: {
    addValue() {
      const v = this.$refs.selector.$refs.target.value;

      if (v) {
        this.$emit('input', v);
      }
    },
    copyTags() {
      navigator.clipboard.writeText(this.value.join(', '));
    },
    filterFn(val, update/*, abort*/) {
      update(() => {
        if (val === '') {
          this.tagsToShow = this.allTags;
        }
        else {
          this.tagsToShow = this.allTags.filter(v => v.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }
      })
    },
    emitInput(value, tab = false) {
      if (tab && this.multiple) {
        return;
      }

      if (!tab && !this.multiple) {
        return;
      }

      this.$emit('input', value);
    },
    clearInput() {
      this.value = null;
      this.$emit('cancel');
    }
  }
};
</script>
