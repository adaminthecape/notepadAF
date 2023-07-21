<template>
  <div>
    <q-card>
      <q-item>
        <h5 class="q-mb-sm q-mt-md">
          Choose a backup
        </h5>
      </q-item>
      <q-item>
        <div class="col full-width q-mb-xs">
          <q-select
              v-model="chosenBackup"
              :options="recentBackupsOptions"
              filled
              new-value-mode="add"
          />
          <q-input
              v-model="chosenBackupAlt"
              placeholder="Enter custom path ..."
              filled
              class="q-mt-sm"
          />
          <div class="row items-center q-mt-sm">
            <q-btn
                v-if="chosenBackup || chosenBackupAlt"
                label="Load"
                @click.stop.prevent="loadChosenBackup"
            />
            <q-space />
            <div>Or&nbsp;</div>
            <q-btn
                label="Choose file"
                @click.stop.prevent="openFileHandler"
            />
          </div>
        </div>
      </q-item>
      <div v-if="parsedBackupData">
        <q-separator />
        <q-item>
          <h5 class="q-mb-sm q-mt-md">
            Backup data to load
          </h5>
        </q-item>
        <q-item>
          <div class="col">
            <div class="full-width q-mb-xs">
              <q-input
                  v-model="parsedBackupData"
                  type="textarea"
                  readonly
                  filled
              />
            </div>
            <div class="full-width q-mb-xs row items-center">
              <q-space />
              <div v-if="importStatus" class="q-mr-md">
                {{ importStatus }}
              </div>
              <q-btn
                  label="Import"
                  @click="reallyLoadChosenBackup"
              />
            </div>
          </div>
        </q-item>
      </div>
      <q-separator />
      <q-item>
        <h5 class="q-mb-sm q-mt-md">
          Create a new backup
        </h5>
      </q-item>
      <q-item>
        <div class="full-width q-mb-xs">
          <q-input
              v-model="newBackupPath"
              type="text"
              placeholder="Enter backup path ..."
              filled
          >
            <template #append>
              <q-btn
                  v-if="newBackupPath"
                  label="Save"
                  @click.stop.prevent="saveNewBackup"
              />
              <q-btn
                  v-else
                  label="Suggest"
                  @click.stop.prevent="suggestBackupPath"
              />
            </template>
          </q-input>
        </div>
      </q-item>
    </q-card>
  </div>
</template>

<script>
import {
  getAppBasePath,
  getFromLocalStorage,
  saveToLocalStorageArray
} from "src/utils.js";
import {
  readFromExternalBackup,
  restoreFromExternalBackup,
  saveToExternalBackup
} from "src/backups.js";
import * as path from 'path';

export default {
  components: {
  },
  props: {
  },
  data()
  {
    return {
      recentBackups: getFromLocalStorage('external_backups'),
      chosenBackup: null,
      chosenBackupAlt: null,
      newBackupPath: null,
      parsedBackupData: null,
      importStatus: null
    };
  },
  computed: {
    recentBackupsOptions()
    {
      return (this.recentBackups || []).filter((x) => x).map((backup) => ({
        label: typeof backup === 'string' ? backup : this.dirFileExtToString(backup),
        value: typeof backup === 'string' ? this.stringToDirFileExt(backup) : backup
      }));
    },
    currentSource()
    {
      return {
        dir: getAppBasePath(),
        file: 'notesdb',
        ext: 'json'
      };
    }
  },
  methods: {
    openFileHandler()
    {
      // const { dialog } = require('electron').remote;
      //
      // dialog.showOpenDialog({
      //   properties: ['openFile'/*, 'multiSelections'*/]
      // }).then(function (files)
      // {
      //   if(typeof files !== 'undefined')
      //   {
      //     console.log('files picked:', files);
      //   }
      // });
    },
    saveNewBackup()
    {
      saveToExternalBackup(
          this.currentSource,
          this.stringToDirFileExt(this.newBackupPath)
      );
    },
    dirFileExtToString(dirFileExt)
    {
      return path.join(dirFileExt.dir, `${dirFileExt.file}.${dirFileExt.ext}`);
    },
    stringToDirFileExt(str)
    {
      const parts = str.split('\\');
      const [file, ext] = parts.pop().split('.');
      const dir = parts.join('\\');

      return { dir, file, ext };
    },
    loadChosenBackup()
    {
      this.importStatus = null;

      if((!this.chosenBackup || !this.chosenBackup.value) && !this.chosenBackupAlt)
      {
        return;
      }

      if(this.chosenBackupAlt)
      {
        this.chosenBackupAlt = this.chosenBackupAlt.replace(/\//g, '\\');

        const parts = this.chosenBackupAlt.split('\\');

        const [file, ext] = parts.pop().split('.');
        const dir = parts.join('\\');

        this.chosenBackup = { value: { dir, file, ext }, label: this.chosenBackupAlt };
      }

      const backupData = readFromExternalBackup(
          this.chosenBackup.value
      );

      this.parsedBackupData = null;

      if(backupData)
      {
        if(typeof backupData !== 'object')
        {
          this.parsedBackupData = backupData;
        }
        else
        {
          try
          {
            this.parsedBackupData = JSON.stringify(backupData);
          }
          catch(e)
          {
            console.warn(e);
          }
        }

        saveToLocalStorageArray(
            'external_backups',
            this.dirFileExtToString(this.chosenBackup.value)
        );
      }
    },
    reallyLoadChosenBackup()
    {
      this.importStatus = 'Starting import ...';

      if(!this.parsedBackupData || !this.currentSource)
      {
        this.importStatus = 'Nothing to import.';

        return;
      }

      // overwrite the existing notes db with the backup
      restoreFromExternalBackup(
          this.currentSource,
          this.chosenBackup.value
      );

      this.$emit('imported');
      this.importStatus = `Successfully imported ${this.dirFileExtToString(this.chosenBackup.value)}`;
    },
    suggestBackupPath()
    {
      const date = new Date();

      this.newBackupPath = `${
        getAppBasePath().split(':')[0]
      }:\\notepadAF_backups\\notes backup ${
        date.toDateString()
      } ${
        date.toLocaleTimeString().replace(/:/g, '-')
      }.json`;
    }
  }
};
</script>