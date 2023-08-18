import { computed } from "vue";

<template>
  <q-layout
      view="lHh lpr lFf"
      container
      class="shadow-2 rounded-borders"
      style="height: calc(100vh - 38px);"
  >
    <slot name="body" />

    <q-header
        v-if="header"
        elevated
        style="background-color: #00084080"
    >
      <q-toolbar
      >
        <slot name="header-left" />

        <q-toolbar-title>
          <slot name="header-title" />
        </q-toolbar-title>

        <slot name="header-right" />
      </q-toolbar>
    </q-header>

    <q-page-container v-if="page">
      <q-page :class="!pageClasses ? '' : pageClasses.join(' ')" :style="pageStyle">
        <slot name="page-header" />
        <q-scroll-area :style="`height: calc(100vh - ${pageOffset}px)`">
          <slot name="page-content" />
        </q-scroll-area>
      </q-page>
    </q-page-container>

    <q-footer
        v-if="footer"
        elevated
    >
      <q-toolbar
      >
        <q-toolbar-title>
          <slot name="footer-content" />
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
defineProps({
  header: {
    type: Boolean,
    default: true
  },
  footer: {
    type: Boolean,
    default: false
  },
  page: {
    type: Boolean,
    default: true
  },
  pageOffset: {
    type: Number,
    default: 120
  },
  pageStyle: {
    type: String,
    default: ''
  },
  pageClasses: {
    type: Array,
    default: undefined
  }
});
</script>
