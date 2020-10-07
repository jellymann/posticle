<template>
  <table-filter
    v-if="filterOpen && data"
    :columns="data.structure.columns"
    @applyFilter="applyFilter"
  />
  <div class="content">
    <div v-if="loading">Loading...</div>
    <table v-if="!loading && data" class="content__table">
      <thead>
        <tr>
          <th class="content__th" v-for="field in data.fields" :key="field.name">
            {{field}}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data.rows" :key="index">
          <td class="content__td" v-for="(cell, cellIndex) in row" :key="data.fields[cellIndex]">
            {{cell}}
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="status-bar">
    <div class="status-bar__left">
      <slot></slot>
    </div>
    <div v-if="data" class="status-bar__center">{{ startRow }} - {{ endRow }} of {{ data.count }}</div>
    <div v-if="data" class="status-bar__right">
      <button
        :class="{ 'filter-button': true, 'filter-button--active': filterOpen }"
        @click="filterOpen = !filterOpen">
        Filter
      </button>
      <div class="pagination">
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

.status-bar {
  @include status-bar;
}

.filter-button {
  @include button;
  margin-right: 0.5rem;
}

.pagination {
  &__previous, &__page, &__next {
    @include button;
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
</style>

<script>
import { computed, inject, ref, watch, watchEffect } from 'vue';
import callMain from './callMain';
import TableFilter from "./TableFilter.vue";

const ROWS_PER_PAGE = 1000;

export default {
  components: {
    TableFilter
  },
  props: {
    table: Object
  },
  setup(props) {
    const connectionId = inject('connectionId');

    const data = ref(null);
    const loading = ref(false);

    const filterOpen = ref(false);

    const currentPage = ref(1);

    const offset = computed(() => {
      return (currentPage.value - 1) * ROWS_PER_PAGE;
    });

    const startRow = computed(() => {
      return Math.min(offset.value + 1, data.value.count);
    });
    const endRow = computed(() => {
      return Math.min(offset.value + ROWS_PER_PAGE, data.value.count);
    });
    const totalPages = computed(() => {
      return Math.max(Math.ceil(data.value.count / ROWS_PER_PAGE), 1);
    });

    const previousPage = () => {
      currentPage.value = Math.max(currentPage.value - 1, 1);
    };
    const nextPage = () => {
      currentPage.value = Math.min(currentPage.value + 1, totalPages.value);
    };

    const loadDataAndStructure = async (table, offset, filters = null) => {
      loading.value = true;

      try {
        data.value = await callMain('fetchData', {
          connectionId,
          table: table.name,
          options: {
            limit: ROWS_PER_PAGE,
            offset,
            filters
          }
        });
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    }

    watchEffect(() => {
      loadDataAndStructure(props.table, offset.value);
    });

    const reset = () => {
      currentPage.value = 1;
      filterOpen.value = false;
      data.value = null;
    }

    watchEffect(() => reset(props.table));

    const applyFilter = (filters) => {
      loadDataAndStructure(props.table, offset.value, filters);
    }

    watchEffect(() => {
      if (!filterOpen.value) {
        applyFilter(null);
      }
    });

    return {
      data,
      loading,
      currentPage,
      startRow,
      endRow,
      totalPages,
      previousPage,
      nextPage,
      filterOpen,
      applyFilter
    }
  }
}
</script>
