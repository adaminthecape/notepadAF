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
      {{ title }}
    </template>
    <template #content>
      <q-list class="clickable-list">
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
              <q-icon v-if="item.active" name="check" />
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </SimpleModal>
</template>

<script>
import SimpleModal from "src/components/SimpleModal.vue";
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
    SimpleModal
  },
  data()
  {
    return {
      items: []
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
        }
      }
    }
  }
};
</script>

<style scoped>
.clickable-list {
  border-radius: 6px;
  border: 1px solid #9C27B0;
}

.clickable-list-item.selected {
  background-color: #21BA4540;
}

.clickable-list-item:not(:last-child) {
  border-bottom: 1px solid #9C27B0;
}
</style>