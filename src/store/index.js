import Vue from 'vue';
import Vuex from 'vuex';
import notes from '../store/notes/index';
import themes from '../store/themes/index';
import pivotal from '../store/pivotal/index';

// import example from './module-example'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
        notes,
        themes,
        pivotal
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEBUGGING
  })

  return Store
}
