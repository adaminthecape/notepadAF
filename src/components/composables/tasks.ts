import useTaskStore from 'src/pinia/taskStore';
import { computed } from 'vue';
import { Task } from 'src/types';

export function useTasks() {
  const store = useTaskStore();

  const tasks = computed<Task[]>(() => (
    (Object.values(store.getTasksInSelectedBuckets()) as Task[])
      .sort((a: any, b: any) => b.updated - a.updated)
  ));

  async function addNewTask(newTask: Partial<Task>) {
    const tags = Array.isArray(newTask.tags) ? newTask.tags : [];

    if (Array.isArray(newTask.stories)) {
      tags.push(...newTask.stories.map((s) => `${s}`));
    }

    newTask.tags = tags;

    await store.cloudUpdateSingle(newTask as Task);
  }

  return { tasks, addNewTask };
}
