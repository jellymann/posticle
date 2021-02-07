<template>
  <div class="container">
    <database-nav
      v-model:leftBarOpen="leftBarOpen"
      v-model:rightBarOpen="rightBarOpen"
    />
    <div class="main">
      <div class="main__left" v-show="leftBarOpen">
        <schema v-if="connected" />
      </div>
      <div class="main__content">
        <router-view></router-view>
      </div>
      <div class="main__right" v-show="rightBarOpen"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;

  &__left {
    width: 16rem;
    flex-shrink: 0;
    background: $panel-background;
    border-right: $panel-border;
    overflow-x: hidden;
    overflow-y: auto;
  }

  &__right {
    width: 16rem;
    flex-shrink: 0;
    background: $panel-background;
    border-left: $panel-border;
  }

  &__content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
}
</style>

<script>
import { provide, ref } from 'vue';
import Schema from './Schema.vue';
import DatabaseNav from './DatabaseNav.vue';

export default {
  components: {
    Schema,
    DatabaseNav,
  },
  props: {
    connectionId: { type: String, required: true },
  },
  setup() {
    const eventTarget = new EventTarget();
    provide('eventTarget', eventTarget);

    const currentTable = ref(null);
    const showDatabases = ref(false);
    const leftBarOpen = ref(true);
    const rightBarOpen = ref(false);
    const connected = ref(true);

    return {
      currentTable,
      leftBarOpen,
      rightBarOpen,
      showDatabases,
      connected,
    };
  },
};
</script>
