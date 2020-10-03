<template>
  <div class="container">
    <div class="nav">
    </div>
    <div class="main">
      <div class="left">
        <div v-if="loadingTables">Loading...</div>
        <ul v-else class="tables">
          <li
            v-for="table in tables"
            :key="table.name"
            :class="{ 'tables__table': true, 'tables__table--current': table === currentTable }"
          >
            <a @click.prevent="selectTable(table)" class="tables__table-link">
              {{ table.name }}
            </a>
          </li>
        </ul>
      </div>
      <div class="content">
        <div v-if="currentTable">
          {{currentTable.name}}
        </div>
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

.tables {
  list-style: none;
  margin: 0;
  padding: 0;

  &__table {
    cursor: pointer;
    margin: 0.5rem 0;
    
    &:hover, &--current {
      background-color: $highlight-background;
      color: $highlight-foreground;
    }
  }

  &__table-link {
    display: block;

    padding: 0.5rem 1rem;
  }
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

    const currentTable = ref(null);

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

    const selectTable = (table) => {
      currentTable.value = table;
    }

    return {
      loadingTables,
      tables,
      selectTable,
      currentTable
    };
  }
}
</script>
