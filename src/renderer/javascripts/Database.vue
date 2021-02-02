<template>
  <div class="container">
    <database-nav
      :showDatabases="showDatabases"
      :table="currentTable"
      v-model:leftBarOpen="leftBarOpen"
      v-model:rightBarOpen="rightBarOpen"
      @breadcrumb="breadcrumbSelected"
      @refresh="refresh"
    />
    <div class="main">
      <div class="main__left" v-show="leftBarOpen">
        <schema v-model="currentTable" v-if="connected" />
      </div>
      <div class="main__content">
        <!-- TODO: probably use an actual router for this :/ -->
        <database-list v-if="showDatabases && !currentTable" @openDatabase="openDatabase"/>
        <table-list v-if="!showDatabases && !currentTable" @openTable="currentTable = $event"/>
        <table-view :table="currentTable" v-if="!showDatabases && currentTable" />
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
import DatabaseList from './DatabaseList.vue'
import TableList from './TableList.vue'
import TableView from './TableView.vue'
import DatabaseNav from './DatabaseNav.vue';
import callMain from './callMain';

export default {
  components: {
    Schema,
    DatabaseList,
    TableList,
    TableView,
    DatabaseNav,
  },
  props: {
    id: String,
  },
  setup(props) {
    const eventTarget = new EventTarget();
    provide('eventTarget', eventTarget);
    provide('connectionId', props.id);

    const currentTable = ref(null);
    const showDatabases = ref(false);
    const leftBarOpen = ref(true);
    const rightBarOpen = ref(false);
    const connected = ref(true);

    const breadcrumbSelected = (breadcrumb) => {
      switch (breadcrumb) {
        case 'host':
          currentTable.value = null;
          showDatabases.value = true;
          break;
        case 'database':
          currentTable.value = null;
          showDatabases.value = false;
          break;
      }
    };

    const refresh = () => {
      const refreshEvent = new CustomEvent('refresh');
      eventTarget.dispatchEvent(refreshEvent);
    };

    const openDatabase = async (database) => {
      connected.value = false;
      await callMain('useDatabase', { connectionId: props.id, database });
      showDatabases.value = false;
      currentTable.value = null;
      connected.value = true;
    };

    return {
      currentTable,
      leftBarOpen,
      rightBarOpen,
      breadcrumbSelected,
      refresh,
      showDatabases,
      openDatabase,
      connected,
    };
  },
};
</script>
