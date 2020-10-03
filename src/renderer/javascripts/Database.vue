<template>
  <div class="container">
    <div class="nav">
    </div>
    <div class="main">
      <div class="left">
        <div v-if="loadingTables">Loading...</div>
        <ul v-else>
          <li v-for="table in tables" :key="table.name">
            {{ table.name }}
          </li>
        </ul>
      </div>
      <div class="content"></div>
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
  background: $panel-background;
  border-bottom: $panel-border;
}

.main {
  display: flex;
  flex: 1 0 auto;
}

.left {
  width: 16rem;
  background: $panel-background;
  border-right: $panel-border;
}

.right {
  width: 16rem;
  background: $panel-background;
  border-left: $panel-border;
}

.content {
  flex: 1 0 auto;
}
</style>

<script>
import { provide, ref } from 'vue';
import callMain from './callMain';

export default {
  props: {
    id: String
  },
  setup(props) {
    provide('connectionId', props.id);

    const loadingTables = ref(true);
    const tables = ref([]);

    callMain('fetchTables', { connectionId: props.id })
      .then(resultTables => {
        tables.value = resultTables;
      })
      .catch(error => {
        console.error(error);
        tables.value = [];
      })
      .finally(() => {
        loadingTables.value = false;
      });

    return {
      loadingTables,
      tables
    };
  }
}
</script>
