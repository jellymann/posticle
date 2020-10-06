<template>
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
    <slot></slot>
    <div v-if="data" class="status-bar__center">{{ startRow }} - {{ endRow }} of {{ data.count }}</div>
    <div v-if="data" class="pagination">
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

.status-bar {
  @include status-bar;
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

    const data = ref(null);
    const loading = ref(false);

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
      return Math.min(Math.ceil(data.value.count / ROWS_PER_PAGE), 1);
    });

    const previousPage = () => {
      currentPage.value = Math.max(currentPage.value - 1, 1);
    };
    const nextPage = () => {
      currentPage.value = Math.min(currentPage.value + 1, totalPages.value);
    };

    const loadData = async (table, offset) => {
      loading.value = true;

      try {
        data.value = await callMain('fetchData', {
          connectionId,
          table: table.name,
          options: {
            limit: ROWS_PER_PAGE,
            offset
          }
        });
      } catch (error) {
        console.error(error);
        data.value = null;
      } finally {
        loading.value = false;
      }
    }

    watchEffect(() => {
      loadData(props.table, offset.value);
    });

    const reset = () => {
      currentPage.value = 1;
      data.value = null;
    }

    watchEffect(() => reset(props.table));

    return {
      data,
      loading,
      currentPage,
      startRow,
      endRow,
      totalPages,
      previousPage,
      nextPage
    }
  }
}
</script>
