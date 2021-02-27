<template>
  <div class="structure">
    <div v-if="loading">
      Loading...
    </div>
    <div v-if="!loading && structure">
      <div class="table-details">
        <div class="th">
          <label for="table_name">Table name</label>
        </div>
        <div class="th"></div>
        <div class="th">
          <label for="table_schema">Schema</label>
        </div>
        <div class="th">
          <label for="table_tablespace">Tablespace</label>
        </div>
        <div class="td table-name-cell">
          <input id="table_name" v-model="changes.table.name" />
        </div>
        <div class="td table-temp-cell">
          <input id="table_temporary" type="checkbox" :checked="changes.table.temporary" disabled />
          <label for="table_temporary" disabled>Temporary</label>
        </div>
        <div class="td">
          <select id="table_schema" v-model="changes.table.schema">
            <option :value="schema">
              {{ schema }}
            </option>
          </select>
        </div>
        <div class="td">
          <select id="table_tablespace" v-model="changes.table.tablespace">
          </select>
        </div>
      </div>

      <table class="table-columns">
        <thead>
          <tr>
            <th>Column name</th>
            <th>Type</th>
            <th>Default</th>
            <th>Constraints</th>
            <th></th>
          </tr>
        </thead>
        <tbody ref="columnsBody">
          <tr v-for="(column, i) in changes.structure.columns" :key="i" :class="{ 'removed': column.toBeRemoved }">
            <td class="table-cell">
              <input type="text" class="table-input" v-model="column.name" />
            </td>
            <td class="table-cell">
              <input type="text" class="table-input" v-model="column.type" />
            </td>
            <td class="table-cell">
              <div class="flex">
                <select class="table-button" v-model="column.defaultType" @change.passive="changeColumnDefault(column)">
                  <option :value="null">
                    no default
                  </option>
                  <option value="constant">
                    constant
                  </option>
                  <option value="expression">
                    expression
                  </option>
                  <option value="sequence">
                    sequence
                  </option>
                </select>
                <input type="text" class="table-input" v-model="column.defaultValue" />
              </div>
            </td>
            <td class="table-cell">
              <div class="flex">
                <button v-for="constraint in column.constraints" :key="constraint" class="table-button">
                  {{ constraint }}
                </button>
                <button class="table-button new-constraint">
                  <plus-icon />
                </button>
              </div>
            </td>
            <td>
              <button class="remove-button" @click="removeColumn(column)">
                <minus-icon />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <h1 class="indexes-header">
        Indexes
      </h1>
      <table class="table-indexes">
        <thead>
          <tr>
            <th>Index name</th>
            <th>Type</th>
            <th>Columns</th>
            <th></th>
          </tr>
        </thead>
        <tbody ref="indexesBody">
          <tr v-for="(index, i) in changes.structure.indexes" :key="i" :class="{ 'removed': index.toBeRemoved }">
            <td class="table-cell">
              <input type="text" class="table-input" v-model="index.name" :placeholder="index.isNew ? `${table}_idx` : structure.indexes[i].name" />
            </td>
            <td class="table-cell">
              <span :class="`table-button index-${index.type}`">{{ INDEX_TYPE_LABELS[index.type] }}</span>
            </td>
            <td class="table-cell">
              <div class="flex">
                <span v-for="column in index.columns" :key="column" class="table-button">
                  {{ column }}
                </span>
                <span v-if="index.isNew" class="table-button new-constraint select-button">
                  <select :id="`index_${i}_column`" @change="addColumnToIndex(index, $event)">
                    <option :value="null" disabled selected></option>
                    <option v-for="column in structure.columns" :key="column.name" :value="column.name">
                      {{ column.name }}
                    </option>
                  </select>
                  <label :for="`index_${i}_column`">
                    <plus-icon />
                  </label>
                </span>
              </div>
            </td>
            <td>
              <button class="remove-button" @click="removeIndex(index)">
                <minus-icon />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <changes-bar
    v-if="hasChanges"
    @discard="discardChanges"
    @save="performChanges"
  />

  <div class="status-bar">
    <div class="status-bar__left">
      <toggle-buttons
        :links="true"
        :items="[
          {
            label: 'Content',
            to: {
              name: 'TableContent',
              params: { connectionId, database, table, schema, tableType, table }
            }
          },
          {
            label: 'Structure',
            to: {
              name: 'TableStructure',
              params: { connectionId, database, table, schema, tableType, table }
            }
          },
        ]"
      />
      <button v-if="!loading && structure" class="status-bar__button status-bar__new-button" @click="newColumn">
        <plus-icon />
        Column
      </button>
      <button v-if="!loading && structure" class="status-bar__button status-bar__new-button" @click="newIndex">
        <plus-icon />
        Index
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.structure {
  flex: 1 1 auto;
  overflow-y: auto;
  position: relative;
  padding: 1rem;
}

.table-details {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  margin-bottom: 1rem;

  .th {
    grid-row: 1;
  }

  .td {
    grid-row: 2;
  }

  select {
    width: 100%;
  }
}

.th + .th, .td + .td {
  margin-left: 0.5rem;
}

.td {
  padding: 0.25rem 0;
}

.table-name-cell {
  width: 100%;
  padding: 0;
  border: 1px solid map-get($gray, lighter);
  border-bottom: 1px solid map-get($gray, light);

  input {
    width: 100%;
    height: 100%;
    border: none;
    background: none;
    padding: 0.25rem 0.5rem;
  }
}

.table-temp-cell {
  white-space: nowrap;

  input, label {
    vertical-align: middle;
  }

  label {
    margin-left: 0.125rem;
    font-size: 0.75rem;
  }
}

th, .th {
  text-align: left;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: bold;
}

.th {
  margin-bottom: 0.5rem;
}

table {
  margin-bottom: 1rem;
  min-width: 100%;
  border-spacing: 0 0.5rem;
  padding-right: 0.5rem;
}

td {
  white-space: nowrap;
}

.table-cell {
  position: relative;
  font-size: 0.75rem;
  border-top: 1px solid map-get($gray, lighter);
  border-bottom: 1px solid map-get($gray, light);

  &:first-child {
    border-left: 1px solid map-get($gray, lighter);
  }

  &:nth-last-child(2) {
    border-right: 1px solid map-get($gray, lighter);
  }

  .removed & {
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      height: 2px;
      left: 0;
      right: 0;
      background: red;
    }

    &:first-child::after {
      left: -0.5rem;
    }

    &:nth-last-child(2)::after {
      right: -0.5rem;
    }
  }

  & + &::before {
    content: '';
    border-left: 1px solid map-get($gray, light);
    width: 0;
    height: calc(100% - 0.5rem);
    position: absolute;
    top: 0;
    left: 0;
    margin: 0.25rem 0;
  }

  .table-button {
    &:first-child {
      margin-left: 0.25rem;
    }
  }
}

.flex {
  display: flex;
  align-items: center;

  > * + * {
    margin-left: 0.25rem;
  }
}

.table-input {
  border: none;
  background: none;
  width: 100%;
  min-width: max-content;
  padding: 0.25rem 0.5rem;
}

.table-button {
  border: 1px solid map-get($gray, default);
  border-radius: $border-radius-small;
  background: map-get($gray, lighter);
  font-size: 0.75rem;
  padding: 0.0625rem 0.25rem;

  & + & {
    margin-left: 0.25rem;
  }
}

.new-constraint {
  padding: 0;
  svg {
    width: 1rem;
    height: auto;
  }
}

.select-button {
  position: relative;

  select {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: 0;
    padding: 0;
    max-width: 100%;
    opacity: 0;
  }

  label {
    pointer-events: none;
  }
}

.remove-button {
  background: none;
  border: none;
  margin-left: 0.5rem;
  padding: 0;
  height: 100%;
  display: flex;
  align-items: center;

  svg {
    width: auto;
    height: 1rem;
  }
}

.indexes-header {
  font-size: 1.5rem;
  font-weight: normal;
  margin-bottom: 0.25rem;
}

.status-bar {
  @include status-bar;

  &__new-button {
    margin-left: 0.5rem;
    padding-left: 0.5rem;
  }

  &__button {
    display: flex;
    align-items: center;
  }
}
</style>

<script>
import { inject, ref, watch, onMounted, onBeforeUnmount, reactive, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';

import callMain from './callMain';
import deepClone from './deepClone';

import ChangesBar from './ChangesBar.vue';

import ToggleButtons from './ToggleButtons.vue';

import PlusIcon from '../images/plus.svg';
import MinusIcon from '../images/minus.svg';

const INDEX_TYPE_LABELS = {
  index: 'Index',
  unique: 'Unique Index',
  primary: 'Primary Key Index',
};

export default {
  components: {
    ToggleButtons,
    ChangesBar,
    PlusIcon,
    MinusIcon,
  },
  props: {
    connectionId: { type: String, required: true },
    database: { type: String, required: true },
    schema: { type: String, required: true },
    tableType: { type: String, required: true },
    table: { type: String, required: true },
  },
  setup(props) {
    const router = useRouter();
    const eventTarget = inject('eventTarget');
    
    const structure = ref(null);
    const loading = ref(false);

    const changes = reactive({});

    const columnsBody = ref(null);
    const indexesBody = ref(null);

    const loadStructure = async (table) => {
      loading.value = true;

      try {
        structure.value = await callMain('fetchStructure', {
          connectionId: props.connectionId,
          table,
        });
        discardChanges();
      } catch (error) {
        console.error(error);
        structure.value = null;
      } finally {
        loading.value = false;
      }
    }
    const loadStructureForCurrentTable = () => {
      return loadStructure({ schema: props.schema, name: props.table });
    };

    onMounted(() => {
      loadStructureForCurrentTable();
      eventTarget.addEventListener('refresh', loadStructureForCurrentTable);
    });

    onBeforeUnmount(() => {
      eventTarget.removeEventListener('refresh', loadStructureForCurrentTable);
    });

    watch([() => props.schema, () => props.table], loadStructureForCurrentTable);

    const removeColumn = (column) => {
      if (column.isNew) {
        let columns = changes.structure.columns;
        columns.splice(columns.indexOf(column), 1);
      } else {
        column.toBeRemoved = !column.toBeRemoved;
      }
    };

    const removeIndex = (index) => {
      if (index.isNew) {
        let indexes = changes.structure.indexes;
        indexes.splice(indexes.indexOf(index), 1);
      } else {
        index.toBeRemoved = !index.toBeRemoved;
      }
    };

    const newColumn = () => {
      changes.structure.columns.push({
        name: `column${changes.structure.columns.length}`,
        type: 'text',
        defaultValue: null,
        defaultType: null,
        constraints: [],
        isNew: true,
      });

      nextTick(() => {
        columnsBody.value.querySelector('tr:last-child input').select();
      });
    };

    const changeColumnDefault = (column) => {
      if (!column.defaultType) {
        column.defaultValue = '';
      }
    }

    const newIndex = () => {
      changes.structure.indexes.push({
        name: '',
        type: 'index',
        method: 'btree',
        columns: [],
        isNew: true,
      });

      nextTick(() => {
        indexesBody.value.querySelector('tr:last-child input').focus();
      });
    };

    const addColumnToIndex = (index, event) => {
      let column = event.currentTarget.value;
      event.currentTarget.value = null;

      index.columns.push(column);
    };

    const hasChanges = computed(() => {
      if (!changes.table || !changes.structure) return false;

      return props.table !== changes.table.name ||
        props.schema !== changes.table.schema ||
        props.table.tablespace !== changes.table.tablespace ||
        structure.value.columns.some((column, index) => {
          let changedColumn = changes.structure.columns[index];
          return changedColumn.toBeRemoved ||
            column.name !== changedColumn.name ||
            column.type !== changedColumn.type ||
            column.defaultValue !== changedColumn.defaultValue ||
            column.defaultType !== changedColumn.defaultType; // TODO: compare constraints
        }) ||
        changes.structure.columns.some(column => column.isNew) ||
        structure.value.indexes.some((index, i) => {
          let changedIndex = changes.structure.indexes[i];
          return changedIndex.toBeRemoved || index.name !== changedIndex.name;
        }) ||
        changes.structure.indexes.some(index => index.isNew);
    });

    const discardChanges = () => {
      changes.structure = deepClone(structure.value);
      changes.table = { schema: props.schema, name: props.table };
    };

    const performChanges = async () => {
      let m = { connectionId: props.connectionId };

      m.table = { schema: props.schema, name: props.table };
      m.tableChanges = {};

      if (props.table !== changes.table.name) {
        m.tableChanges.name = changes.table.name;
      }
      if (props.schema !== changes.table.schema) {
        m.tableChanges.schema = changes.table.schema;
      }
      if (props.table.tablespace !== changes.table.tablespace) {
        m.tableChanges.tablespace = changes.table.tablespace;
      }

      m.columnChanges = [];
      structure.value.columns.forEach((column, index) => {
        let changedColumn = changes.structure.columns[index];
        if (changedColumn.toBeRemoved) {
          m.columnChanges.push({ type: 'remove', column: column.name });
          return;
        }
        if (column.name !== changedColumn.name) {
          m.columnChanges.push({ type: 'rename', column: column.name, newName: changedColumn.name });
        }
        if (column.type !== changedColumn.type) {
          m.columnChanges.push({ type: 'changeType', column: changedColumn.name, newType: changedColumn.type });
        }
        if (column.defaultValue !== changedColumn.defaultValue || column.defaultType !== changedColumn.defaultType) {
          if (changedColumn.defaultType) {
            m.columnChanges.push({ type: 'changeDefault', column: changedColumn.name, newDefault: changedColumn.defaultValue, newDefaultType: changedColumn.defaultType });
          } else {
            m.columnChanges.push({ type: 'removeDefault', column: changedColumn.name });
          }
        }
        // TODO: constraints
      });

      changes.structure.columns.filter(x => x.isNew).forEach(column => {
        let change = { type: 'add', column: column.name, dataType: column.type };
        if (column.defaultType) {
          change.defaultValue = column.defaultValue;
          change.defaultType = column.defaultType;
        }
        m.columnChanges.push(change);
      });

      // TODO: indexes

      try {
        await callMain('performTableChanges', m);
      } catch (e) {
        alert(e.message);
        return;
      }
      router.push({
        name: 'TableStructure',
        params: {
          connectionId: props.connectionId,
          database: props.database,
          schema: changes.table.schema,
          table: changes.table.name,
        },
      });
      eventTarget.dispatchEvent(new CustomEvent('refresh'));
    };

    return {
      changes,
      structure,
      loading,
      removeColumn,
      removeIndex,
      newColumn,
      newIndex,
      addColumnToIndex,
      hasChanges,
      discardChanges,
      performChanges,
      columnsBody,
      indexesBody,
      changeColumnDefault,
      INDEX_TYPE_LABELS,
    };
  },
};
</script>
