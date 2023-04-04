<template>
  <div>
    <slot name="activator" v-bind="{ open, close }" />
    <q-dialog
        v-model="isModalOpen"
    >
      <q-card
          class="q-px-lg q-pb-lg"
          :style="fullWidth ? 'min-width: 95vw' : ''"
      >
        <h4 class="modal-title">
          <slot name="title" />
        </h4>
        <div class="modal-content q-mb-lg">
          <slot name="content" />
        </div>
        <div class="modal-actions row">
          <q-space />
          <slot name="actions" v-bind="{ open, close, toggle }" />
          <q-btn
              label="Close"
              color="negative"
              flat
              @click="close"
          />
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    title: {
      type: String,
      default: null
    },
    content: {
      type: String,
      default: null
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  },
  data()
  {
    return {
      isModalOpen: false
    };
  },
  methods: {
    close()
    {
      this.isModalOpen = false;
    },
    open()
    {
      this.isModalOpen = true;
    },
    toggle()
    {
      this.isModalOpen = !this.isModalOpen;
    }
  }
};
</script>

<style>
.full-height {
  min-height: 92vh;
  max-height: 92vh;
  max-width: 50%;
  overflow-y: scroll;
}

pre {
  white-space: pre-wrap;
}

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

h1, h2, h3, h4, h5, h6 { line-height: 1em; }
h1 { font-size: 2em; }
h2 { font-size: 1.8em; }
h3 { font-size: 1.6em; }
h4 { font-size: 1.4em; }
h5 { font-size: 1.2em; }
h6 { font-size: 1em; }
</style>
