import { defineStore } from 'pinia';
import { getPivotalProjectIdAlt, getPivotalStory } from 'src/mixins/Pivotal';

/** Not point deducing this type, it's just all of PT's data for a ticket */
export type PivotalStory = {
    [key: string]: any;
};

export type PivotalStoryId = string | number;

type RootState = {
    stories: PivotalStory[]
};

const usePivotalStore = defineStore('pivotalStore', {
  state: () =>
    ({
        stories: []
    } as RootState),
    getters: {
        all: (state) => state.stories,
        get: (state) => (id: string|number) => state.stories.find((s) => s.id === id)
  },
    actions: {
        update({ story }: { story: PivotalStory })
        {
            if (!story || typeof story !== 'object')
            {
                return;
            }

            const existing = this.all.find((s) => s.id === story.id) || {};

            const newStory = {
                ...existing,
                ...story
            };

            this.ADD_STORY(newStory);
        },
        async load({ id, force = false }: { id: PivotalStoryId; force?: boolean; })
        {
            if (!id)
            {
                return;
            }

            const existing = this.get(id);

            if (force || !existing)
            {
                let story = await getPivotalStory(id);

                if (!story)
                {
                    // try another project
                    const altProjectId = getPivotalProjectIdAlt();

                    if (altProjectId)
                    {
                        story = await getPivotalStory(id, undefined, altProjectId);
                    }
                }

                if (story)
                {
                    this.ADD_STORY(story);
                }
            }
        },
        ADD_STORY(story: PivotalStory)
        {
            if (!story)
            {
                return;
            }

            const allStories = this.stories;

            const existingIndex = allStories.findIndex((s) => s.id === story.id);

            if (existingIndex > -1)
            {
                this.stories[existingIndex] = story;
            }
            else
            {
                this.stories.push(story);
            }
        }
  },
});

export default usePivotalStore;
