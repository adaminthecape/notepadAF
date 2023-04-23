<template>
  <div>
    <q-card>
      <q-item>
        <h5 class="q-mb-sm q-mt-md">
          Choose a backup
        </h5>
      </q-item>
      <q-item>
        <div class="full-width q-mb-xs">
          <q-select
              v-model="chosenBackup"
              :options="recentBackupsOptions"
              filled
          >
            <template #append>
              <q-btn
                  v-if="chosenBackup"
                  label="Load"
                  @click.stop.prevent="loadChosenBackup"
              />
            </template>
          </q-select>
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
  saveToExternalBackup
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
      if(!this.chosenBackup.value)
      {
        return;
      }

      const backupData = readFromExternalBackup(
          this.chosenBackup.value
      );

      this.parsedBackupData = null;

      if(backupData)
      {
        try
        {
          this.parsedBackupData = JSON.parse(backupData);
        }
        catch(e)
        {
          console.warn(e);
        }
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
    }
  }
};
</script>