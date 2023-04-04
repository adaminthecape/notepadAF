<template>
  <q-expansion-item
      :style="`max-width: ${$q.screen.width} !important;`"
      :class="{ demoFilter: demoMode }"
  >
    <template #header>
      <div class="col">
        <div class="row items-center">
          <div class="row full-width">
            <q-chip
                readonly
                filled
                dense
                style="cursor: pointer; overflow: hidden;"
                :style="demoMode ? 'filter: blur(4px)' : ''"
            >
              <span class="text-bold">{{ action.date }} {{ action.time }}</span>&nbsp;-&nbsp;<span>{{ shortMessage(action.message, 50) }}</span>
            </q-chip>
            <q-space />
            <span></span>
          </div>
        </div>
        <div>
        </div>
        <q-chip
            v-if="simpleChanges.newEpic"
            size="sm"
            dense
        >
          Moved to:
          <q-chip
              color="primary"
              size="sm"
              dense
              dark
          >
            {{ simpleChanges.newEpic }}
          </q-chip>
        </q-chip>
        <q-chip
            v-if="simpleChanges.newLabels.length"
            size="sm"
            dense
        >
          Added label:
          <q-chip
              v-for="label in simpleChanges.newLabels"
              :key="`newLabel-${label}`"
              :style="demoMode ? 'filter: blur(4px)' : ''"
              color="secondary"
              size="sm"
              dense
              dark
          >
            {{ label }}
          </q-chip>
        </q-chip>
        <div v-if="simpleChanges.newEpic">
        </div>
        <div
            v-for="(resource, r) in action.resources"
            :key="`${action.guid}-resource-${r}`"
            class="row items-center"
        >
          <q-btn
              label="View"
              color="primary"
              dense
              flat
              @click.stop.prevent="$openLink(resource.url)"
          />
          <q-btn
              label="Git C/O"
              color="negative"
              dense
              flat
              @click.stop.prevent="checkoutBoth(resource.id)"
          />
          <q-chip
              color="primary"
              :style="demoMode ? 'filter: blur(4px)' : ''"
              dense
              dark
          >
            {{ resource.kind }}
            <q-icon
                v-if="resource.kind === 'story'"
                :name="resource.story_type === 'feature' ? 'star' : 'bug_report'"
                color="warning"
                class="q-ml-xs"
            />
            {{ resource.id }}
          </q-chip>
          <div class="q-mx-sm" :style="demoMode ? 'filter: blur(4px)' : ''">
            {{ resource.name }}
          </div>
        </div>
      </div>
    </template>
    <template #default>
      <q-item
          v-for="(change, c) in action.changes"
          :style="demoMode ? 'filter: blur(4px)' : ''"
          :key="`${action.guid}-change-${c}`"
          class="row items-center"
          clickable
          dense
      >
        <q-item-section
            class="q-pa-xs"
            style="border-left: 2px solid #FF6400"
        >
          {{ change }}
        </q-item-section>
      </q-item>
    </template>
  </q-expansion-item>
</template>

<script>
import DbMixin from '../mixins/jsondb';
import GitMixin from '../mixins/git';

export default {
  mixins: [GitMixin, DbMixin],
  props: {
    action: {
      type: Object,
      required: true
    }
  },
  inject: ['$openLink'],
  computed: {
    demoMode()
    {
      const local = localStorage.getItem('demoMode');

      return local ? JSON.parse(local) : false;
    },
    simpleChanges()
    {
      return this.action.changes.reduce((agg, change) =>
      {
        if(change.startsWith('update label to '))
        {
          const changeWithoutLabel = change.replace('update label to \"', '').replace('\"', '');

          if(this.isEpic(changeWithoutLabel))
          {
            agg.newEpic = changeWithoutLabel;
          }
          else
          {
            agg.newLabels.push(changeWithoutLabel);
          }
        }

        return agg;
      }, {
        newEpic: '',
        newLabels: []
      });
    }
  },
  methods: {
    shortMessage(str, len = 50)
    {
      if(!str) return str;

      return str.length > len ?
          `${str.slice(0, len)}...` :
          str;
    },
    isEpic(label)
    {
      // const epics = [
      //     'dev (spec)',
      //     'dev (ready)',
      //     'dev (pr + docs)',
      //     'dev (merge)'
      // ];

      // return epics.includes(label);
      return label.startsWith('dev (') ||
          label.startsWith('qa (') ||
          label.startsWith('cst (')
    }
  }
};
</script>

<style scoped>
  .demoFilter {
    filter: blur(4px);
  }
</style>