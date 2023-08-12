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
      <q-expansion-item label="Options" class="q-my-sm bordered" defaultOpened>
        <q-item
          v-for="param in queryParamNames"
          :key="`param-${param}`"
          clickable
        >
          <q-item-section caption>
            <div class="row items-center">
              <h5>
                {{ param }}
              </h5>
              <q-space />
              <div v-if="queryParamMultiples[param]">
                <div class="row items-center">
                  <q-btn
                    label="All"
                    class="q-pa-sm"
                    dense
                    flat
                    @click="toggleSelectAll(param)"
                  />
                  <q-btn
                    label="Dev"
                    class="q-pa-sm"
                    dense
                    flat
                    @click="toggleSelectAll(param, 'dev')"
                  />
                  <q-btn
                    label="QA"
                    class="q-pa-sm"
                    dense
                    flat
                    @click="toggleSelectAll(param, 'qa')"
                  />
                </div>
              </div>
            </div>
          </q-item-section>
          <q-item-section>
            <q-checkbox
              v-if="['includedone'].includes(param)"
              v-model="queryParams[param]"
              class="q-pa-sm"
            />
            <q-select
              v-else-if="queryParamOptions[param]"
              v-model="queryParams[param]"
              :options="queryParamOptions[param]"
              class="q-pa-sm"
              stack-label
              filled
              :multiple="queryParamMultiples[param] || false"
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
              v-else
              v-model="queryParams[param]"
              class="q-pa-sm"
              bottom-slots
              stack-label
              filled
              :mask="queryParamMasks[param] || undefined"
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
            </q-input>
          </q-item-section>
        </q-item>
        <div class="row">
          <q-space />
          <q-btn
            icon="save"
            label="Save options and reload"
            class="q-ma-sm"
            @click="getTickets"
          />
        </div>
      </q-expansion-item>
    </template>
    <template #page-content>
      <q-scroll-area style="height: calc(100vh - 120px)">
        <div>
          <transition name="fade" appear>
            <div v-if="resultTotals" :key="resultsRenderIndex">
              <q-badge
                v-if="resultTotals.hits > 0"
                color="primary"
                style="font-size: 1.2em; user-select: none"
                class="q-pa-md q-mb-md full-width"
              >
                <div class="row items-center full-width">
                  <div>
                    {{ resultTotals.hits }} stories,
                    {{ resultTotals.points }} points
                  </div>
                  <q-space />
                  <div>
                    <TaskSortDropdown
                      :sortType="sortType"
                      :sortTypes="sortTypes"
                      :inverseSort="inverseSort"
                      @setSortType="setSortType"
                    />
                  </div>
                </div>
              </q-badge>
              <q-badge
                v-else
                color="primary"
                style="font-size: 1.2em; user-select: none"
                class="q-pa-md q-mb-md full-width"
              >
                <div class="row items-center full-width">
                  <div>No results found.</div>
                </div>
              </q-badge>
            </div>
          </transition>
          <div v-if="isLoadingActivity" class="full-width">
            <q-spinner size="lg" style="margin: 0 auto" />
          </div>
          <div
            v-for="story in storyResults"
            :key="`${story.id}-${listRenderKey}`"
            class="bordered q-mb-xs"
          >
            <q-item clickable class="q-pa-sm">
              <StoryCard :storyId="story.id" allow-add-tasks />
            </q-item>
          </div>
        </div>
      </q-scroll-area>
    </template>
  </SimpleLayout>
</template>

<script>
import { getPivotalEndpoint } from "../mixins/Pivotal";
import { pivotalData } from "src/constants";
import {
  intSort,
  dateSort,
  stringSort,
  localStorageNames,
  getFromLocalStorage,
} from "src/utils.js";
import TaskSortDropdown from "components/TaskSortDropdown";
import SimpleLayout from "./SimpleLayout";
import StoryCard from "src/components/StoryCard";

export default {
  name: "MyTickets",
  components: {
    TaskSortDropdown,
    StoryCard,
    SimpleLayout,
  },
  props: {
    cachedTickets: {
      type: Array,
      default: null,
    },
  },
  data() {
    const savedQueryParams =
      getFromLocalStorage(localStorageNames.ticketQueryParams) || {};

    return {
      isLoadingActivity: false,
      isGitStatusDropdownOpen: false,
      results: this.cachedTickets || [],
      projectId: getFromLocalStorage(localStorageNames.pivotalProjectId),
      modulesToFetch: [
        "aluminate-vue",
        "aluminate-api",
        "core-api",
        "localhost",
      ],
      params: {},
      queryParamMultiples: {
        epic: true,
      },
      queryParamMasks: {
        created: "##/##/20##",
      },
      queryParamOptions: {
        epic: [
          "dev (spec)",
          "dev (ready)",
          "dev (active)",
          "dev (pr + docs)",
          "dev (pr complete)",
          "qa (ready)",
          "qa (active)",
          "dev (rehab)",
          "dev (qa pass)",
          "dev (qa fail)",
          "dev (merge)",
          "cst (live actions)",
          "priorities (internal)",
        ],
        has: ["attachment"],
        state: ["unstarted", "started"],
      },
      areAllSelected: {},
      queryParamNegations: {},
      queryParams: {
        // this should be filled from endpoint queryParams
        text: "",
        owner: "AF",
        // requester: null,
        epic: ["dev (active)", "dev (pr + docs)"],
        includedone: false,
        ...(savedQueryParams && { ...savedQueryParams }),
      },
      queryParamToAdd: null,
      resultTotals: {},
      resultsRenderIndex: 0,
      sortType: undefined,
      inverseSort: false,
      sortTypes: ["created", "name", "updated", "points"],
      sortingResults: false,
      listRenderKey: 0,
      storyResults: [],
    };
  },
  computed: {
    queryParamNames() {
      return Object.keys(this.queryParams);
    },
  },
  async mounted() {
    if (!this.cachedTickets) {
      await this.getTickets();
    } else {
      this.storyResults = this.cachedTickets;
      this.resultTotals.hits = this.cachedTickets.length;
      this.resultTotals.points = this.cachedTickets.reduce(
        (acc, t) => acc + t.estimate,
        0
      );
    }
  },
  watch: {
    sortType() {
      this.sortResults();
    },
  },
  methods: {
    setSortType(type) {
      if (type === this.sortType) {
        // invert it
        this.inverseSort = !this.inverseSort;
      } else {
        this.sortType = type;
      }

      this.sortResults(this.results);
    },
    sortResults(results) {
      if (!results || !results.length) {
        return [];
      }

      if (this.sortType === "created") {
        dateSort(this.results, "created_at", this.inverseSort);
      }

      if (this.sortType === "name") {
        stringSort(this.results, "name", this.inverseSort);
      }

      if (this.sortType === "updated") {
        dateSort(this.results, "updated_at", this.inverseSort);
      }

      if (this.sortType === "points") {
        intSort(this.results, "estimate", this.inverseSort);
      }

      this.$set(this, "storyResults", this.results);
    },
    saveParams(params) {
      localStorage.setItem(
        localStorageNames.ticketQueryParams,
        JSON.stringify(params)
      );
    },
    async getTickets() {
      this.isLoadingActivity = true;

      const { path: uri, queryParams: queryParamInfo } =
        pivotalData.endpoints.search.all;
      let queryParams;

      if (queryParamInfo) {
        queryParams = {};

        Object.keys(queryParamInfo).forEach((paramName) => {
          if (this.queryParams[paramName]) {
            queryParams[paramName] = this.queryParams[paramName];
          }
        });

        this.saveParams(queryParams);
      }

      this.resultTotals = {};

      const res = await getPivotalEndpoint(uri, {}, queryParams);

      this.isLoadingActivity = false;

      if (res && res.stories && res.stories.stories) {
        this.results = res.stories.stories;
        this.resultTotals = {
          hits: res.stories.total_hits,
          points: res.stories.total_points,
          completedPoints: res.stories.total_points_completed,
        };
        this.sortResults(this.results);
      } else {
        console.warn("Results are in an unexpected format!");
      }

      this.resultsRenderIndex += 1;

      try {
        this.$emit("updatedTickets", res.stories.stories);
      } catch (e) {
        //
      }

      return res;
    },
    toggleSelectAll(param, containing) {
      if (this.queryParamOptions[param]) {
        if (containing) {
          this.queryParams[param] = [
            ...this.queryParamOptions[param].filter((opt) =>
              opt.includes(containing)
            ),
          ];
        } else {
          this.queryParams[param] = [...this.queryParamOptions[param]];
        }
      }
    },
  },
};
</script>
