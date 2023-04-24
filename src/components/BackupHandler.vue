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
  readFromExternalBackup,
  restoreFromExternalBackup,
  saveToExternalBackup,
  saveToLocalStorageArray
} from "src/utils";
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
      parsedBackupData: null
    };
  },
  computed: {
    recentBackupsOptions()
    {
      return (this.recentBackups || []).map((backup) => ({
        label: path.join(backup.dir, `${backup.file}.${backup.ext}`),
        value: backup
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
      const { dialog } = require('electron').remote;

      dialog.showOpenDialog({
        properties: ['openFile'/*, 'multiSelections'*/]
      }).then(function (files)
      {
        if(typeof files !== 'undefined')
        {
          console.log('files picked:', files);
        }
      });
    },
    saveNewBackup()
    {
      const ext = this.newBackupPath.split('.').pop();
      const dirParts = this.newBackupPath.split('\\');
      const dir = dirParts.slice(0, dirParts.length - 1).join('\\');
      const [file] = dirParts.pop().split('.');

      saveToExternalBackup(
          this.currentSource,
          { dir, file, ext }
      );
    },
    loadChosenBackup()
    {
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
            `${this.chosenBackup.value.dir}\\${this.chosenBackup.value.file}.${this.chosenBackup.value.ext}`
        );
      }
    },
    reallyLoadChosenBackup()
    {
      if(!this.parsedBackupData || !this.currentSource)
      {
        return;
      }

      // overwrite the existing notes db with the backup
      restoreFromExternalBackup(
          this.currentSource,
          this.chosenBackup.value
      );
    },
    suggestBackupPath()
    {
      const year = new Date().getFullYear();
      const month = new Date().getMonth();
      const day = new Date().getDate();
      const [hour, minute] = new Date().toTimeString().split(':');

      this.newBackupPath = `C:\\notepadAF_backups\\${year}-${month}-${day} ${hour}-${minute}.json`;
    }
  }
};
</script>