<template>
  <SimpleModal>
    <template #activator="{ open }">
      <q-btn
          icon="category"
          class="q-ml-xs"
          color="primary"
          dense
          flat
          @click="open"
      >
        <q-tooltip>{{ title }}</q-tooltip>
      </q-btn>
    </template>
    <template #title>
      {{ extrasTitle || title }}
    </template>
    <template #content>
      <div v-if="extrasId || extrasId === 0">
<!--        <q-list class="clickable-list">-->
<!--          <q-item-->
<!--              v-for="(tag, t) in items[extrasId].extra ? items[extrasId].extra.tags : []"-->
<!--              :key="`extras-list-item-${t}`"-->
<!--              clickable-->
<!--              :class="{-->
<!--                'clickable-list-item': true,-->
<!--                'selected': tag.active-->
<!--              }"-->
<!--              @click="tag.active = !tag.active"-->
<!--          >-->
<!--            <q-item-section>-->
<!--              {{ tag }}-->
<!--            </q-item-section>-->
<!--          </q-item>-->
<!--        </q-list>-->
        <q-card
            v-if="items[extrasId].extra.tags"
        >
          <TaskTagSelector
              :inputValue="items[extrasId].extra.tags"
              class="full-width"
              label="Select tags"
              multiple
              @input="items[extrasId].extra.tags = $event"
          />
        </q-card>
        <q-btn
            label="Back"
            class="q-mt-sm"
            @click="closeExtras"
        />
      </div>
      <q-list v-else class="clickable-list">
        <q-item
            v-for="(item, i) in items"
            :key="`clickable-list-item-${i}`"
            clickable
            :class="{
              'clickable-list-item': true,
              'selected': item.active
            }"
            @click="toggleItem(i)"
        >
          <q-item-section>
            <div class="row items-center">
              <div class="q-mr-lg">{{ item.title }}</div>
              <q-space />
              <q-btn
                  v-if="Object.keys(item.extra || {}).length"
                  icon="settings"
                  flat
                  dense
                  size="xs"
                  @click.stop.prevent="openExtras(i)"
              >
                <q-tooltip>Edit extras</q-tooltip>
              </q-btn>
              <q-icon v-if="item.active" name="check" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </SimpleModal>
</template>

<script>
import { getFromLocalStorage, saveToLocalStorage } from "src/utils";

export default {
  props: {
    value: {
      type: Array,
      required: true
    },
    listKey: {
      type: String,
      default: undefined
    },
    title: {
      type: String,
      default: 'List'
    }
  },
  components: {
    SimpleModal: () => import("src/components/SimpleModal.vue"),
    TaskTagSelector: () => import("src/components/TaskTagSelector.vue")
  },
  data()
  {
    return {
      items: [],
      extrasId: undefined,
      extrasTitle: undefined
    };
  },
  mounted()
  {
    if(this.listKey)
    {
      const storedItems = getFromLocalStorage(this.listKey, true);

      if(storedItems)
      {
        this.items = storedItems;
      }
    }

    this.items = [...this.value];
  },
  watch: {
    value: {
      handler(newVal)
      {
        this.$emit('input', newVal);
        this.items = newVal;
      },
      deep: true
    }
  },
  methods: {
    toggleItem(num)
    {
      if(this.items[num])
      {
        this.items[num].active = !this.items[num].active;

        if(this.listKey)
        {
          saveToLocalStorage(this.listKey, this.items);
          this.$emit('updated');
        }
      }
    },
    openExtras(i)
    {
      this.extrasId = i;
      this.extrasTitle = this.items[i].title;
    },
    closeExtras()
    {
      this.extrasId = undefined;
      this.extrasTitle = undefined;
    }
  }
};
</script>

<style scoped>
.clickable-list {
  border-radius: 6px;
  border: 1px solid #9C27B0;
}

.clickable-list-item {
  min-width: 12em;
}

.clickable-list-item.selected {
  background-color: #21BA4540;
}

.clickable-list-item:not(:last-child) {
  border-bottom: 1px solid #9C27B0;
}
</style>