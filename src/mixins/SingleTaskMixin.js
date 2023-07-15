import { cudTaskViaStore, getTaskByIdFromStore, queueTaskRefresh } from "src/utils";

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
                return ((
                    `${JSON.stringify(this.task.tags || [])} ${this.task.message}`
                        .match(/1\d{8}/g)
                ) || [])
                    .reduce((agg, id) =>
                    {
                        if(!agg.some((existing) => existing.id === id))
                        {
                            agg.push({ id });
                        }

                        return agg;
                    }, []);
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