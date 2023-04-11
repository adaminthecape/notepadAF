<template>
  <SimpleLayout header>
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
    <template #page-content>
      <q-scroll-area style="height: calc(100vh - 120px)">
        <div>
          <q-expansion-item
              label="Options"
              class="q-mb-md bordered"
              defaultOpened
          >
            <q-item
                v-for="param in queryParamNames"
                :key="`param-${param}`"
                clickable
            >
              <q-item-section caption>
                <div class="row">
                  <h5>
                    {{ param }}
                  </h5>
                </div>
              </q-item-section>
              <q-item-section>
                <q-select
                    v-if="queryParamOptions[param]"
                    v-model="queryParams[param]"
                    :options="queryParamOptions[param]"
                    class="q-pa-sm"
                    stack-label
                    clearable
                    filled
                    :multiple="queryParamMultiples[param] || false"
                />
                <q-input
                    v-else
                    v-model="queryParams[param]"
                    class="q-pa-sm"
                    bottom-slots
                    stack-label
                    clearable
                    filled
                    :mask="queryParamMasks[param] || undefined"
                />
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
          <transition name="fade" appear>
            <q-badge
                v-if="resultTotals && resultTotals.hits"
                color="primary"
                style="font-size: 1.2em; user-select: none"
                class="q-pa-md q-mb-md full-width"
            >
              {{ resultTotals.hits }} stories, {{ resultTotals.points }} points
            </q-badge>
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
              v-else
              v-for="story in storyResults"
              :key="story.id"
              class="bordered q-mb-xs"
          >
            <q-item clickable class="q-pa-sm">
              <StoryCard
                  :storyId="story.id"
              />
            </q-item>
          </div>
        </div>
      </q-scroll-area>
    </template>
  </SimpleLayout>
</template>

<script>
import Pivotal from '../mixins/Pivotal';
import DbMixin from '../mixins/jsondb';
import GitMixin from '../mixins/git';
import { pivotalData } from '../mixins/constants';
import DisplayStory from './DisplayStory';
import SimpleLayout from './SimpleLayout';
import PivotalAction from './PivotalAction';
import escape from 'lodash/escape';
import StoryCard from "components/StoryCard";

export default {
  name: 'MyTickets',
  components: {
    StoryCard,
    // DisplayStory,
    // PivotalAction,
    SimpleLayout
  },
  mixins: [Pivotal, GitMixin, DbMixin],
  props: {
    cachedTickets: {
      type: Array,
      default: null
    }
  },
  data()
  {
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
            'qa (ready)',
            'qa (pass)',
            'qa (active)',
            'dev (merge)',
            'cst (live actions)'
        ],
        has: [
            'attachment'
        ],
        state: [
            'unstarted',
            'started'
        ]
      },
      queryParamNegations: {},
      queryParams: {
        // this should be filled from endpoint queryParams
        owner: 'AF',
        requester: null,
        epic: ['dev (active)', 'dev (pr + docs)']
      },
      queryParamToAdd: null,
      resultTotals: {}
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
    this.$log('mounted', 'MyActivity');

    if(!this.cachedTickets)
    {
      await this.getTickets();
    }
  },
  methods: {
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
      this.$log('getTickets');
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
      }

      this.resultTotals = {};

      const res = await this.getPivotalEndpoint(uri, {}, queryParams);

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

      try
      {
        this.$emit('updatedTickets', res.stories.stories);
      }
      catch(e)
      {
        //
      }

      return res;
    }
  }
};
</script>