<template>
<!--  :options="allTags.map((t) => ({ label: t, value: t }))"-->
  <q-select
      v-model="value"
      :options="tagsToShow"
      :label="label"
      :multiple="multiple"
      dense
      filled
      useInput
      :hideSelected="!multiple"
      fillInput
      :dark="dark"
      inputDebounce="0"
      :newValueMode="newValueMode ? 'add-unique' : undefined"
      style="width: 12em"
      @filter="filterFn"
      @keydown.tab="emitInput(value, true)"
      @input="emitInput(value, false)"
  >
    <template v-slot:no-option>
      <q-item :clickable="newValueMode">
        <q-item-section class="text-grey">
          <div v-if="!newValueMode">No results</div>
          <div v-else class="text-amber">
            Press Enter then Tab to add
          </div>
        </q-item-section>
      </q-item>
    </template>
    <template #append>
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
import { getAllTasksFromStore } from "src/utils";

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
  data()
  {
    return {
      tagsToShow: [],
      value: null
    };
  },
  computed: {
    tasksList()
    {
      return getAllTasksFromStore(this.$store);
    },
    allTags()
    {
      if(!this.tasksList || !this.tasksList.length)
      {
        return [];
      }

      return this.tasksList.reduce((agg, task) =>
      {
        const tags = [...task.tags || []]
            .filter((tag) => !agg.includes(tag));

        if(tags.length)
        {
          return agg.concat(tags);
        }

        return agg;
      }, []);
    }
  },
  watch: {
    inputValue(newVal)
    {
      this.value = newVal;
    }
  },
  methods: {
    copyTags()
    {
      navigator.clipboard.writeText(this.value.join(', '));
    },
    filterFn(val, update/*, abort*/)
    {
      update(() => {
        if (val === '')
        {
          this.tagsToShow = this.allTags;
        }
        else
        {
          this.tagsToShow = this.allTags.filter(v => v.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }
      })
    },
    emitInput(value, tab = false)
    {
      if(tab && this.multiple)
      {
        return;
      }

      if(!tab && !this.multiple)
      {
        return;
      }

      this.$emit('input', value);
    },
    clearInput()
    {
      this.value = null;
      this.$emit('cancel');
    }
  }
};
</script>