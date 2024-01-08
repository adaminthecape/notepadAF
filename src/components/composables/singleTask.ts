import useTaskStore from 'src/pinia/taskStore';
import { useTasks } from 'src/components/composables/tasks';
import { computed } from 'vue';
import { Task, TaskAlert } from 'src/types';
import { goToActivityPageForTask, queueTaskRefresh } from 'src/utils';

export function useSingleTask(taskId: string) {
  const {
    cloudUpdateSingle,
    cloudUpdateSingleProperty,
    getTaskProperty,
    getTask
  } = useTaskStore();

  const { tasks } = useTasks();

  const task = computed(() => getTask(taskId));

  function addSubtaskToTask(data = { note: '' }, storyId?: string|number) {
    const task = tasks.value.find((t) => t?.id === taskId);

    if (!task?.id || !taskId) {
      return;
    }

    cloudUpdateSingleProperty({
      taskId: task.id,
      prop: 'next',
      data: (task.next || []).concat({
        note: storyId ?
          `${storyId}: ${data.note || ''}` :
          data.note
      }),
    }).then(() => {
      data.note = '';
    });
  }

  const lastActivity = computed(() => {
    const activity = getTaskProperty(taskId, 'activity');

    if (activity && activity.length) {
      return activity[activity.length - 1];
    }

    return undefined;
  });

  const active = computed(() => {
    return getTaskProperty(taskId, 'active');
  });

  async function updateTask(taskData: Task) {
    await cloudUpdateSingle(taskData);
  }

  async function toggleActive(logNote?: string) {
    if (!task.value) {
      return;
    }

    const taskData = { ...task.value };

    if (!taskData.activity) {
      taskData.activity = [];
    }

    taskData.active = active.value ? 0 : Date.now();

    if (!active.value) {
      // task is now active; start a new log
      taskData.activity.push({
        start: Date.now(),
        end: 0,
        note: logNote || '',
      });
    } // task is no longer active; end the last log
    else {
      const lastLog = taskData.activity.length
        ? taskData.activity[taskData.activity.length - 1]
        : undefined;

      if (!lastLog) {
        // create first log
        taskData.activity.push({
          start: active.value,
          end: Date.now(),
          note: logNote || '',
        });
      } else {
        const noteToAdd =
          logNote || taskData.activity[taskData.activity.length - 1].note || '';
        taskData.activity[taskData.activity.length - 1].end = Date.now();
        taskData.activity[taskData.activity.length - 1].note = noteToAdd;
      }
    }

    await cloudUpdateSingle(taskData);
  }

  function getTaskDataWithNewAlert(alert: TaskAlert) {
    if (!task.value) {
      console.warn('Task not found!', alert);

      return undefined;
    }

    const taskData = { ...task.value };

    if (!taskData.alerts) {
      taskData.alerts = [];
    }

    if (alert.id) {
      delete alert.id;
    }

    taskData.alerts.push(alert);

    return taskData;
  }

  async function addAlertToTask(alert: TaskAlert) {
    if (!task.value || !alert || !alert.time || !alert.date) {
      console.warn('Not enough data for alert!', alert);

      return;
    }

    const taskData = getTaskDataWithNewAlert(alert);

    if (!taskData) {
      return;
    }

    await cloudUpdateSingle(taskData as Task);
  }

  async function removeAlert(alert: TaskAlert) {
    if (!task.value.alerts?.length) {
      return;
    }

    const alerts = task.value.alerts.filter((a) => a.unix !== alert.unix);

    await cloudUpdateSingle({ ...task.value, alerts });
  }

  async function toggleArchived() {
    await cloudUpdateSingleProperty({
      taskId,
      prop: 'archived',
      data: task.value.archived === 0 ? Date.now() : 0
    });
  }

  const archived = computed(() => {
    return getTaskProperty(taskId, 'archived');
  });

  async function updateProperty(prop: string, data: any): Promise<void> {
    await cloudUpdateSingleProperty({
      taskId, prop, data
    });
  }

  async function toggleDeleted() {
    if (!task.value) return;

    await updateProperty('deleted', task.value.deleted === 0 ? Date.now() : 0);
  }

  async function setDone(newVal: number) {
    await updateProperty('done',newVal);
  }

  const done = computed(() => getTaskProperty(taskId, 'done'));
  const title = computed(() => getTaskProperty(taskId, 'title'));

  function refreshTask() {
    queueTaskRefresh(taskId);
  }

  function goToActivity() {
    goToActivityPageForTask(taskId);
  }

  return {
    task,
    active,
    addSubtaskToTask,
    lastActivity,
    updateTask,
    toggleActive,
    addAlertToTask,
    removeAlert,
    archived,
    toggleArchived,
    toggleDeleted,
    done,
    setDone,
    title,
    refreshTask,
    goToActivity
  };
}
