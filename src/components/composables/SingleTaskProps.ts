import useTaskStore from 'src/pinia/taskStore';
import { Task } from 'src/types';
import { defineProps, computed } from 'vue';

export function useSingleTaskProps()
{
    const store = useTaskStore();
    const taskId = defineProps<Task['id']>();
    const task = computed(() => store.getTask(taskId));

    return {
        taskId,
        task
    };
}