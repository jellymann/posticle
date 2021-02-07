<template>
  <div class="structure">
    <div v-if="loading">
      Loading...
    </div>
    <div v-if="!loading && structure">
      <label>Table name</label>
      <input readonly :value="table" />

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
          <tr v-for="column in structure.columns" :key="column.name">
            <td>
              {{ column.name }}
            </td>
            <td>
              {{ column.type }}
            </td>
            <td>
              {{ column.defaultValue }}
            </td>
            <td>
              <span v-for="constraint in column.constraints" :key="constraint">
                {{ constraint }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="status-bar">
    <div class="status-bar__left">
      <toggle-buttons
        :links="true"
        :items="[
          {
            label: 'Content',
            to: {
              name: 'TableContent',
              params: { connectionId, database, table, schema, table }
            }
          },
          {
            label: 'Structure',
            to: {
              name: 'TableStructure',
              params: { connectionId, database, table, schema, table }
            }
          },
        ]"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.structure {
  flex: 1 1 auto;
  overflow-y: auto;
  position: relative;
}

.status-bar {
  @include status-bar;
}
</style>

<script>
import { inject, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import callMain from './callMain';

import ToggleButtons from './ToggleButtons.vue';

export default {
  components: {
    ToggleButtons,
  },
  props: {
    connectionId: { type: String, required: true },
    database: { type: String, required: true },
    schema: { type: String, required: true },
    table: { type: String, required: true },
  },
  setup(props) {
    const eventTarget = inject('eventTarget');
    
    const structure = ref(null);
    const loading = ref(false);

    const loadStructure = async (table) => {
      loading.value = true;

      try {
        structure.value = await callMain('fetchStructure', {
          connectionId: props.connectionId,
          table,
        });
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
    loadStructureForCurrentTable();

    onMounted(() => {
      eventTarget.addEventListener('refresh', loadStructureForCurrentTable);
    });

    onBeforeUnmount(() => {
      eventTarget.removeEventListener('refresh', loadStructureForCurrentTable);
    });

    watch([() => props.schema, () => props.table], loadStructureForCurrentTable);

    return {
      structure,
      loading,
    };
  },
};
</script>

