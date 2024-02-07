import { defineStore } from 'pinia';
import { getPivotalProjectIdAlt, getPivotalStory } from 'src/mixins/Pivotal';

/** Not point deducing this type, it's just all of PT's data for a ticket */
export type PivotalStory = {
  [key: string]: any;
};

export type PivotalStoryId = string | number;

type StoryPromise = {
  id: PivotalStoryId,
  resolver: () => Promise<PivotalStory>
};

type RootState = {
  stories: PivotalStory[],
  promiseStack: StoryPromise[],
  resolvedStories: PivotalStoryId[],
  resolverInterval: any
};

function getStoryPromise(
  id: PivotalStoryId,
  onFound?: (story: PivotalStory) => void,
  onNotFound?: (id: PivotalStoryId) => void
): StoryPromise
{
  return {
    id,
    resolver: () =>
    {
      return new Promise(async (resolve, reject) =>
      {
        try
        {
          let story = await getPivotalStory(id);

          if(!story)
          {
            const altProjectId = getPivotalProjectIdAlt();

            if(altProjectId)
            {
              story = await getPivotalStory(
                id,
                undefined,
                altProjectId
              );
            }
          }

          if(story && onFound)
          {
            onFound(story);
          }
          else if(!story && onNotFound)
          {
            onNotFound(id);
          }
        }
        catch(e)
        {
          reject(undefined);
        }
      });
    }
  };
}

const usePivotalStore = defineStore('pivotalStore', {
  state: () =>
    ({
      stories: [],
      promiseStack: [],
      resolvedStories: [],
      resolverInterval: undefined
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
    markStoryResolved(id: PivotalStoryId)
    {
      this.resolvedStories.push(id);
    },
    getIsStoryResolved(id: PivotalStoryId)
    {
      return this.resolvedStories.some((resolvedId) => resolvedId == id);
    },
    async load({ id, force = false }: { id: PivotalStoryId; force?: boolean; })
    {
      if(!id) return;

      if(!force)
      {
        if(this.get(id)) return;

        if(this.promiseStack.some((p) => p.id === id)) return;

        if(this.getIsStoryResolved(id)) return;
      }

      this.promiseStack.push(
        getStoryPromise(
          id,
          this.ADD_STORY,
          this.markStoryResolved
        )
      );

      this.resolveAll(false);
    },
    async resolveNextStory()
    {
      const next = this.promiseStack.shift();

      if(next?.resolver)
      {
        await next.resolver();
      }
    },
    resolveAll(clear = false)
    {
      if(this.resolverInterval)
      {
        if(clear)
        {
          clearInterval(this.resolverInterval);
        }
        else
        {
          return;
        }
      }

      this.resolverInterval = setInterval(
        async () =>
        {
          if(this.promiseStack.length)
          {
            await this.resolveNextStory();
          }
        },
        250
      );
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

      this.markStoryResolved(story.id);
    }
  },
});

export default usePivotalStore;
