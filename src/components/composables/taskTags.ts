import { computed } from 'vue';
import { Task } from 'src/types';
import { useTasks } from 'src/components/composables/tasks';
import { isStoryId } from 'src/components/composables/pivotalStory';

export function useTaskTags() {
  const { tasks: tasksList } = useTasks();

  const allTags = computed(() => {
    if (!tasksList.value || !tasksList.value.length) {
      return [];
    }

    const { other, stories } = tasksList.value.reduce(
      (agg: string[], task: Task) => {
        const tags = [...(task.tags || [])].filter(
          (tag) => !agg.includes(tag)
        );

        if (tags.length) {
          return agg.concat(tags);
        }

        return agg;
      },
      [] as string[]
    ).sort()
      .reduce((agg: { stories: string[], other: string[] }, item: string) => {
        if (isStoryId(item)) {
          agg.stories.push(item);
        }
        else {
          agg.other.push(item);
        }
        return agg;
      }, {
        stories: [],
        other: []
      });

    return [...other, ...stories];
  });

  return { allTags };
}
