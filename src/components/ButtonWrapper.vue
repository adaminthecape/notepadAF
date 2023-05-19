<template>
  <div>
    <q-btn
        v-bind="qProps"
        @click="$emit('click')"
    >
      <q-icon
          v-if="icon"
          :name="icon"
      />
      <transition name="btnTextTransition" appear>
        <div class="q-mx-sm">
          <slot name="text" />
          <div v-if="label">
            {{ label }}
          </div>
        </div>
      </transition>
    </q-btn>
  </div>
</template>

<script>
  export default {
    components: {
    },
    props: {
      icon: {
        type: String,
        default: undefined
      },
      label: {
        type: String,
        default: undefined
      },
      qProps: {
        type: Object,
        default: () => ({})
      }
    },
    data()
    {
      return {
      };
    },
    computed: {
    },
    methods: {
    }
  };
</script>

<style scoped>
  .btnTextTransition-enter-active,
  .btnTextTransition-leave-active {
    transition: width 0.25s;
    width: 0;
  }

  .btnTextTransition-enter,
  .btnTextTransition-leave-to {
    width: auto;
  }
</style>