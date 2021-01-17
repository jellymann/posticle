<template>
  <table-filter
    v-if="filterOpen && data"
    :columns="data.structure.columns"
    @applyFilter="applyFilter"
    v-model="filters"
  />
  <div class="content" ref="contentEl">
    <div v-if="loading">Loading...</div>
    <div v-if="!loading && data" class="content__table" ref="tableEl" :style="tableStyle">
      <div class="content__thead" :style="{ height: `${HEADER_HEIGHT_REMS}rem` }">
        <div
          class="content__th"
          v-for="(field, index) in data.fields"
          :key="field.name"
          :style="{ width: `${columnWidths[index] || DEFAULT_COLUMN_WIDTH}rem` }"
        >
          {{field}}
          <div class="content__resizer" @mousedown.prevent.left="startColumnResize(index, $event)">
          </div>
        </div>
      </div>
      <div class="content__tbody">
        <transition-group name="list">
          <TableRow
            v-for="index in visibleIndices"
            class="content__tr"
            :style="rowStyle(index)"
            :key="index"
            :row="rows[index]"
            :columnWidths="columnWidths"
            :isSelected="rowIsSelected(index)"
            @mousedown.prevent="mouseDownOnRow(index)"
            @mousemove.prevent="mouseMoveOnRow(index)"
            @finishEdit="finishEditRow(rows[index], index)" />
        </transition-group>
      </div>
    </div>
  </div>

  <div v-if="hasChanges" class="changes-bar">
    <div class="changes-bar__left">
      <button class="changes-bar__button" @click="discardChanges">Discard Changes</button>
    </div>
    <div class="changes-bar__right">
      <button class="changes-bar__button" @click="performChanges">Save Changes</button>
    </div>
  </div>

  <div class="status-bar">
    <div class="status-bar__left">
      <slot></slot>
      <button v-if="data" class="status-bar__button status-bar__new-row" @click="newRow">
        <plus-icon />
        Row
      </button>
    </div>
    <div v-if="data" class="status-bar__center">{{ startRow }} - {{ endRow }} of {{ data.count }}</div>
    <div v-if="data" class="status-bar__right">
      <button
        :class="{ 'status-bar__button': true, 'filter-button': true, 'filter-button--active': filterOpen }"
        @click="filterOpen = !filterOpen">
        Filter
      </button>
      <div class="pagination">
        <button class="status-bar__button pagination__previous" @click="previousPage">
          <back-icon />
        </button>
        <button class="status-bar__button pagination__page">
          Page {{ currentPage }} of {{ totalPages }}
        </button>
        <button class="status-bar__button pagination__next" @click="nextPage">
          <forward-icon />
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

  &__thead {
    display: flex;
    position: sticky;
    top: 0;
    width: max-content;
    background: $panel-background;
    z-index: 1;
  }

  &__th {
    border-right: $panel-border;
    font-weight: normal;
    padding: 0.25rem 0.5rem;
    text-align: left;
    z-index: 1;
    flex: 0 0 auto;
    position: relative;
    
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

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

  &__resizer {
    width: 0.5rem;
    position: absolute;
    right: -0.25rem;
    top: 0;
    height: 100%;
    background-color: transparent;
    cursor: ew-resize;
  }

  &__tbody {
    position: relative;
  }

  &__tr {
    position: absolute;
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.25s ease-out;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.changes-bar {
  @include status-bar;
  background-color: $edited-background;

  &__right {
    margin-left: auto;
  }
}

.status-bar {
  @include status-bar;

  &__new-row {
    margin-left: 0.5rem;
    padding-left: 0.5rem;
  }

  &__button {
    display: flex;
    align-items: center;
  }
}

.filter-button {
  @include button;
  margin-right: 0.5rem;
}

.pagination {
  display: flex;

  &__previous, &__page, &__next {
    @include button;
  }

  &__previous, &__next {
    padding: 0 0.25rem;
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
import { computed, inject, onMounted, ref, reactive, watch, watchEffect, onBeforeUnmount, nextTick } from 'vue';
import callMain from './callMain';
import TableFilter from "./TableFilter.vue";
import TableRow from "./TableRow.vue";
import PlusIcon from '../images/plus.svg';
import BackIcon from '../images/back.svg';
import ForwardIcon from '../images/forward.svg';

const ROWS_PER_PAGE = 1000;
const ROW_HEIGHT_REMS = 3;
const HEADER_HEIGHT_REMS = 2;
const DEFAULT_COLUMN_WIDTH = 20;
const MIN_COLUMN_WIDTH = 2;

function getCurrentFontSize() {
  return parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function convertRemToPixels(rem) {
  return rem * getCurrentFontSize();
}

function convertPixelsToRem(px) {
  return px / getCurrentFontSize();
}

export default {
  components: {
    TableFilter,
    TableRow,
    PlusIcon,
    BackIcon,
    ForwardIcon
  },
  props: {
    table: Object
  },
  setup(props) {
    const connectionId = inject('connectionId');
    const eventTarget = inject('eventTarget');

    const data = ref(null);
    const rows = ref(null);
    const loading = ref(false);

    const filterOpen = ref(false);
    const filters = ref(null);

    const currentPage = ref(1);

    const columnWidths = reactive([]);

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
    
    let mouseIsDown = false;
    let mouseDownOnIndex = null;

    const selectedIndexStart = ref(-1);
    const selectedIndexEnd = ref(-1);
    
    const rowsWithChanges = reactive({});
    const hasChanges = computed(() => Object.keys(rowsWithChanges).length > 0);

    let firstInsert = -1;

    const contentEl = ref(null);
    const tableEl = ref(null);

    const loadDataAndStructure = async () => {
      loading.value = true;

      try {
        data.value = await callMain('fetchData', {
          connectionId,
          table: { ...props.table },
          options: {
            limit: ROWS_PER_PAGE,
            offset: offset.value,
            filters: JSON.parse(JSON.stringify(filters.value))
          }
        });
        data.value.fields.forEach(field => {
          columnWidths.push(DEFAULT_COLUMN_WIDTH);
        });
        let newRows = data.value.rows.map(row => reactive({
          cells: row.map((cell, index) => ({
            value: cell,
            originalValue: cell,
            column: data.value.fields[index]
          }))
        }));
        rows.value = newRows;
        // clear out changes
        for (let x in rowsWithChanges) delete rowsWithChanges[x];
        selectedIndexStart.value = -1;
        selectedIndexEnd.value = -1;
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    }

    watch(offset, loadDataAndStructure);
    onMounted(loadDataAndStructure);

    const reset = () => {
      currentPage.value = 1;
      filterOpen.value = false;
      filters.value = null;
      data.value = null;
      loadDataAndStructure();
    }

    watch(() => props.table, reset);

    const applyFilter = (newFilters) => {
      currentPage.value = 1;
      filters.value = newFilters;
      loadDataAndStructure();
    }

    watch(filterOpen, open => {
      if (!open) applyFilter(null);
    });

    const mouseDownOnRow = (index) => {
      const mouseUp = (event) => {
        event.preventDefault();
        document.removeEventListener('mouseup', mouseUp);
        mouseIsDown = false;
      }
      document.addEventListener('mouseup', mouseUp, false);

      mouseIsDown = true;
      mouseDownOnIndex = index;
      selectedIndexStart.value = index;
      selectedIndexEnd.value = index;
    }

    const mouseMoveOnRow = (index) => {
      if (!mouseIsDown) return;
      selectedIndexStart.value = Math.min(index, mouseDownOnIndex);
      selectedIndexEnd.value = Math.max(index, mouseDownOnIndex);
    }

    const rowIsSelected = (index) => {
      return index >= selectedIndexStart.value && index <= selectedIndexEnd.value;
    }

    const finishEditRow = (row, index) => {
      if (!row.isNew && row.cells.every(({ value, originalValue }) => value === originalValue)) {
        if (rowsWithChanges[index] && rowsWithChanges[index].type === 'update') {
          delete rowsWithChanges[index];
        }
      } else {
        rowsWithChanges[index] = row.isNew ? {
          type: 'insert',
          change: row.cells
            .filter(({ value }) => value)
            .reduce((a, b) => ({ ...a, [b.column]: b.value }), {})
        } : {
          type: 'update',
          change: {
            row: row.cells.reduce((a, b) => ({ ...a, [b.column]: b.originalValue }), {}),
            changes: row.cells
              .filter(({ value, originalValue }) => value !== originalValue)
              .reduce((a, b) => ({ ...a, [b.column]: b.value || null }), {})
          }
        }
      }
    };

    const performChanges = async () => {
      let updates = [];
      let deletes = [];
      let inserts = [];

      Object.entries(rowsWithChanges).forEach(([index, { type, change }]) => {
        let array;
        switch (type) {
        case 'update':
          array = updates;
          break;
        case 'delete':
          array = deletes;
          break;
        case 'insert':
          array = inserts;
          break;
        }
        array.push(JSON.parse(JSON.stringify(change)));
      });

      let m = {
        connectionId,
        table: { ...props.table },
        updates,
        deletes,
        inserts
      }
      try {
        await callMain('performChanges', m);
      } catch (e) {
        alert(e.message);
        return;
      }
      loadDataAndStructure();
    }

    const deletePress = (event) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      if (selectedIndexStart.value === -1 || selectedIndexEnd.value === -1) return;

      let newRowsRemoved = false;

      for (let i = selectedIndexStart.value; i <= selectedIndexEnd.value; i++) {
        let row = rows.value[i];
        row.markForDelete = true;
        if (row.isNew) {
          delete rowsWithChanges[i];
          newRowsRemoved = true;
        } else {
          rowsWithChanges[i] = {
            type: 'delete',
            change: row.cells.reduce((a, b) => ({ ...a, [b.column]: b.originalValue }), {})
          };
        }
      }

      if (newRowsRemoved) {
        rows.value = rows.value.filter(r => !r.isNew || !r.markForDelete);
      }

      selectedIndexStart.value = -1;
      selectedIndexEnd.value = -1;
    };

    onMounted(() => {
      document.addEventListener('keydown', deletePress, false);
      eventTarget.addEventListener('refresh', loadDataAndStructure);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', deletePress);
      eventTarget.removeEventListener('refresh', loadDataAndStructure);
    });

    const discardChanges = () => {
      selectedIndexStart.value = -1;
      selectedIndexEnd.value = -1;
      Object.entries(rowsWithChanges).forEach(([index, { type, change }]) => {
        let row = rows.value[index];
        switch (type) {
        case 'update':
        case 'delete':
          row.cells.forEach(cell => cell.value = cell.originalValue);
          row.markForDelete = false;
          break;
        }
      });
      if (firstInsert !== -1) {
        rows.value = rows.value.slice(0, firstInsert);
      }
      for (let x in rowsWithChanges) delete rowsWithChanges[x];
    };

    const newRow = () => {
      let newIndex = rows.value.length;
      if (firstInsert === -1) firstInsert = newIndex;
      rows.value = [...rows.value, reactive({
        isNew: true,
        cells: data.value.fields.map(field => ({
          value: null,
          originalValue: null,
          column: field
        }))
      })];
      rowsWithChanges[newIndex] = {
        type: 'insert',
        change: {}
      };

      nextTick(() => {
        contentEl.value.scrollTop = tableEl.value.scrollHeight;
      });
    };

    const rowStyle = (index) => {
      return {
        height: `${ROW_HEIGHT_REMS}rem`,
        top: `${ROW_HEIGHT_REMS * index}rem`,
      };
    }

    const visibleIndices = ref([]);

    const updateVisibleIndices = () => {
      if (rows.value) {
        let minIndex = Math.max(0, Math.floor(contentEl.value.scrollTop / (convertRemToPixels(ROW_HEIGHT_REMS))));
        let maxIndex = Math.min(rows.value.length - 1, Math.ceil((contentEl.value.scrollTop + contentEl.value.clientHeight) / (convertRemToPixels(ROW_HEIGHT_REMS))));
        let newIndices = [];
        for (let i = minIndex; i <= maxIndex; i++) {
          newIndices.push(i);
        }
        visibleIndices.value = newIndices;
      } else {
        visibleIndices.value = [];
      }
    }

    watch(rows, updateVisibleIndices);

    onMounted(() => {
      contentEl.value.addEventListener('scroll', updateVisibleIndices, { passive: true });
      window.addEventListener('resize', updateVisibleIndices, { passive: true });
    });

    onBeforeUnmount(() => {
      contentEl.value.removeEventListener('scroll', updateVisibleIndices);
      window.removeEventListener('resize', updateVisibleIndices);
    });

    const tableStyle = computed(() => {
      if (!rows.value) return {};

      return { height: `${rows.value.length * ROW_HEIGHT_REMS + HEADER_HEIGHT_REMS}rem` };
    });

    let resizingColumnIndex = ref(null);
    let originalMouseX = null;
    let originalColumnWidth = null;
    const startColumnResize = (index, event) => {
      resizingColumnIndex.value = index;
      originalColumnWidth = columnWidths[index];
      originalMouseX = event.clientX;

      document.addEventListener('mouseup', stopResizingColumn, false);
      document.addEventListener('mousemove', resizeColumn, false);

      document.body.classList.add('cursor-ew-resize');
    };

    const stopResizingColumn = (event) => {
      if (!event.button === 0) return;

      resizingColumnIndex.value = null;

      document.removeEventListener('mouseup', stopResizingColumn);
      document.removeEventListener('mousemove', resizeColumn);

      document.body.classList.remove('cursor-ew-resize');

      event.preventDefault();
    };

    const resizeColumn = (event) => {
      let { clientX } = event;
      let dx = clientX - originalMouseX;

      let index = resizingColumnIndex.value;
      let dxRems = convertPixelsToRem(dx);
      columnWidths[index] = Math.max(originalColumnWidth + dxRems, MIN_COLUMN_WIDTH);

      event.preventDefault();
    }

    return {
      data,
      rows,
      loading,
      currentPage,
      startRow,
      endRow,
      totalPages,
      previousPage,
      nextPage,
      filterOpen,
      applyFilter,
      filters,
      mouseDownOnRow,
      mouseMoveOnRow,
      selectedIndexStart,
      selectedIndexEnd,
      rowIsSelected,
      hasChanges,
      finishEditRow,
      performChanges,
      discardChanges,
      newRow,
      contentEl,
      tableEl,
      columnWidths,
      rowStyle,
      visibleIndices,
      tableStyle,
      HEADER_HEIGHT_REMS,
      startColumnResize,
    }
  }
}
</script>
