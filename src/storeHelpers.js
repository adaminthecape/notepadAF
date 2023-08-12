import { store } from "quasar/wrappers";

export function getTask(store, taskId) {
  return store.getters["notes/getTask"](taskId);
}

export function getTaskProperty(store, taskId, prop) {
  return store.getters["notes/getTaskProperty"](taskId, prop);
}

export function getTasks(store) {
  return store.getters["notes/getTasks"];
}

export function getTasksByBuckets(store, buckets) {
  return store.getters["notes/getTasksByBuckets"](
    buckets || store.getters["notes/getCategories"]
  );
}

export function getStory(store, storyId)
{
  console.log('getStory:', storyId, store, store.getters['pivotal/get'](storyId));
  return store.getters['pivotal/get'](storyId);
}

export async function loadStory(store, storyId)
{
  await store.dispatch('pivotal/load', { id: storyId });
}