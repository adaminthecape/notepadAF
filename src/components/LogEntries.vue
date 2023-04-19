<template>
  <SimpleLayout header>
    <template #header-left>
    </template>
    <template #header-title>
      Log
    </template>
    <template #header-right>
      <q-btn
          :label="changeLogTypes ? 'View log' : 'Settings'"
          dense
          flat
          @click="changeLogTypes = !changeLogTypes"
      />
      <q-btn
          icon="close"
          dense
          round
          flat
          @click="$emit('close')"
      />
    </template>
    <template #page-content>
      <q-card v-if="changeLogTypes">
        <h4 class="q-pt-md q-pl-md">Log types to ignore</h4>
        <q-select
            v-model="logTypesToIgnore"
            :options="knownLogTypes"
            multiple
            filled
            @input="updateLogTypes"
        />
        <q-checkbox
          v-model="ignoreAllLogTypes"
          label="Disable all toast notifications for logs"
          class="q-mt-md q-pa-xs"
          @input="updateAllLogTypesToggle"
        />
      </q-card>
      <q-list v-else>
        <q-card
            v-for="(audit, a) in audits"
            :key="`audit-${a}`"
            class="q-mb-sm"
            style="background: #FFFFFF80; max-width: 360px; overflow: hidden"
        >
          <q-item dense clickable>
            <q-item-section>
              <q-badge dense class="q-mb-xs">
                <span>{{ audit.date }}</span>&nbsp;&nbsp;
                <span class="text-bold">{{ audit.type }}</span>
              </q-badge>
              <q-badge dense class="q-mb-xs" @click="$notify(audit.msg, { timeout: 120000 }, {})">
                {{ audit.msg }}
              </q-badge>
              <q-badge
                  v-if="audit.opts"
                  dense
                  color="white"
                  style="color: black"
              >
                <span>{{ audit.opts }}</span>
              </q-badge>
            </q-item-section>
          </q-item>
        </q-card>
      </q-list>
    </template>
  </SimpleLayout>
</template>

<script>
import { logTypes } from '../mixins/constants';
import Pivotal from '../mixins/Pivotal';
import DbMixin from '../mixins/jsondb';
import GitMixin from '../mixins/git';
import SimpleLayout from './SimpleLayout';

export default {
  name: 'LogEntries',
  components: {
    SimpleLayout
  },
  mixins: [Pivotal, GitMixin, DbMixin],
  props: {
    logEntries: {
      type: Array,
      required: true
    }
  },
  data()
  {
    const storedTypes = localStorage.getItem('logTypesToIgnore');
    const ignoreAllLogTypes = localStorage.getItem('ignoreAllLogTypes');
    return {
      ignoreAllLogTypes: ignoreAllLogTypes || false,
      changeLogTypes: false,
      logTypesToIgnore: storedTypes ? JSON.parse(storedTypes) || [] : []
    };
  },
  computed: {
    knownLogTypes()
    {
      return logTypes;
    },
    audits()
    {
      return [...this.logEntries].reverse().map((audit) =>
      {
        audit.date = new Date(audit.time).toLocaleString();

        return audit;
      });
    }
  },
  async mounted()
  {
  },
  methods: {
    updateLogTypes()
    {
      this.$log('updateLogTypes');
      const types = [...this.logTypesToIgnore];

      localStorage.setItem(
          'logTypesToIgnore',
          Array.isArray(types) ? JSON.stringify(types) : types
      );
    },
    updateAllLogTypesToggle()
    {
      this.$log('updateAllLogTypesToggle', this.ignoreAllLogTypes);
      localStorage.setItem('ignoreAllLogTypes', this.ignoreAllLogTypes);
    }
  }
};
</script>