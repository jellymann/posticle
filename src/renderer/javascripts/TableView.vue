<template>
  <div v-if="currentTab === 'content'" class="content">
    <div v-if="loadingData">Loading...</div>
    <table v-if="!loadingData && tableData" class="content__table">
      <thead>
        <tr>
          <th class="content__th" v-for="field in tableData.fields" :key="field.name">
            {{field}}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in tableData.rows" :key="index">
          <td class="content__td" v-for="(cell, cellIndex) in row" :key="tableData.fields[cellIndex]">
            {{cell}}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="currentTab === 'structure'" class="structure">
    <div v-if="loadingStructure">Loading...</div>
    <div v-if="!loadingStructure && tableStructure">
      <label>Table name</label>
      <input readonly :value="table.name" />

      <table>
        <thead>
          <tr>
            <th>Column name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Constraints</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="column in tableStructure.columns" :key="column.column_name">
            <td>{{column.column_name}}</td>
            <td>{{column.data_type}}</td>
            <td>{{column.column_default}}</td>
            <td>{{column.is_nullable === 'NO' ? 'NOT NULL' : ''}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="status-bar">
    <div class="toggle-button">
      <button
        :class="{ 'toggle-button__button': true, 'toggle-button__button--active': currentTab === 'content' }"
        @click="currentTab = 'content'"
      >
        Content
      </button>
      <button
        :class="{ 'toggle-button__button': true, 'toggle-button__button--active': currentTab === 'structure' }"
        @click="currentTab = 'structure'"
      >
        Structure
      </button>
    </div>
    <div v-if="currentTab === 'content' && tableData" class="status-bar__center">{{ startRow }} - {{ endRow }} of {{ tableData.count }}</div>
    <div v-if="currentTab === 'content' && tableData" class="pagination">
      <button class="pagination__previous" @click="previousPage">
        &lt;
      </button>
      <button class="pagination__page">
        Page {{ currentPage }} of {{ totalPages }}
      </button>
      <button class="pagination__next" @click="nextPage">
        &gt;
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content {
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

.structure {
  flex: 1 1 auto;
  overflow-y: auto;
  position: relative;
}

.status-bar {
  flex-shrink: 0;
  background: $panel-background;
  border-top: $panel-border;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;

  &__center {
    margin: 0 auto;
  }
}

.pagination {
  &__previous, &__page, &__next {
    @include button;
    outline: none;
  }

  &__previous {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }

  &__page {
    border-radius: 0;
  }

  &__next {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: none;
  }
}

.toggle-button {
  &__button {
    @include button;
    outline: none;

    &--active, &--active:hover {
      background: map-get($gray, dark);
      border-color: map-get($gray, dark);
      color: map-get($gray, lightest);
    }

    &:not(:first-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-left: none;
    }

    &:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none;
    }
  }
}
</style>

<script>
import { computed, inject, ref, watch, watchEffect } from 'vue';
import callMain from './callMain';

const ROWS_PER_PAGE = 1000;

export default {
  props: {
    table: Object
  },
  setup(props) {
    const connectionId = inject('connectionId');

    const currentTab = ref("content");

    const tableData = ref(null);
    const loadingData = ref(false);
    
    const tableStructure = ref(null);
    const loadingStructure = ref(false);

    const currentPage = ref(1);

    const offset = computed(() => {
      return (currentPage.value - 1) * ROWS_PER_PAGE;
    });

    const startRow = computed(() => {
      return offset.value + 1;
    });
    const endRow = computed(() => {
      return Math.min(offset.value + ROWS_PER_PAGE, tableData.value.count);
    });
    const totalPages = computed(() => {
      return Math.ceil(tableData.value.count / ROWS_PER_PAGE);
    });

    const previousPage = () => {
      currentPage.value = Math.max(currentPage.value - 1, 1);
    };
    const nextPage = () => {
      currentPage.value = Math.min(currentPage.value + 1, totalPages.value);
    };

    const loadData = async (table, offset) => {
      loadingData.value = true;

      try {
        tableData.value = await callMain('fetchData', {
          connectionId,
          table: table.name,
          options: {
            limit: ROWS_PER_PAGE,
            offset
          }
        });
      } catch (error) {
        console.error(error);
        tableData.value = null;
      } finally {
        loadingData.value = false;
      }
    }

    const loadStructure = async (table) => {
      loadingStructure.value = true;

      try {
        tableStructure.value = await callMain('fetchStructure', {
          connectionId,
          table: table.name
        });
      } catch (error) {
        console.error(error);
        tableStructure.value = null;
      } finally {
        loadingStructure.value = false;
      }
    }

    watchEffect(() => {
      switch (currentTab.value) {
      case 'content':
        loadData(props.table, offset.value);
        break;
      case 'structure':
        loadStructure(props.table);
        break;
      }
    });

    const reset = () => {
      currentPage.value = 1;
      tableData.value = null;
    }

    watchEffect(() => reset(props.table));

    return {
      table: props.table,
      tableData,
      loadingData,
      currentPage,
      startRow,
      endRow,
      totalPages,
      previousPage,
      nextPage,
      currentTab,
      tableStructure,
      loadingStructure
    }
  }
}
</script>
