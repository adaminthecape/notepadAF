<template>
  <SimpleLayout
      :page-offset="100"
      :page-classes="['q-mx-sm']"
      header
  >
    <template #header-left>
      <!-- controls menu activator goes here -->
    </template>
    <template #header-title>
      Tickets
    </template>
    <template #header-right>
      <q-btn-dropdown
          label="Options"
          class="q-mr-sm"
      >
      </q-btn-dropdown>
      <q-btn-dropdown
          v-model="isGitStatusDropdownOpen"
          label="Git status"
          :loading="isLoadingGitStatus"
          class="q-mr-sm"
          @click="isGitStatusDropdownOpen ? undefined : getGitStatusForAllModules()"
      >
        <q-list>
          <q-item
              clickable
              @click="checkoutBoth('master')"
          >
            <q-item-section>
              Checkout to master
            </q-item-section>
          </q-item>
          <div
              v-for="module in modulesToFetch"
              :key="`status-${module}-${gitRenderKey}`"
          >
            <q-item
                v-if="gitStatus[module]"
                clickable
            >
              <q-item-section side>
                {{ module }}
              </q-item-section>
              <q-item-section caption>
                <div class="row items-center">
                  {{ gitStatus[module].branch }}
                  <q-icon
                      v-if="gitStatus[module].safeToChange"
                      color="positive"
                      icon="check_circle"
                  />
                </div>
              </q-item-section>
            </q-item>
          </div>
        </q-list>
      </q-btn-dropdown>
      <q-btn
          icon="refresh"
          dense
          @click="getTickets"
      />
    </template>
    <template #page-header>
      <q-expansion-item
          label="Options"
          class="q-my-sm bordered"
          defaultOpened
      >
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
        <!--            <q-input-->
        <!--                v-model="queryParamToAdd"-->
        <!--                class="q-pa-sm"-->
        <!--                label="Custom parameter"-->
        <!--                bottom-slots-->
        <!--                stack-label-->
        <!--                clearable-->
        <!--                filled-->
        <!--            >-->
        <!--              <template #append>-->
        <!--                <q-btn-->
        <!--                    icon="add"-->
        <!--                    @click="addQueryParam"-->
        <!--                />-->
        <!--              </template>-->
        <!--            </q-input>-->
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
                    {{ resultTotals.hits }} stories, {{ resultTotals.points }} points
                  </div>
                  <q-space />
                  <div>
                    <q-select
                        v-model="sortType"
                        :options="sortTypes"
                        label="Sort by:"
                        :loading="sortingResults"
                        clearable
                        emitValue
                        outlined
                        dense
                        dark
                    >
                      <template #default>
                        Sort...
                      </template>
                    </q-select>
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
                  <div>
                    No results found.
                  </div>
                </div>
              </q-badge>
            </div>
          </transition>
          <div
              v-if="isLoadingActivity"
              class="full-width"
          >
            <q-spinner
                size="lg"
                style="margin: 0 auto"
            />
          </div>
          <div
              v-for="story in storyResults"
              :key="story.id"
              class="bordered q-mb-xs"
          >
            <q-item clickable class="q-pa-sm">
              <StoryCard
                  :storyId="story.id"
                  allow-add-tasks
              />
            </q-item>
          </div>
        </div>
      </q-scroll-area>
    </template>
  </SimpleLayout>
</template>

<script>
import { getPivotalEndpoint } from "../mixins/Pivotal";
import GitMixin from '../mixins/git';
import { pivotalData } from '../mixins/constants';
import SimpleLayout from './SimpleLayout';
import StoryCard from "components/StoryCard";

export default {
  name: 'MyTickets',
  components: {
    StoryCard,
    SimpleLayout
  },
  mixins: [GitMixin],
  props: {
    cachedTickets: {
      type: Array,
      default: null
    }
  },
  data()
  {
    const savedQueryParams = localStorage.getItem('ticketQueryParams') ?
        JSON.parse(localStorage.getItem('ticketQueryParams')) :
        null;

    return {
      isLoadingActivity: false,
      isGitStatusDropdownOpen: false,
      results: this.cachedTickets || [],
      projectId: localStorage.getItem('pivotalProjectId'),
      modulesToFetch: [
        'aluminate-vue',
        'aluminate-api',
        'core-api',
        'localhost'
      ],
      params: {},
      queryParamMultiples: {
        epic: true
      },
      queryParamMasks: {
        created: '##/##/20##'
      },
      queryParamOptions: {
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
            'priorities (internal)'
        ],
        has: [
            'attachment'
        ],
        state: [
            'unstarted',
            'started'
        ]
      },
      areAllSelected: {},
      queryParamNegations: {},
      queryParams: {
        // this should be filled from endpoint queryParams
        text: '',
        owner: 'AF',
        // requester: null,
        epic: ['dev (active)', 'dev (pr + docs)'],
        includedone: false,
        ...(savedQueryParams && { ...savedQueryParams })
      },
      queryParamToAdd: null,
      resultTotals: {},
      resultsRenderIndex: 0,
      sortType: null,
      sortTypes: ['notes', 'epic'],
      sortingResults: false
    };
  },
  computed: {
    resultTotalsKeys()
    {
      return Object.keys(this.resultTotals);
    },
    queryParamNames()
    {
      return Object.keys(this.queryParams);
    },
    storyResults()
    {
      return this.results || [];
    },
    actionsToShow()
    {
      return (this.results || []).reduce((agg, action) =>
      {
        const { guid } = action;

        if(!agg[guid])
        {
          agg[guid] = {};
        }

        const [date, time] = new Date(action.occurred_at).toISOString().split('T');

        agg[guid].stories = [];
        agg[guid].guid = action.guid;
        agg[guid].message = action.message;
        agg[guid].date = date;
        agg[guid].time = time.split('.')[0];
        agg[guid].type = action.kind;
        agg[guid].projectId = action.project.id;

        if(action.changes && action.changes.length)
        {
          agg[guid].changes = action.changes.map((change) => (
              `${change.change_type} ${change.kind} to "${change.name}"`
          ));
        }

        if(action.primary_resources)
        {
          agg[guid].storyIds = [];
          agg[guid].resources = [];
          agg[guid].resourceIds = [];

          action.primary_resources.forEach((resource) =>
          {
            agg[guid].resourceIds.push(resource.id);
            agg[guid].resources.push(resource);
          });
        }

        return agg;
      }, {});
    },
    actionsForTemplate()
    {
      return Object.values(this.actionsToShow || {});
    }
  },
  async mounted()
  {
    if(!this.cachedTickets)
    {
      await this.getTickets();
    }
  },
  watch: {
    sortType()
    {
      this.sortResults();
    }
  },
  methods: {
    sortResults()
    {
      if(!this.results || !this.results.length)
      {
        return;
      }

      this.sortingResults = true;

      let results = [...this.results];

      this.$set(this, 'results', results);

      this.sortingResults = false;
    },
    saveParams(params)
    {
      localStorage.setItem('ticketQueryParams', JSON.stringify(params));
    },
    addQueryParam()
    {
      const param = this.queryParamToAdd;

      if(!param || this.queryParamNames.includes(param))
      {
        return;
      }

      this.queryParams[param] = null;

      this.queryParamToAdd = null;
    },
    padLeft(str, padChar, totalLength)
    {
      str = str.toString();

      while(str.length < totalLength)
      {
        str = `${padChar}${str}`;
      }

      return str;
    },
    async getTickets()
    {
      this.isLoadingActivity = true;

      const { path: uri, queryParams: queryParamInfo } = pivotalData.endpoints.search.all;
      let queryParams;

      if(queryParamInfo)
      {
        queryParams = {};

        Object.keys(queryParamInfo).forEach((paramName) =>
        {
          if(this.queryParams[paramName])
          {
            queryParams[paramName] = this.queryParams[paramName];
          }
        });

        this.saveParams(queryParams);
      }

      this.resultTotals = {};

      const res = await getPivotalEndpoint(uri, {}, queryParams);

      this.isLoadingActivity = false;

      if(res && res.stories && res.stories.stories)
      {
        this.results = res.stories.stories;
        this.resultTotals = {
          hits: res.stories.total_hits,
          points: res.stories.total_points,
          completedPoints: res.stories.total_points_completed
        };
      }
      else
      {
        console.warn('Results are in an unexpected format!');
      }

      this.resultsRenderIndex += 1;

      try
      {
        this.$emit('updatedTickets', res.stories.stories);
      }
      catch(e)
      {
        //
      }

      return res;
    },
    toggleSelectAll(param, containing)
    {
      if(this.queryParamOptions[param])
      {
        if(containing)
        {
          this.queryParams[param] = [
            ...this.queryParamOptions[param]
                .filter((opt) => opt.includes(containing))
          ];
        }
        else
        {
          this.queryParams[param] = [...this.queryParamOptions[param]];
        }
      }
    }
  }
};
</script>