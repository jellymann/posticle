<template>
  <div class="container">
    <div class="nav">
    </div>
    <div class="main">
      <div class="left">
        <schema v-model="currentTable" />
      </div>
      <div class="content">
        <table-view :table="currentTable" v-if="currentTable" />
      </div>
      <div class="right"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.nav {
  height: 3rem;
  flex-shrink: 0;
  background: $panel-background;
  border-bottom: $panel-border;
}

.main {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
}

.left {
  width: 16rem;
  flex-shrink: 0;
  background: $panel-background;
  border-right: $panel-border;
  overflow-x: hidden;
  overflow-y: auto;
}

.right {
  width: 16rem;
  flex-shrink: 0;
  background: $panel-background;
  border-left: $panel-border;
}

.content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
</style>

<script>
import { provide, ref, watchEffect } from 'vue';
import callMain from './callMain';
import Schema from './Schema.vue';
import TableView from './TableView.vue'

export default {
  components: { Schema, TableView },
  props: {
    id: String
  },
  setup(props) {
    provide('connectionId', props.id);

    const currentTable = ref(null);

    return {
      currentTable
    };
  }
}
</script>
