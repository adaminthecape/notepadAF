<template>
  <q-btn-dropdown
      class="q-ml-xs"
      size="md"
      emitValue
      clearable
      dense
      dark
      flat
  >
    <q-list>
      <q-item
          v-for="type in sortTypes"
          :key="`sort-type-${type}`"
          style="min-width: 10em"
          clickable
          @click="setSort(type)"
      >
        <q-item-section>
          <div class="row items-center">
            <span>{{ type }}</span>
            <q-space />
            <q-icon
                v-if="sortType === type"
                :name="inverseSort ? 'arrow_downward' : 'arrow_upward'"
                size="xs"
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <template #label>
      <div class="row items-center">
        <q-btn
            v-if="sortType"
            icon="close"
            size="xs"
            class="q-mr-xs"
            color="yellow"
            flat
            @click.stop.prevent="setSort(undefined)"
        />
        <div v-if="!sortType" style="margin-right: -10px;">
          Sort
        </div>
        <div v-else class="row items-center" style="margin-right: -10px;">
          <span>{{ sortType }}</span>
          <q-icon
              :name="inverseSort ? 'arrow_downward' : 'arrow_upward'"
              size="xs"
          />
        </div>
      </div>
    </template>
  </q-btn-dropdown>
</template>

<script>
  export default {
    props: {
      sortType: {
        type: String,
        default: undefined
      },
      inverseSort: {
        type: Boolean,
        default: false
      }
    },
    data()
    {
      return {
        sortTypes: ['due', 'created', 'done']
      };
    },
    methods: {
      setSort(type)
      {
        this.$emit('setSortType', type);
      }
    }
  };
</script>