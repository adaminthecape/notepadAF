<template>
  <SimpleLayout>
    <template #header-left>
      <q-icon name="menu" size="sm" />
    </template>
    <template #header-title>
      Git History
    </template>
    <template #page-header>
      <div class="row items-center">
        <div class="col q-my-xs">
          <q-input
              v-model="branchToGetHistoryFor"
              label="Directory"
              placeholder="C:/..."
              type="text"
              class="q-mb-sm"
              outlined
              dense
          />
          <q-space />
          <q-select
              v-model="historyLimit"
              label="Limit"
              :options="[10, 20, 50, 100, 150, 200, 500, 1000]"
              class="q-mb-sm"
              outlined
              dense
              @input="getHistory"
          />
        </div>
      </div>
      <div>
        <div v-if="historyFailure" class="row items-center q-pa-sm bordered">
          <q-icon name="warning" size="md" color="orange" />
          <div class="q-ml-sm">
            {{ historyStatus }}
          </div>
        </div>
        <div v-else-if="historyStatus" class="row items-center q-pa-sm bordered">
          <q-spinner size="md" />
          <div class="q-ml-sm">
            {{ historyStatus }} ...
          </div>
        </div>
        <div v-else-if="!history || !history.length" class="row items-center q-pa-sm bordered">
          No history to show.
        </div>
        <q-space />
        <q-btn
            label="Go"
            @click="getHistory"
        />
        <q-btn
            label="Stats"
            class="q-ml-sm"
            :loading="isLoadingStatistics"
            @click="runStatsReport"
        />
        <q-btn
            :label="isShowingResults ? 'Hide results' : 'Show results'"
            class="q-ml-sm"
            @click="isShowingResults = !isShowingResults"
        />
      </div>
      <div v-if="gitStatusLatest">
        <pre>{{ gitStatusLatest }}</pre>
      </div>
      <q-separator class="q-my-sm" />
    </template>
    <template #page-content>
      <div v-if="!isShowingResults && historyStatisticsArray.length">
        <q-select
            v-model="statisticsSortType"
            :options="statisticsSortTypeOptions"
            label="Sort type"
        />
        <div
            v-for="(stat, a) in historyStatisticsArray"
            :key="`statItem-${a}`"
        >
          <q-card dark class="q-mb-xs">
            <q-item>
              <q-item-section>
                <div>
                  <h6 class="q-my-sm">
                    {{ stat.author }}
                  </h6>
                  <div>
                    <q-icon name="task" />&nbsp;
                    <span>{{ stat.uniqueFiles }} unique files changed</span>
                    <span>&nbsp;&nbsp;</span>
                    <q-icon name="published_with_changes" />&nbsp;
                    <span>{{ stat.filesChanged }} total</span>
                  </div>
                  <span>
                    <q-icon name="add_circle" />&nbsp;
                    <span>{{ stat.insertions }} insertions</span>
                  </span>
                  <span>&nbsp;&nbsp;</span>
                  <span>
                    <q-icon name="remove_circle" />&nbsp;
                    <span>{{ stat.deletions }} deletions</span>
                  </span>
                  <span>&nbsp;&nbsp;</span>
                  <span>
                    <q-icon name="menu" />&nbsp;
                    <span>{{ stat.insertionDeletionDiff }} diff</span>
                  </span>
                  <br />
                  <div class="row items-center">
                    <q-icon name="history" />&nbsp;
                    <span>{{ new Date(stat.earliestDate).toDateString() }} - {{ new Date(stat.latestDate).toDateString() }}</span>
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-card>
        </div>
      </div>
      <div v-else>
        <div
          v-for="(historyItem, h) in history"
          :key="`historyItem-${h}`"
        >
        <q-card class="q-mb-xs" dark>
          <q-item>
            <q-item-section>
              <q-input
                  label="Commit"
                  :value="historyItem.commit"
                  class="q-mb-xs"
                  disable
                  filled
                  dense
                  dark
              />
              <q-input
                  label="Author"
                  :value="historyItem.author"
                  class="q-mb-xs"
                  disable
                  filled
                  dense
                  dark
              />
              <q-input
                  label="Date"
                  :value="historyItem.date"
                  class="q-mb-xs"
                  disable
                  filled
                  dense
                  dark
              />
              <q-input
                  label="Message"
                  :value="historyItem.message"
                  class="q-mb-xs"
                  disable
                  filled
                  dense
                  dark
              />
              <div v-if="historyItem.changes" class="row items-center text-bold">
                <q-chip
                    v-if="historyItem.changes.filesChanged"
                    class="q-mb-xs"
                    color="secondary"
                    disable
                    filled
                    dense
                    dark
                >
                  <q-icon name="task" />
                  {{ historyItem.changes.filesChanged }}
                </q-chip>
                <q-chip
                    v-if="historyItem.changes.insertions"
                    class="q-mb-xs"
                    color="positive"
                    disable
                    filled
                    dense
                    dark
                >
                  +
                  {{ historyItem.changes.insertions }}
                </q-chip>
                <q-chip
                    v-if="historyItem.changes.deletions"
                    class="q-mb-xs"
                    color="negative"
                    disable
                    filled
                    dense
                    dark
                >
                  -
                  {{ historyItem.changes.deletions }}
                </q-chip>
              </div>
            </q-item-section>
          </q-item>
        </q-card>
      </div>
      </div>
    </template>
  </SimpleLayout>
</template>

<script>
import GitlabMixin from '../mixins/gitlab';
import GitMixin from '../mixins/git';
import SimpleLayout from "components/SimpleLayout";
import { saveToLocalStorage, getFromLocalStorage } from "src/utils";

export default {
  name: 'WikiEditor',
  components: {
    SimpleLayout
  },
  mixins: [GitlabMixin, GitMixin],
  inject: ['$openLink'],
  data()
  {
    return {
      history: [],
      branchToGetHistoryFor: getFromLocalStorage('git_history_branch'),
      historyLimit: 100,
      historyStatus: null,
      historyFailure: null,
      lastGitUpdate: {},
      historyStatistics: {},
      isLoadingStatistics: false,
      isShowingResults: true,
      gitStatusLatest: null,
      statisticsSortType: null,
      statisticsSortTypeOptions: [
        { label: 'Files changed', value: 'filesChanged' },
        { label: 'Files changed (unique)', value: 'uniqueFiles' },
        { label: 'Lines added', value: 'insertions' },
        { label: 'Lines removed', value: 'deletions' },
        { label: 'Lines added - removed', value: 'insertionDeletionDiff' }
      ]
    };
  },
  computed: {
    historyStatisticsArray()
    {
      if(!this.historyStatistics)
      {
        return [];
      }

      let stats = Object.keys(this.historyStatistics).reduce((agg, key) =>
      {
        agg.push({
          ...this.historyStatistics[key],
          author: key
        })

        return agg;
      }, []);

      if(this.statisticsSortType)
      {
        stats = stats.sort((a, b) =>
        {
          return b[this.statisticsSortType.value] - a[this.statisticsSortType.value];
        });
      }

      return stats;
    }
  },
  methods: {
    updateStatusLog(data)
    {
      if(typeof data !== 'string')
      {
        return null;
      }

      return data
          .split('\n\ncommit')
          .slice(0, this.historyLimit)
          .map((item) =>
          {
            return item.split('\n').reduce((agg, i, index) =>
            {
              if(!i)
              {
                return agg;
              }
              else if(i.startsWith('Author: '))
              {
                agg.author = i.replace('Author: ', '');
              }
              else if(i.startsWith('Date:   '))
              {
                agg.date = i.replace('Date:   ', '');
              }
              else if(i.startsWith('commit ') || index === 0)
              {
                agg.commit = i.replace('commit', '').slice(1);
              }
              else if(i.startsWith('    '))
              {
                agg.message = i.slice(4);
              }
              else if(i.includes('file changed') || i.includes('files changed'))
              {
                let [filesChanged, insertions, deletions] = i.split(',');

                const getNum = (n) =>
                {
                  if(n)
                  {
                    return parseInt(n.split(' ').find((y) => parseInt(y, 10).toString() === y), 10);
                  }

                  return n;
                }

                filesChanged = getNum(filesChanged);
                insertions = getNum(insertions);
                deletions = getNum(deletions);

                agg.changes = { filesChanged, insertions, deletions };
              }
              else
              {
                agg.other = `${agg.other || ''}\n${i}`;

                if(i.indexOf(' src/') === 0 || i.indexOf(' | ') > -1)
                {
                  if(!agg.filenames)
                  {
                    agg.filenames = [];
                  }

                  const [filenameToAdd] = i.slice(1).split(' ');

                  if(!agg.filenames.includes(filenameToAdd))
                  {
                    agg.filenames.push(filenameToAdd);
                  }
                }
              }

              return agg;
            }, {});
          });
    },
    getHistory()
    {
      this.historyFailure = false;

      if(!this.branchToGetHistoryFor)
      {
        this.historyStatus = 'You must enter a directory first!';
        this.historyFailure = true;

        return;
      }

      saveToLocalStorage('git_history_branch', this.branchToGetHistoryFor);

      this.historyStatus = 'Loading latest updates';

      const getBranchCode = (module) =>
      {
        switch(module)
        {
          case 'vue':
            return 'aluminate-vue.wiki';
          case 'api':
            return 'aluminate-api.wiki';
          case 'core':
            return 'core-api.wiki';
          case 'framework':
            return 'framework.wiki';
          default:
            return null;
        }
      };

      const branch = this.branchToGetHistoryFor.replace(/\//g, '\\');

      this.fetchGitStatus(branch);

      if(!branch)
      {
        return;
      }

      const dirCommand = `cd ${branch}`;
      const initialCommand = `${dirCommand} && git pull`;
      const command = `${dirCommand} && git log -${this.historyLimit} --stat`;
      const statusCommand = `${dirCommand} && git status`;

      console.warn(command);

      const checkStatus = () =>
      {
        this.runCmd(statusCommand, (data) =>
        {
          console.warn('STATUS:', statusCommand);
          console.log(data);
        });
      }

      const updateHistory = () =>
      {
        this.historyStatus = 'Fetching logs';

        this.runCmd(
            command,
            (data) =>
            {
              this.historyStatus = 'Updating logs';

              this.history = this.updateStatusLog(data);

              this.runStatsReport();

              setTimeout(() =>
              {
                this.historyStatus = null;
              }, 250)
            },
            (err) =>
            {
              this.historyStatus = 'Failed to fetch logs';
              this.historyFailure = true;

              console.error(err);
              checkStatus();
            }
        );
      }

      const timeSinceUpdate = this.lastGitUpdate[this.branchToGetHistoryFor] ?
          this.lastGitUpdate[this.branchToGetHistoryFor] - Date.now() :
          null;

      if(timeSinceUpdate && timeSinceUpdate < 60000)
      {
        this.runCmd(
            initialCommand,
            (initialData) =>
            {
              updateHistory(initialData);

              this.lastGitUpdate[this.branchToGetHistoryFor] = Date.now();
            },
            (err) =>
            {
              this.historyStatus = 'Failed to load updates';
              this.historyFailure = true;

              console.error(err);
              checkStatus();
            }
        )
      }
      else
      {
        updateHistory();
      }
    },
    fetchGitStatus(dir)
    {
      this.runCmd(
          `cd ${dir} && git status`,
          (data) =>
          {
            this.gitStatusLatest = data;
          },
          (err) =>
          {
            this.gitStatusLatest = `ERROR:\n\n${err}`;
          }
      );
    },
    runStatsReport()
    {
      if(!this.history || !this.history.length)
      {
        return;
      }

      this.isLoadingStatistics = true;

      this.fetchGitStatus(this.branchToGetHistoryFor);

      this.historyStatistics = {};

      this.history.forEach((item) =>
      {
        if(!item.changes)
        {
          return;
        }

        if(!this.historyStatistics[item.author])
        {
          this.historyStatistics[item.author] = {
            filesChanged: 0,
            insertions: 0,
            deletions: 0,
            uniqueFiles: 0
          };
        }

        if(item.date)
        {
          this.historyStatistics[item.author].earliestDate = Math.min(
              new Date(item.date).getTime(),
              this.historyStatistics[item.author].earliestDate || Infinity
          );

          this.historyStatistics[item.author].latestDate = Math.max(
              new Date(item.date).getTime(),
              this.historyStatistics[item.author].latestDate || 0
          );
        }

        ['filesChanged', 'insertions', 'deletions'].forEach((key) =>
        {
          if(item.changes[key])
          {
            this.historyStatistics[item.author][key] += item.changes[key];
          }
        });

        if(this.historyStatistics[item.author].insertions)
        {
          this.historyStatistics[item.author].insertionDeletionDiff = this.historyStatistics[item.author].insertions - (
              this.historyStatistics[item.author].deletions || 0
          );
        }

        if(item.filenames && item.filenames.length)
        {
          if(!this.historyStatistics[item.author].filenames)
          {
            this.historyStatistics[item.author].filenames = [];
          }

          item.filenames.forEach((fn) =>
          {
            if(!this.historyStatistics[item.author].filenames.includes(fn))
            {
              this.historyStatistics[item.author].filenames.push(fn);
            }
          });

          this.historyStatistics[item.author].uniqueFiles = this.historyStatistics[item.author].filenames.length;
        }
      });

      this.isLoadingStatistics = false;
    }
  }
};
</script>
