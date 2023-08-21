<template>
  <!-- VIEW ALERTS: -->
  <div
    v-if="task.alerts && task.alerts.length"
    style="margin-left: -10px">
    <q-btn
      v-for="(alert, a) in task.alerts"
      :key="`alert-${a}-${activeAlertsRenderKey}`"
      size="sm"
      class="text-bold"
      :class="{ 'q-ml-xs': !!a }"
      unelevated outline dense
      :color="alert.unix < Date.now() - 600000 ? 'negative' : 'primary'"
    >
      <div class="row items-center">
        <q-icon name="notification_important" />
        <span>{{ timeSinceAlert(alert.unix) }}</span>
        <q-icon name="close" size="xs" dense flat @dblclick.stop.prevent="removeAlert(alert)" />
      </div>
      <q-tooltip>Due {{ alert.date }} at {{ alert.time }}</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { TaskAlert } from 'src/types';
import useTaskStore from 'src/pinia/taskStore';
import { computed, ref } from 'vue';
import { timeSince } from 'src/utils';

const props = defineProps<{
  taskId: string;
}>();

const store = useTaskStore();

const task = computed(() => store.getTask(props.taskId));
const activeAlertsRenderKey = ref<number>(0);
function timeSinceAlert(unix: number) {
  return timeSince(new Date(unix).getTime());
}

function removeAlert(alert: TaskAlert) {
  if (!task.value.alerts?.length) {
    return;
  }

  const alerts = task.value.alerts.filter((a) => a.unix !== alert.unix);

  store.cloudUpdateSingle({ ...task.value, alerts });
}
</script>
