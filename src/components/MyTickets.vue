<template>
  <SimpleLayout :page-offset="100" :page-classes="['q-mx-sm']" header>
    <template #header-left>
      <!-- controls menu activator goes here -->
    </template>
    <template #header-title> Tickets </template>
    <template #header-right>
      <SimpleModal>
        <template #activator="{ open }">
          <q-btn icon="search" dense class="q-mr-sm" @click="open" />
        </template>
        <template #content>
          <q-item>
            <q-item-section caption>
              <h5>Keyword</h5>
            </q-item-section>
            <q-item-section>
              <q-input
                v-model="queryParams.text"
                class="q-pa-sm"
                bottom-slots
                stack-label
                clearable
                filled
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section caption>
              <h5>Owner</h5>
            </q-item-section>
            <q-item-section>
              <q-input
                v-model="queryParams.owner"
                class="q-pa-sm"
                bottom-slots
                stack-label
                clearable
                filled
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section caption>
              <div class="row items-center">
                <h5>
                  Epic
                </h5>
                <q-space />
                <div class="row items-center">
                  <q-btn label="All" class="q-pa-sm" dense flat @click="toggleSelectAll('epic')" />
                  <q-btn label="Dev" class="q-pa-sm" dense flat @click="toggleSelectAll('epic', 'dev')" />
                  <q-btn label="QA" class="q-pa-sm" dense flat @click="toggleSelectAll('epic', 'qa')" />
                </div>
              </div>
            </q-item-section>
            <q-item-section>
              <q-select
                v-model="queryParams.epic"
                :options="queryParamOptions.epic"
                class="q-pa-sm"
                stack-label
                filled
                :multiple="queryParamMultiples.epic || false"
              >
                <template #append>
                  <q-btn
                    v-if="queryParams.epic"
                    icon="clear"
                    dense
                    flat
                    @click.stop.prevent="queryParams.epic = undefined"
                  />
                </template>
              </q-select>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section caption>
              <h5>
                Include done
              </h5>
            </q-item-section>
            <q-item-section>
              <q-checkbox
                v-model="queryParams.includedone"
                class="q-pa-sm"
              />
            </q-item-section>
          </q-item>
        </template>
        <template #actions>
            <q-btn
              v-close-popup
              icon="search"
              label="Search"
              class="q-ma-sm"
              color="primary"
              @click="getTickets"
            />
          </template>
      </SimpleModal>
      <q-btn icon="refresh" dense class="q-mr-sm" @click="getTickets" />
      <AppTabSelector />
    </template>
    <template #page-header>
      <transition name="fade" appear>
        <div v-if="resultTotals" :key="resultsRenderIndex" class="q-mt-sm">
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
    </template>
    <template #page-content>
      <q-scroll-area style="height: calc(100vh - 120px)">
        <div>
          <div v-if="isLoadingActivity" class="full-width">
            <q-spinner size="lg" style="margin: 0 auto" />
          </div>
          <div v-for="story in results" :key="`${story.id}-${listRenderKey}`" class="bordered q-mb-xs">
            <q-item clickable class="q-pa-sm">
              <StoryCard :story-id="story.id" allow-add-tasks dense />
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
import { ref, computed, onMounted, watch } from 'vue';
import { TaskSortType } from 'src/types';
import { PivotalStory } from 'src/pinia/pivotalStore';
import TaskSortDropdown from 'src/components/TaskSortDropdown.vue';
import StoryCard from 'src/components/StoryCard.vue';
import SimpleLayout from 'src/components/SimpleLayout.vue';
import SimpleModal from 'src/components/SimpleModal.vue';
import AppTabSelector from 'src/components/AppTabSelector.vue';

const props = defineProps({
  cachedTickets: {
    type: Array,
    default: null,
  }
});

const isLoadingActivity = ref(false);
const results = ref<PivotalStory[]>(
  props.cachedTickets as PivotalStory[] || []
);
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
    results.value = props.cachedTickets as PivotalStory[];
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
  if (!results.value || !results.value.length) {
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

  queryParamsCopy = {};

  if (queryParamInfo) {
    Object.keys(queryParamInfo).forEach((paramName) => {
      if (queryParams.value[paramName]) {
        queryParamsCopy[paramName] = queryParams.value[paramName];
      }
    });

    saveParams(queryParamsCopy);
  }

  resultTotals.value = {};

  console.log({ uri, queryParams });

  const res = await getPivotalEndpoint(
    uri,
    {},
    JSON.parse(JSON.stringify(queryParamsCopy))
  );

  isLoadingActivity.value = false;

  if (res && res.stories && res.stories.stories) {
    results.value = res.stories.stories;
    resultTotals.value = {
      hits: res.stories.total_hits,
      points: res.stories.total_points,
      completedPoints: res.stories.total_points_completed,
    };
    sortResults(res.stories.stories);
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
