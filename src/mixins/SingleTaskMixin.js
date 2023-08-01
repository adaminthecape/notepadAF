import { cudTaskViaStore, getTaskByIdFromStore, queueTaskRefresh, getStoriesFromTask } from "src/utils";

export default {
    props: {
        taskId: {
            type: String,
            default: undefined
        }
    },
    computed: {
        task()
        {
            return this.taskId ? getTaskByIdFromStore(this.$store, this.taskId) : undefined;
        },
        stories()
        {
            if(this.task)
            {
                return getStoriesFromTask(this.task);
            }

            return [];
        }
    },
    methods: {
        queueTaskRefresh,
        /** cudTask sugar for single-task components. */
        async updateTask(taskData, deleteTask = false)
        {
            await cudTaskViaStore(
                this.$store,
                taskData,
                deleteTask
            );
        }
    }
};