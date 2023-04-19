import Vue from 'vue';
import { getPivotal } from '../../mixins/Pivotal';

const state = {
    stories: []
};

const mutations = {
    ADD_STORY(state, story)
    {
        if(!story)
        {
            return;
        }

        const allStories = state.stories;

        const existingIndex = allStories.findIndex((s) => s.id === story.id);

        if(existingIndex > -1)
        {
            allStories[existingIndex] = story;
        }
        else
        {
            allStories.push(story);
        }

        Vue.set(state, 'stories', allStories);
    }
};

const actions = {
    update({ commit, dispatch }, { story })
    {
        if(!story || typeof story !== 'object')
        {
            return;
        }

        const all = getters.all(state);
        const existing = all.find((s) => s.id === story.id) || {};

        const newStory = {
            ...existing,
            ...story
        };

        commit('ADD_STORY', newStory);
    },
    async load({ getters, commit, dispatch }, { id, force = false })
    {
        if(!id)
        {
            return;
        }

        const existing = getters.get(id);

        if(force || !existing)
        {
            const story = await getPivotal(id);
            commit('ADD_STORY', story);
        }
    }
};

const getters = {
    all: (state) => state.stories,
    get: (state) => (id) => state.stories.find((s) => s.id === id)
};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
