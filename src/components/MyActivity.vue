<template>
  <SimpleLayout header>
    <template #header-left>
<!-- controls menu activator goes here -->
    </template>
    <template #header-title>
      Activity
    </template>
    <template #header-right>
      <q-btn-dropdown
          label="Options"
          class="q-mr-sm"
      >
        <q-card>
          <q-item>
            <q-item-section caption>
              View as
            </q-item-section>
            <q-item-section side>
              <q-btn-toggle
                  v-model="calendarView"
                  dark
                  :options="[
              { label: 'Calendar', value: true },
              { label: 'List', value: false }
            ]"
              />
            </q-item-section>
          </q-item>
<!--          <q-item>-->
<!--            <q-item-section caption>-->
<!--              # days to show-->
<!--            </q-item-section>-->
<!--            <q-item-section side>-->
<!--              <q-input-->
<!--                  v-model="calendarLength"-->
<!--                  type="number"-->
<!--                  filled-->
<!--              />-->
<!--            </q-item-section>-->
<!--          </q-item>-->
          <q-item>
            <q-item-section caption>
              From date
            </q-item-section>
            <q-item-section side>
              <div class="row items-center">
                <q-select
                    v-model="calendarEndDay"
                    :options="days"
                    class="q-mr-xs"
                    filled
                />
                <q-select
                    v-model="calendarEndMonth"
                    :options="months"
                    class="q-mr-xs"
                    filled
                />
                <q-select
                    v-model="calendarEndYear"
                    :options="years"
                    filled
                />
              </div>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section caption>
              To date
            </q-item-section>
            <q-item-section side>
              <div class="row items-center">
                <q-select
                    v-model="calendarStartDay"
                    :options="days"
                    class="q-mr-xs"
                    filled
                />
                <q-select
                    v-model="calendarStartMonth"
                    :options="months"
                    class="q-mr-xs"
                    filled
                />
                <q-select
                    v-model="calendarStartYear"
                    :options="years"
                    filled
                />
              </div>
            </q-item-section>
          </q-item>
<!--          <q-item>-->
<!--            <q-item-section caption>-->
<!--              Query limit-->
<!--            </q-item-section>-->
<!--            <q-item-section side>-->
<!--              <q-input-->
<!--                  v-model="params.limit"-->
<!--                  type="number"-->
<!--                  filled-->
<!--              />-->
<!--            </q-item-section>-->
<!--          </q-item>-->
          <q-item>
            <q-item-section caption>
            </q-item-section>
            <q-item-section side>
              <q-btn
                  label="Search"
                  color="primary"
                  @click="getActivity"
              />
            </q-item-section>
          </q-item>
        </q-card>
      </q-btn-dropdown>
      <q-btn-dropdown
          v-model="isGitStatusDropdownOpen"
          label="Git status"
          :loading="isLoadingGitStatus"
          class="q-mr-sm"
          @click="isGitStatusDropdownOpen ? {} : getGitStatusForAllModules()"
      >
        <q-list>
<!--          <q-item-->
<!--              clickable-->
<!--              @click="getGitStatusForAllModules"-->
<!--          >-->
<!--            <q-item-section>-->
<!--              Refresh status-->
<!--            </q-item-section>-->
<!--          </q-item>-->
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
          @click="getActivity"
      />
<!--      todo: epic selector (multi)-->
    </template>
    <template #page-content>
      <q-scroll-area style="height: calc(100vh - 120px)">
        <div>
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
              v-else-if="calendarView"
              v-for="day in calendarDaysToShow"
              :key="`day-${day.year}-${day.month}-${day.day}`"
              class="q-mb-xs"
              :style="`max-width: ${$q.screen.width} !important; border-bottom: 1px solid #aaa`"
          >
            <q-expansion-item :value="false" dense>
              <template #header>
                <div class="row items-center full-width">
                  <h5 class="q-my-sm">
                    {{ day.text }}
                  </h5>
                  <q-chip
                      v-if="actionsByHourCounts[`${day.year}-${day.month}-${day.day}`]"
                      color="warning"
                  >
                    {{ actionsByHourCounts[`${day.year}-${day.month}-${day.day}`] }}
                  </q-chip>
                </div>
              </template>
              <template>
                <div
                    v-for="hourNum in [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]"
                    :key="`hourNum-${hourNum}`"
                    class="q-mb-xs"
                >
                  <q-expansion-item :value="true" dense>
                    <template #header>
                      <div class="row full-width items-center">
                        <div>
                          {{ hourNum }}:00
                        </div>
                        <q-chip
                            v-if="actionsByHourCounts[`${day.year}-${day.month}-${day.day}#${hourNum}`]"
                            color="warning"
                        >
                          {{ actionsByHourCounts[`${day.year}-${day.month}-${day.day}#${hourNum}`] }}
                        </q-chip>
                      </div>
                    </template>
                    <template>
                      <div
                          v-if="actionsByHourCounts[`${day.year}-${day.month}-${day.day}#${hourNum}`]"
                      >
                        <div
                            v-for="action in actionsByHour[`${day.year}`][`${day.month}`][`${day.day}`][`${hourNum}`]"
                            :key="action.guid"
                            class="bordered q-mb-xs"
                        >
                          <PivotalAction :action="action" />
                        </div>
                      </div>
                    </template>
                  </q-expansion-item>
                </div>
              </template>
            </q-expansion-item>
          </div>
          <div
              v-else
              v-for="action in actionsForTemplate"
              :key="action.guid"
              class="bordered q-mb-xs"
          >
            <PivotalAction :action="action" />
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

export default {
  components: {
    // DisplayStory,
    SimpleLayout,
    PivotalAction
  },
  mixins: [Pivotal, GitMixin, DbMixin],
  props: {
    cachedActivity: {
      type: Array,
      default: null
    }
  },
  data()
  {
    const today = new Date();

    today.setDate(today.getDate() + 1);

    const aWeekAgo = new Date(new Date().setDate(today.getDate() - 7));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    console.log(today.toISOString(), aWeekAgo.toISOString());

    return {
      days: [...Array(31).keys()],
      months,
      monthOptions: months.map((month, m) => ({
        label: month,
        value: this.padLeft(m, '0', 2)
      })),
      years: [2023, 2022, 2021],
      calendarView: true,
      calendarLength: 14,
      calendarStartDay: today.getDate(),
      calendarStartMonth: months[today.getMonth()],
      calendarStartYear: today.getFullYear(),
      calendarEndDay: aWeekAgo.getDate(),
      calendarEndMonth: months[aWeekAgo.getMonth()],
      calendarEndYear: aWeekAgo.getFullYear(),
      isLoadingActivity: false,
      isGitStatusDropdownOpen: false,
      results: this.cachedActivity || [],
      projectId: localStorage.getItem('pivotalProjectId'),
      modulesToFetch: [
        'aluminate-vue',
        'aluminate-api',
        'core-api',
        'localhost'
      ],
      params: {
        limit: 50,
        offset: null,
        occurred_after: null,
        occurred_before: null
      }
    };
  },
  computed: {
    calendarDaysToShow()
    {
      const end = this.calendarStartDate;
      const len = this.calendarLength;

      return this.daysTo(end, len);
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
    },
    actionsByHourData()
    {
      return this.actionsForTemplate.reduce((agg, action) =>
      {
        if(!(action.date && action.time)) return;

        const [year, month, day] = action.date.split('-');
        let [hour] = action.time.split(':');

        hour = Math.min(20, Math.max(7, hour));

        // if(this.isWeekend(year, month, day))
        // {
        //   return;
        // }

        if(!agg.actions[year]) agg.actions[year] = {};
        if(!agg.actions[year][month]) agg.actions[year][month] = {};
        if(!agg.actions[year][month][day]) agg.actions[year][month][day] = {};
        if(!agg.actions[year][month][day][hour]) agg.actions[year][month][day][hour] = [];

        agg.actions[year][month][day][hour].push(action);

        if(!agg.counts[`${year}-${month}-${day}`])
        {
          agg.counts[`${year}-${month}-${day}`] = 1;
        }
        else
        {
          agg.counts[`${year}-${month}-${day}`] += 1;
        }

        if(!agg.counts[`${year}-${month}-${day}#${hour}`])
        {
          agg.counts[`${year}-${month}-${day}#${hour}`] = 1;
        }
        else
        {
          agg.counts[`${year}-${month}-${day}#${hour}`] += 1;
        }

        return agg;
      }, {
        actions: {},
        counts: {}
      });
    },
    actionsByHourCounts()
    {
      return this.actionsByHourData.counts;
    },
    actionsByHour()
    {
      return this.actionsByHourData.actions;
    },
    lastMonthInActionsByHour()
    {
      const keys = Object.keys(this.actionsByHour[this.currentYear]);

      return keys[keys.length - 1];
    },
    lastDayInActionsByHour()
    {
      const keys = Object.keys(this.actionsByHour[this.currentYear][this.currentMonth]);

      return keys[keys.length - 1];
    },
    currentYear()
    {
      return new Date().getFullYear().toString();
    },
    currentMonth()
    {
      return this.padLeft((new Date().getMonth() + 1).toString(), '0', 2);
    },
    currentDay()
    {
      return this.padLeft((new Date().getDate()).toString(), '0', 2);
    },
    tomorrow()
    {
      return this.padLeft((new Date().getDate() + 1).toString(), '0', 2);
    },
    calendarEndDate()
    {
      return new Date(`${this.calendarEndDay} ${this.calendarEndMonth} ${this.calendarEndYear}`);
    },
    calendarStartDate()
    {
      return new Date(`${this.calendarStartDay} ${this.calendarStartMonth} ${this.calendarStartYear}`);
    }
  },
  async mounted()
  {
    this.$log('mounted', 'MyActivity');

    if(!this.cachedActivity)
    {
      await this.getActivity();
    }
  },
  methods: {
    isWeekend(year, month, day)
    {
      const dt = `${year}/${month}/${day}`;
      const dayNum = new Date(dt).getDay();

      return dayNum === 6 || dayNum === 0;
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
    daysFrom(startDate, len)
    {
      const days = [];

      [...Array(len).keys()].forEach((key) =>
      {
        let add = key + startDate;

        if(add > 31)
        {
          add = add - 31;
        }

        days.push(add);
      });

      return days;
    },
    daysTo(startDate, len)
    {
      console.log(len, startDate.toISOString());
      const dt = new Date(startDate.getTime());
      const res = [];

      let i = 0;

      while(i < len)
      {
        const newDate = new Date(dt.setDate(dt.getDate() - 1));

        res.push({
          day: this.padLeft(newDate.getDate(), '0', 2),
          month: this.padLeft(newDate.getMonth() + 1, '0', 2),
          year: newDate.getFullYear(),
          text: newDate.toDateString()
        });

        i += 1;
      }

      return res;
    },
    async getActivity()
    {
      this.$log('getActivity');
      this.isLoadingActivity = true;

      const uri = pivotalData.endpoints.my.activity.path;

      const params = {};

      if(this.params.limit)
      {
        params.limit = Math.min(this.params.limit, 500);
      }

      if(this.params.offset)
      {
        params.offset = this.params.offset;
      }

      if(this.params.before)
      {
        params.occurred_before = this.params.before;
      }

      if(this.params.after)
      {
        params.occurred_after = this.params.after;
      }

      const after = this.calendarEndDate;
      const before = this.calendarStartDate;

      if(!params.occurred_after)
      {
        params.occurred_after = after.toISOString();
      }

      if(!params.occurred_before)
      {
        params.occurred_before = before.toISOString();
      }

      this.calendarLength = Math.floor(Math.abs(after.getTime() - before.getTime()) / (1000 * 3600 * 24));

      console.log('set length to:', this.calendarLength);
      params.limit = 500;

      const res = await this.getPivotalEndpoint(uri, params);

      this.isLoadingActivity = false;

      this.results = res || [];

      this.$emit('updatedActivity', res);

      return res;
    }
  }
};
</script>