<template>
  <div>
    <div
        id="selectionMenu"
        ref="selectionMenu"
    >
      <q-list v-if="potentialSelectionPages.length">
        <q-item
            v-for="page in potentialSelectionPages"
            :key="`selection-${page.value}`"
            class="items-center"
            clickable
        >
          <q-item-section>
            <div class="flex-col">
              <div>
                {{ page.label }}
              </div>
            </div>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center">
              <q-btn
                  aria-label="Copy link"
                  icon="copy"
                  size="sm"
                  round
                  flat
                  @click.stop.prevent="copy(page.link)"
              />
            </div>
          </q-item-section>
        </q-item>
        <q-item class="items-center" clickable>
          <q-item-section @click.stop.prevent="hideSelectionMenu">
            <div class="row items-center">
              <q-icon
                  name="times-circle"
                  color="negative"
                  class="q-mr-sm"
              />
              Close
            </div>
          </q-item-section>
        </q-item>
      </q-list>
      <q-list v-else>
        <q-item class="items-center">
          <q-item-section @click.stop.prevent="hideSelectionMenu">
            <div class="flex-col">
              No relevant pages found.
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div class="wikiEditor q-px-md">
      <div class="row items-center">
        <!--
        <q-btn
          :label="module.toUpperCase()"
          class="q-mr-xs"
          dense
          flat
          @click="toggleModule"
        />
        -->
        <!--
        <q-input
          v-model="pageTitle"
          label="Page title"
          class="q-my-xs"
          style="flex-grow: 2"
          outlined
          dense
        >
          <template #append>
            <q-spinner
              v-if="loading"
              color="primary"
            />
            <q-icon
              v-else-if="pageTitle && !pageExists"
              name="check"
              color="primary"
              title="This page does not exist yet"
            />
            <q-icon
              v-else-if="pageTitle && pageExists"
              name="exclamation-circle"
              color="orange"
              title="This page already exists"
            />
          </template>
        </q-input>
        -->
        <q-btn
            :icon="!isShowingHistory ? 'history' : 'menu'"
            class="q-mr-sm"
            dense
            @click="isShowingHistory = !isShowingHistory"
        />
        <q-btn
            v-if="chosenPage && chosenPage.value"
            icon="arrow_right_alt"
            class="q-mr-sm"
            dense
            @click="openActiveArticle()"
        />
        <q-btn
            v-if="chosenPage && chosenPage.value"
            icon="edit"
            class="q-mr-sm"
            dense
            @click="openActiveArticle('edit')"
        />
        <div
            v-if="isShowingHistory"
            class="row items-center q-my-xs q-ml-xs"
        >
          <q-input
              value="History"
              style="flex-grow: 1"
              disable
              filled
              dense
          />
          <q-select
              v-model="branchToGetHistoryFor"
              :options="['vue', 'api', 'core', 'framework']"
              class="q-ml-sm"
              outlined
              dense
              @input="getHistory"
          />
          <q-select
              v-model="historyLimit"
              :options="[10, 20, 50, 100, 150, 200, 500, 1000]"
              class="q-ml-sm"
              outlined
              dense
              @input="getHistory"
          />
        </div>
        <q-select
            v-else
            v-model="chosenPage"
            :options="availablePagesFiltered"
            label="Existing pages"
            class="q-my-xs q-mr-xs"
            style="flex-grow: 1"
            :disable="loading"
            outlined
            dense
            useInput
            @filter="filterPages"
        >
          <template #append>
            <q-spinner
                v-if="loading"
                color="primary"
            />
          </template>
          <template #option="{ opt }">
            <q-item
                class="items-center"
                clickable
                @click="choosePage(opt)"
            >
              <q-item-section>
                <div class="flex-col">
                  <div class="row items-center">
                    <q-chip class="text-primary q-ma-none q-mr-sm" dense>
                      {{ opt.module.toUpperCase() }}
                    </q-chip>
                    <div v-if="opt.path" class="text-grey">
                      {{ opt.path }}/
                    </div>
                  </div>
                  <div>
                    {{ opt.label }}
                  </div>
                </div>
              </q-item-section>
              <q-item-section side>
                <div class="row">
                  <q-btn
                      icon="link"
                      round
                      flat
                      @click.stop.prevent="copy(generateLink(opt.value, opt.module))"
                  />
                </div>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
      <SimpleLayout :header="false" style="max-height: 70vh">
        <template #body>
          <div
              v-if="!isShowingHistory"
          >
            <q-markdown
                ref="editor"
                class="q-pa-sm"
                :src="originalContent"
                style="max-width: 64em"
            />
            <!--          <vue-showdown-->
            <!--              :markdown="originalContent"-->
            <!--          />-->
          </div>
          <div v-else class="q-pa-sm">
            <div v-if="!history || !history.length">
              No history to show
            </div>
            <div v-else>
              <div
                  v-for="(historyItem, h) in history"
                  :key="`historyItem-${h}`"
              >
                <q-card class="q-mb-xs">
                  <q-item>
                    <q-item-section>
                      <q-input
                        label="Commit"
                        :value="historyItem.commit"
                        class="q-mb-xs"
                        disable
                        filled
                        dense
                      />
                      <q-input
                        label="Author"
                        :value="historyItem.author"
                        class="q-mb-xs"
                        disable
                        filled
                        dense
                      />
                      <q-input
                        label="Date"
                        :value="historyItem.date"
                        class="q-mb-xs"
                        disable
                        filled
                        dense
                      />
                      <q-input
                        label="Message"
                        :value="historyItem.message"
                        class="q-mb-xs"
                        disable
                        filled
                        dense
                      />
                    </q-item-section>
                  </q-item>
                </q-card>
              </div>
            </div>
          </div>
        </template>
      </SimpleLayout>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { copyToClipboard } from 'quasar';
import debounce from 'lodash/debounce';
import GitlabMixin from '../mixins/gitlab';
import GitMixin from '../mixins/git';
import SimpleLayout from './SimpleLayout';
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown';
// import VueShowdown from 'vue-showdown';

export default {
  name: 'WikiEditor',
  components: {
    QMarkdown,
    // VueShowdown,
    SimpleLayout
  },
  mixins: [GitlabMixin, GitMixin],
  inject: ['$openLink'],
  data()
  {
    const token = this.getGitlabToken();

    return {
      isShowingHistory: true,
      history: [],
      branchToGetHistoryFor: 'vue',
      historyLimit: 100,
      vmarkOpts: {
        source: false,
        show: false,
        html: false,
        breaks: false,
        linkify: false,
        emoji: false,
        typographer: false,
        toc: true
      },
      baseURI: 'http://gitlab.angdev.com/api/v4',
      token,
      modules: ['api', 'vue', 'framework'],
      moduleIndex: 0,
      loading: false,
      // whether to show the token or hide it like a password
      hideToken: true,
      // title of the page - is editable
      pageTitle: null,
      // the content of the page as converted to markdown (by the markdown api)
      pageContent: null,
      // the non-markdown content of the page, as returned by the api
      originalContent: null,
      // periodically parsed markdown, when not in WYSIWYG mode
      renderedContent: null,
      // whether this is already a page in the wiki
      pageExists: false,
      // chosen existing page - is not editable
      chosenPage: null,
      // all pages available in the chosen module
      availablePages: [],
      availablePagesFiltered: [],
      // all pages in the api and vue glossaries, each with label, value, and link
      glossaryPages: [],
      module: 'api',
      // potentialPageLinks: [],
      query: null,
      // whether to edit as WYSIWYG or as markdown
      wysiwygMode: false,
      potentialSelectionPages: [],
      markdownTemplates: []
    };
  },
  computed: {
    // potentialPageLinks()
    // {
    //   if(!this.originalContent)
    //   {
    //     return [];
    //   }
    //
    //   const content = this.originalContent;
    //
    //   return this.availablePages.reduce((agg, page) =>
    //   {
    //     const needle = new RegExp(this.genericPattern(page.label), 'i');
    //     const matches = content.match(needle);
    //
    //     if(
    //         matches?.length &&
    //         page.value !== this.chosenPage.value &&
    //         !content.includes(page.value)
    //     )
    //     {
    //       agg.push({
    //         ...page,
    //         selection: {
    //           from: matches.index,
    //           to: matches.index + page.label.length
    //         },
    //         match: matches[0]
    //       });
    //     }
    //
    //     return agg;
    //   }, []);
    // },
    projectId()
    {
      switch(this.module)
      {
        case 'api':
          return 19;
        case 'vue':
          return 18;
        case 'framework':
          return 17;
        default:
          return 19;
      }
    }
    // module()
    // {
    // 	return this.modules[this.moduleIndex];
    // },
  },
  watch: {
    originalContent()
    {
      this.updateMarkdownContent(this.originalContent);
    },
    wysiwygMode()
    {
      this.choosePage(this.chosenPage);
    }
  },
  mounted()
  {
    this.loadAllModulePages();
  },
  methods: {
    getHistory()
    {
      const getBranchCode = (module) =>
      {
        switch(module)
        {
          case 'vue':
            return 'aluminate-vue.wiki';
          case 'api':
            return 'aluminate-api.wiki';
          case 'core':
            return 'core-api.wiki';
          case 'framework':
            return 'framework.wiki';
          default:
            return null;
        }
      };

      const branch = getBranchCode(this.branchToGetHistoryFor);

      if(!branch)
      {
        return;
      }

      this.runCmd(
          `cd C:/devRepos/${branch} && git log`,
          (data) =>
          {
            if(typeof data === 'string')
            {
              const dataItems = data
                  .split('\n\ncommit')
                  .slice(0, this.historyLimit)
                  .map((item) =>
                  {
                    return item.split('\n').reduce((agg, i, index) =>
                    {
                      if(!i)
                      {
                        return agg;
                      }
                      else if(i.startsWith('Author: '))
                      {
                        agg.author = i.replace('Author: ', '');
                      }
                      else if(i.startsWith('Date:   '))
                      {
                        agg.date = i.replace('Date:   ', '');
                      }
                      else if(i.startsWith('commit ') || index === 0)
                      {
                        agg.commit = i.replace('commit', '').slice(1);
                      }
                      else if(i.startsWith('    '))
                      {
                        agg.message = i.slice(4);
                      }

                      return agg;
                    }, {});
                  });

              this.history = dataItems;
            }
          },
          (err) =>
          {
            console.error(err);
          }
      );
    },
    // getTextSelection()
    // {
    //   return window.getSelection?.().toString() || document.selection?.createRange().text || '';
    // },
    selectionMenuHandler(e)
    {
      if(!this.getTextSelection())
      {
        return;
      }

      e.preventDefault();
      this.setPotentialSelectionPages();

      // open a context menu which will allow you to specify
      // a page which is related to this at all (by keyword)
      this.$refs.selectionMenu.style.display = 'block';
      this.$refs.selectionMenu.style.left = `${Math.min(e.x, this.$q.screen.width - 500)}px`;
      this.$refs.selectionMenu.style.top = `${Math.min(e.y - 60, this.$q.screen.height - 260)}px`;
    },
    hideSelectionMenu()
    {
      this.$refs.selectionMenu.style.display = 'none';
      this.$refs.selectionMenu.style.left = '-10000px';
      this.$refs.selectionMenu.style.top = '-10000px';
    },
    setPotentialSelectionPages()
    {
      const content = this.originalContent;

      if(!content)
      {
        return;
      }

      let keyword = (this.getTextSelection() || '').trim().toLowerCase();

      if(keyword.slice(-3) === 'ing')
      {
        keyword = keyword.slice(0, -3);
      }
      else if(
          keyword.slice(-2) === 'es' ||
          keyword.slice(-2) === 'ed'
      )
      {
        // it's possibly plural. check for non-plurals too
        keyword = keyword.slice(0, -2);
      }
      else if(keyword.slice(-1) === 's')
      {
        keyword = keyword.slice(0, -1);
      }

      this.potentialSelectionPages = this.availablePages.reduce((agg, page) =>
      {
        if(page.value.replace('-', ' ').toLowerCase().includes(keyword))
        {
          agg.push(page);
        }

        return agg;
      }, []);
    },
    clearHighlights()
    {
      this.$refs.markdownPreview.innerHTML = this.$refs.markdownPreview.innerHTML
          .replaceAll('<span class="markdown-attention">', '')
          .replaceAll('</span><!-- /markdown-attention -->', '');
    },
    highlightFirstInstanceOfText(keyword)
    {
      this.clearHighlights();

      const el = [...this.$refs.markdownPreview.querySelectorAll('p, div, code, span, ul, li')]
          .find((p) => p.innerHTML.includes(keyword));

      if(!el)
      {
        return;
      }

      el.innerHTML = el.innerHTML.replace(keyword, `<span class="markdown-attention">${keyword}</span><!-- /markdown-attention -->`);
      el.scrollIntoView();
    },
    scrolledMarkdownTextarea(e)
    {
      this.$refs.markdownPreview.scroll(0, e.target.scrollTop);
    },
    /**
     * This seems to work 99% to convert html to markdown.
     * Caveat: images are not resolved with OImage and default to a donote logo.
     * This will break any images in the article if you copy the markdown this way.
     * The reason to have this is to allow editing the article from tiptap,
     * then converting it to markdown to be pasted into GitLab.
     * The image problem is resolved by using the TiptapImage extension instead of
     * the Image extension in WYSIWYG.vue, and allows you to edit the article here.
     * Click the copy button at the far right to copy your modifications.
     * @param html
     * @returns {*}
     */
    convertHtmlToMarkdown(html = '')
    {
      if(!this.pageContent)
      {
        return null;
      }

      return NodeHtmlMarkdown.translate(html);
    },
    generateFileLink(path, module)
    {
      return `http://gitlab.angdev.com/aluminati/${this.getProjectPath(module)}/-/blob/master/src/${path}`;
    },
    genericPattern(str)
    {
      return `[ \`]${str}[\`,. ]`;
    },
    async choosePage(opt)
    {
      this.chosenPage = opt;
      this.module = opt.module;
      this.originalContent = null;
      // this.potentialPageLinks = [];

      if(!opt || !opt.value)
      {
        return;
      }

      try
      {
        const { content } = await this.getData(opt.value);

        // await this.setMarkdownContent(content);
        this.pageTitle = opt.label;
        this.originalContent = content;
        this.vmarkOpts.source = content;
        // this.potentialPageLinks = this.getPotentialPageLinks();
      }
      catch(e)
      {
        console.error(e);
        this.$notify('WYSIWYG failed to populate');
      }
    },
    selectText(from, to)
    {
      if(!this.$refs.wysiwyg || this.$refs.wysiwyg.$refs.tiptap)
      {
        return;
      }

      const { editor } = this.$refs.wysiwyg.$refs.tiptap;

      editor.setSelection(from, to);

      try
      {
        const { offset } = editor.view.domAtPos(from);

        this.$refs.wysiwygContainer.scrollBy(0, -10000);
        this.$refs.wysiwygContainer.scrollBy(0, offset);
      }
      catch(e)
      {
        // don't really care if the scroll fails
        console.warn(e);
      }

      editor.focus();
    },
    selectTextInstanceOf(str)
    {
      const from = this.originalContent.toLowerCase().indexOf(str.toLowerCase());
      const to = from + str.length;

      this.selectText(from, to);
    },
    updateMarkdownContent: debounce(function setMarkdownContentDebounce(content)
    {
      this.setMarkdownContent(content);
    }, 1000),
    async setMarkdownContent(content = '')
    {
      // const { html } = await this.getMarkdown(content);
      //
      // if(this.wysiwygMode)
      // {
      //   this.$refs.wysiwyg.setContent(html);
      // }
      // else
      // {
      //   this.renderedContent = html;
      // }
    },
    /**
     * Do this as little as possible, for efficiency (fewer API requests)
     * @returns {Promise<void>}
     */
    async loadAllModulePages()
    {
      this.availablePages = [];

      const api = await this.getData('', 19);
      const vue = await this.getData('', 18);
      const fw = await this.getData('', 17);

      const makeData = (page, module) => ({
        label: page.title,
        value: page.slug,
        module,
        link: this.generateLink(page.slug, module),
        isGlossary: page.slug.startsWith('Glossary/'),
        path: page.slug.includes('/') ? page.slug.split('/').slice(0, -1).join('/') : null
      });

      this.availablePages = [
        ...api.reduce((agg, page) =>
        {
          agg.push(makeData(page, 'api'));

          return agg;
        }, []),
        ...vue.reduce((agg, page) =>
        {
          agg.push(makeData(page, 'vue'));

          return agg;
        }, []),
        ...fw.reduce((agg, page) =>
        {
          agg.push(makeData(page, 'framework'));

          return agg;
        }, [])
      ];
    },
    async loadModulePages()
    {
      this.availablePages = [];
      const data = await this.getData();

      const nonGlossaryPages = data.reduce((agg, page) =>
      {
        if(page.slug.startsWith('Glossary/'))
        {
          this.availablePages.push({
            label: page.title,
            value: page.slug
          });
        }
        else
        {
          agg.push({
            label: page.title,
            value: page.slug
          });
        }

        return agg;
      }, []);

      this.availablePages.push(...nonGlossaryPages);
    },
    toggleModule()
    {
      this.pageTitle = null;
      this.chosenPage = null;

      if(this.moduleIndex >= (this.modules.length - 1))
      {
        this.moduleIndex = 0;
      }
      else
      {
        this.moduleIndex += 1;
      }

      // this.loadModulePages();
    },
    async getData(slug = '', projectId = this.projectId, basePath = 'wikis')
    {
      this.loading = true;

      // slug = slug ? this.base64Encode(slug) : '';

      const uri = `${this.baseURI}/projects/${projectId}/${basePath}/${slug}`;

      try
      {
        // const { data } = await axios.get(uri, { headers: {
        //     'PRIVATE-TOKEN': this.token
        //   } });
        const data = await this.getGitlabEndpoint(
            undefined,
            {},
            undefined,
            {
              projectId,
              slug
            }
        );

        if(data)
        {
          this.pageExists = true;
        }

        return data;
      }
      catch(e)
      {
        if(e.message === 'Request failed with status code 404')
        {
          if(slug)
          {
            this.pageExists = false;
          }

          return null;
        }

        console.error(e);

        this.$notify('Something went wrong! Check your console for errors');

        return 'error';
      }
      finally
      {
        this.loading = false;
      }
    },
    // this fixes image paths, but they don't resolve anyway, due to cross-origin
    fixImages(text)
    {
      return text
          .replaceAll('<img src="', '<img src="http://gitlab.angdev.com')
          .replaceAll('/-/blob/master/', '/-/wikis/');
    },
    async getMarkdown(text = '')
    {
      if(!text)
      {
        return {};
      }

      const uri = `${this.baseURI}/markdown`;

      try
      {
        const { data } = await axios.post(uri,
            {
              text,
              project: this.getProjectPath()
            },
            {
              headers: {
                'PRIVATE-TOKEN': this.token,
                'Content-Type': 'application/json'
              }
            });

        return data;
      }
      catch(e)
      {
        if(e.message === 'Request failed with status code 404')
        {
          return null;
        }

        console.error(e);

        this.$notify('Something went wrong! Check your console for errors');

        return 'error';
      }
    },
    generateLink(slug = '', module = this.module)
    {
      return `http://gitlab.angdev.com/${this.getProjectPath(module)}/-/wikis/${slug}`;
    },
    async copy(text)
    {
      await copyToClipboard(text);
    },
    async copyEditorContent()
    {
      await copyToClipboard(this.originalContent);
    },
    async linkPage(name, slug, module, trim = false)
    {
      if(trim)
      {
        name = name.trim();
      }

      const link = this.generateLink(slug, module);
      const matches = this.originalContent.match(new RegExp(this.genericPattern(name), trim ? 'g' : 'i'));

      if(!matches)
      {
        return;
      }

      const [match] = matches;

      if(!match)
      {
        return;
      }

      if(match.includes(`\`${name}\``))
      {
        this.originalContent = this.originalContent.replace(
            match,
            `[\`${name}\`](${link})`
        );
      }
      else if(match.includes(name))
      {
        this.originalContent = this.originalContent.replace(
            match,
            match.replace(name, `[${name}](${link})`)
        );
      }
      else
      {
        this.originalContent = this.originalContent.replace(
            match,
            match.replace(name.toLowerCase(), `[${name.toLowerCase()}](${link})`)
        );
      }

      this.setMarkdownContent(this.originalContent);

      await copyToClipboard(this.originalContent);

      // this.potentialPageLinks = this.getPotentialPageLinks();
    },
    filterPages(val, update)
    {
      val = val.trim();

      if(val === '')
      {
        update(() =>
        {
          this.availablePagesFiltered = this.availablePages;
        });

        return;
      }

      update(() =>
      {
        this.availablePagesFiltered = this.availablePages
            .filter((opt) => (
                opt.label.toLowerCase().includes(val.toLowerCase())
            ));
      });
    },
    openActiveArticle(slug = '')
    {
      this.$openLink(`${this.generateLink(this.chosenPage.value, this.chosenPage.module)}/${slug}`);
    },
    setNewPage()
    {
      const content = '### New page';

      this.chosenPage = {
        label: 'New page',
        value: '',
        module: 'api'
      };

      this.originalContent = content;

      this.setMarkdownContent(content);
    }
  }
};
</script>

<style scoped>
.full-height {
  min-height: 72vh;
  max-height: 72vh;
  max-width: 49%;
  overflow-y: scroll;
}
</style>

<style>
.markdown-attention {
  color: #f00;
  background: #ff0;
  padding: 0 4px;
  border-radius: 4px;
}

#selectionMenu {
  display: none;
  position: absolute;
  left: -10000px;
  top: -10000px;
  background: white;
  border-radius: 6px;
  border: 1px solid #aaa;
  overflow-y: scroll;
  max-height: 20em;
}
</style>
