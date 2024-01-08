import { computed, onMounted } from 'vue';
import usePivotalStore from 'src/pinia/pivotalStore';

export function isStoryId(x: string | number) {
  return `${x}` === `${parseInt(String(x), 10)}`;
}

export function usePivotalStory(storyId: string|number) {
  // const props = defineProps({
  //   storyId: {
  //     type: [String, Number],
  //     required: true
  //   }
  // });

  const store = usePivotalStore();

  const story = computed(() => {
    return store.get(parseInt(`${storyId}`, 10));
  });

  onMounted(async () => {
    await store.load({ id: parseInt(`${storyId}`, 10) });
  });

  return { story };
}
