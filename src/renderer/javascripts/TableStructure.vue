<template>
  <div class="structure">
    <div v-if="loading">Loading...</div>
    <div v-if="!loading && structure">
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
          <tr v-for="column in structure.columns" :key="column.column_name">
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
    <slot></slot>
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
import { computed, inject, ref, watch, watchEffect } from 'vue';
import callMain from './callMain';

export default {
  props: {
    table: Object
  },
  setup(props) {
    const connectionId = inject('connectionId');
    
    const structure = ref(null);
    const loading = ref(false);

    const loadStructure = async (table) => {
      loading.value = true;

      try {
        structure.value = await callMain('fetchStructure', {
          connectionId,
          table: table.name
        });
      } catch (error) {
        console.error(error);
        structure.value = null;
      } finally {
        loading.value = false;
      }
    }

    watchEffect(() => {
      loadStructure(props.table);
    });

    return {
      table: props.table,
      structure,
      loading
    }
  }
}
</script>

