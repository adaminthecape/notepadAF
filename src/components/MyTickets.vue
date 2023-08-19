<template>
  <SimpleLayout :page-offset="100" :page-classes="['q-mx-sm']" header>
    <template #header-left>
      <!-- controls menu activator goes here -->
    </template>
    <template #header-title> Tickets </template>
    <template #header-right>
      <q-btn icon="refresh" dense @click="getTickets" />
    </template>
    <template #page-header>
      <q-expansion-item label="Options" class="q-my-sm bordered" default-opened>
        <q-item v-for="param in queryParamNames" :key="`param-${param}`" clickable>
          <q-item-section caption>
            <div class="row items-center">
              <h5>
                {{ param }}
              </h5>
              <q-space />
              <div v-if="queryParamMultiples.epic">
                <div class="row items-center">
                  <q-btn label="All" class="q-pa-sm" dense flat @click="toggleSelectAll(param)" />
                  <q-btn label="Dev" class="q-pa-sm" dense flat @click="toggleSelectAll(param, 'dev')" />
                  <q-btn label="QA" class="q-pa-sm" dense flat @click="toggleSelectAll(param, 'qa')" />
                </div>
              </div>
            </div>
          </q-item-section>
          <q-item-section>
            <q-checkbox v-if="['includedone'].includes(param)" v-model="queryParams[param]" class="q-pa-sm" />
            <q-select
              v-else-if="queryParamOptions[param]"
              v-model="queryParams[param]"
              :options="queryParamOptions[param]"
              class="q-pa-sm"
              stack-label
              filled
              :multiple="queryParamMultiples.epic || false"
            >
              <template #append>
                <q-btn
                  v-if="queryParams[param]"
                  icon="clear"
                  dense
                  flat
                  @click.stop.prevent="queryParams[param] = null"
                />
              </template>
            </q-select>
            <q-input
v-else v-model="queryParams[param]" class="q-pa-sm" bottom-slots stack-label filled
              :mask="queryParamMasks.created || undefined">
              <template #append>
                <q-btn
v-if="queryParams[param]" icon="clear" dense flat
                  @click.stop.prevent="queryParams[param] = null" />
              </template>
            </q-input>
          </q-item-section>
        </q-item>
        <div class="row">
          <q-space />
          <q-btn icon="save" label="Save options and reload" class="q-ma-sm" @click="getTickets" />
        </div>
      </q-expansion-item>
    </template>
    <template #page-content>
      <q-scroll-area style="height: calc(100vh - 120px)">
        <div>
          <transition name="fade" appear>
            <div v-if="resultTotals" :key="resultsRenderIndex">
              <q-badge
v-if="resultTotals.hits > 0" color="primary" style="font-size: 1.2em; user-select: none"
                class="q-pa-md q-mb-md full-width">
                <div class="row items-center full-width">
                  <div>
                    {{ resultTotals.hits }} stories,
                    {{ resultTotals.points }} points
                  </div>
                  <q-space />
                  <div>
                    <TaskSortDropdown
                      :sort-type="sortType"
                      :sort-types="sortTypes"
                      :inverse-sort="inverseSort"
                      @set-sort-type="setSortType"
                    />
                  </div>
                </div>
              </q-badge>
              <q-badge
v-else color="primary" style="font-size: 1.2em; user-select: none"
                class="q-pa-md q-mb-md full-width">
                <div class="row items-center full-width">
                  <div>No results found.</div>
                </div>
              </q-badge>
            </div>
          </transition>
          <div v-if="isLoadingActivity" class="full-width">
            <q-spinner size="lg" style="margin: 0 auto" />
          </div>
          <div v-for="story in storyResults" :key="`${story.id}-${listRenderKey}`" class="bordered q-mb-xs">
            <q-item clickable class="q-pa-sm">
              <StoryCard :story-id="story.id" allow-add-tasks />
            </q-item>
          </div>
        </div>
      </q-scroll-area>
    </template>
  </SimpleLayout>
</template>

<script setup lang="ts">
import { getPivotalEndpoint } from '../mixins/Pivotal';
import { pivotalData } from 'src/constants';
import {
  intSort,
  dateSort,
  stringSort,
  LocalStorageName,
  getFromLocalStorage,
} from 'src/utils';
import { ref, defineAsyncComponent, computed, onMounted, watch } from 'vue';
import { TaskSortType } from 'src/types';

const TaskSortDropdown = defineAsyncComponent(() => import('src/components/TaskSortDropdown.vue'));
const StoryCard = defineAsyncComponent(() => import('src/components/StoryCard.vue'));
const SimpleLayout = defineAsyncComponent(() => import('src/components/SimpleLayout.vue'));

const props = defineProps({
  cachedTickets: {
    type: Array,
    default: null,
  }
});

const isLoadingActivity = ref(false);
const results = ref(props.cachedTickets || []);
const queryParamMultiples = ref({
  epic: true,
});
const queryParamMasks = ref({
  created: '##/##/20##',
});
const queryParamOptions = ref<any>({
  epic: [
    'dev (spec)',
    'dev (ready)',
    'dev (active)',
    'dev (pr + docs)',
    'dev (pr complete)',
    'qa (ready)',
    'qa (active)',
    'dev (rehab)',
    'dev (qa pass)',
    'dev (qa fail)',
    'dev (merge)',
    'cst (live actions)',
    'priorities (internal)',
  ],
  has: ['attachment'],
  state: ['unstarted', 'started'],
});
const savedQueryParams =
  getFromLocalStorage(LocalStorageName.ticketQueryParams) || {};
const queryParams = ref({
  // this should be filled from endpoint queryParams
  text: '',
  owner: 'AF',
  // requester: null,
  epic: ['dev (active)', 'dev (pr + docs)'],
  includedone: false,
  ...(savedQueryParams && { ...savedQueryParams }),
});
const resultTotals = ref<Record<string, any>>({});
const storyResults = ref<Record<string, any>>([]);
const resultsRenderIndex = ref(0);
const sortType = ref();
const inverseSort = ref(false);
const sortTypes = ref(['created', 'name', 'updated', 'points']);
const listRenderKey = ref(0);

const queryParamNames = computed(() => {
  return Object.keys(queryParams.value);
});

onMounted(async () => {
  if (!props.cachedTickets) {
    await getTickets();
  } else {
    storyResults.value = props.cachedTickets;
    resultTotals.value.hits = props.cachedTickets.length;
    resultTotals.value.points = props.cachedTickets.reduce(
      (acc, t: any) => acc + t.estimate,
      0
    );
  }
});

watch(sortType.value, () => sortResults(results.value));

function setSortType(type: TaskSortType | string) {
  if (type === sortType.value) {
    // invert it
    inverseSort.value = !inverseSort.value;
  } else {
    sortType.value = type;
  }

  sortResults(results.value);
}

function sortResults(results: any) {
  if (!results || !results.length) {
    return [];
  }

  if (sortType.value === 'created') {
    dateSort(results.value, 'created_at', inverseSort.value);
  }

  if (sortType.value === 'name') {
    stringSort(results.value, 'name', inverseSort.value);
  }

  if (sortType.value === 'updated') {
    dateSort(results.value, 'updated_at', inverseSort.value);
  }

  if (sortType.value === 'points') {
    intSort(results.value, 'estimate', inverseSort.value);
  }

  storyResults.value = results.value;
}

function saveParams(params: Record<string, any>) {
  localStorage.setItem(
    LocalStorageName.ticketQueryParams,
    JSON.stringify(params)
  );
}

const emit = defineEmits<{
  (event: 'updatedTickets', value: any[]): void
}>();

async function getTickets() {
  isLoadingActivity.value = true;

  const { path: uri, queryParams: queryParamInfo } =
    pivotalData.endpoints.search.all;
  let queryParamsCopy: Record<string, any>;

  if (queryParamInfo) {
    queryParamsCopy = {};

    Object.keys(queryParamInfo).forEach((paramName) => {
      if (queryParams.value[paramName]) {
        queryParamsCopy[paramName] = queryParams.value[paramName];
      }
    });

    saveParams(queryParamsCopy);
  }

  resultTotals.value = {};

  const res = await getPivotalEndpoint(uri, {}, queryParams);

  isLoadingActivity.value = false;

  if (res && res.stories && res.stories.stories) {
    results.value = res.stories.stories;
    resultTotals.value = {
      hits: res.stories.total_hits,
      points: res.stories.total_points,
      completedPoints: res.stories.total_points_completed,
    };
    sortResults(results.value);
  } else {
    console.warn('Results are in an unexpected format!');
  }

  resultsRenderIndex.value += 1;

  try {
    emit('updatedTickets', res.stories.stories);
  } catch (e) {
    //
  }

  return res;
}

function toggleSelectAll(param: any, containing?: any) {
  if ((queryParamOptions.value as any)[param]) {
    if (containing) {
      queryParams.value[param] = [
        ...(queryParamOptions.value as any)[param].filter((opt: any[]) =>
          opt.includes(containing)
        ),
      ];
    } else {
      queryParams.value[param] = [...(queryParamOptions.value as any)[param]];
    }
  }
}
</script>
