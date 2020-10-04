<template>
  <div v-if="loadingData">Loading...</div>
  <div v-if="!loadingData" class="table">
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
  <div v-if="!loadingData" class="status-bar">
  </div>
</template>

<style lang="scss" scoped>
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
import { inject, ref, watch, watchEffect } from 'vue';
import callMain from './callMain';

export default {
  props: {
    table: Object
  },
  setup(props) {
    const connectionId = inject('connectionId');

    const tableData = ref({});
    const loadingData = ref(false);

    const loadData = async (table) => {
      loadingData.value = true;

      try {
        tableData.value = await callMain('fetchData', {
          connectionId,
          table: table.name
        });
      } catch (error) {
        console.error(error);
        tableData.value = { fields: [], rows: []};
      } finally {
        loadingData.value = false;
      }
    }

    watchEffect(() => loadData(props.table));

    return {
      table: props.table,
      tableData,
      loadingData
    }
  }
}
</script>
