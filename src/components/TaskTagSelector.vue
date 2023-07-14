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
      newValueMode="add-unique"
      style="width: 12em"
      @filter="filterFn"
      @keydown.tab="emitInput(value, true)"
      @input="emitInput(value, false)"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>
    <template #append>
      <q-btn
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
import uniq from 'lodash/uniq';

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
      const note = this.$store.getters['notes/getNote']('tasks');

      if(note)
      {
        return note.tasks;
      }

      return null;
    },
    allTags()
    {
      if(!this.tasksList || !this.tasksList.length)
      {
        return [];
      }

      return uniq(this.tasksList.reduce((agg, task) =>
      {
        if(!task.tags)
        {
          return agg;
        }

        return agg.concat(task.tags);
      }, []));
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