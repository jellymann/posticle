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
        <div v-if="currentTable && loadingData">Loading...</div>
        <div v-if="currentTable && !loadingData" class="table">
          <table class="table__table">
            <thead>
              <tr>
                <th class="table__th" v-for="field in tableData.fields" :key="field.name">
                  {{field}}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in tableData.rows" :key="index">
                <td class="table__td" v-for="(cell, cellIndex) in row" :key="tableData.fields[cellIndex]">
                  {{cell}}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="currentTable && !loadingData" class="status-bar">
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

.table {
  flex: 1 1 auto;
  overflow: auto;
  position: relative;

  &__table {
    border-collapse: collapse;
  }

  &__th {
    position: sticky;
    top: 0;
    background: $panel-background;
    border-right: $panel-border;
    font-weight: normal;
    height: 2rem;
    padding: 0.25rem 0.5rem;
    text-align: left;

    &::after {
      position: absolute;
      content: '';
      bottom: 0;
      left: 0;
      right: 0;
      height: $panel-border-width;
      background-color: $panel-border-color;
    }
  }

  &__td {
    height: 3rem;
    white-space: nowrap;
    max-width: 300px;
    overflow-x: auto;
    padding: 0.25rem 0.5rem;
    border-bottom: $panel-border;
    border-right: $panel-border;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.status-bar {
  height: 3rem;
  flex-shrink: 0;
  background: $panel-background;
  border-top: $panel-border;
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
    const loadingData = ref(false);
    const tableData = ref({});

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

    const selectTable = async (table) => {
      loadingData.value = true;
      currentTable.value = table;

      try {
        tableData.value = await callMain('fetchData', {
          connectionId: props.id,
          table: currentTable.value.name
        });
      } catch (error) {
        console.error(error);
        tableData.value = { fields: [], rows: []};
      } finally {
        loadingData.value = false;
      }
    }

    return {
      loadingTables,
      tables,
      selectTable,
      currentTable,
      loadingData,
      tableData
    };
  }
}
</script>
