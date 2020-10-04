<template>
  <div class="container">
    <div class="nav">
    </div>
    <div class="main">
      <div class="left">
        <schema v-model="currentTable" />
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
import { provide, ref, watchEffect } from 'vue';
import callMain from './callMain';
import Schema from './Schema.vue';

export default {
  components: { Schema },
  props: {
    id: String
  },
  setup(props) {
    provide('connectionId', props.id);

    const currentTable = ref(null);
    const loadingData = ref(false);
    const tableData = ref({});

    const selectTable = async (table) => {
      if (!table) return;

      loadingData.value = true;

      try {
        tableData.value = await callMain('fetchData', {
          connectionId: props.id,
          table: table.name
        });
      } catch (error) {
        console.error(error);
        tableData.value = { fields: [], rows: []};
      } finally {
        loadingData.value = false;
      }
    }

    watchEffect(() => {
      selectTable(currentTable.value);
    });

    return {
      selectTable,
      currentTable,
      loadingData,
      tableData
    };
  }
}
</script>
