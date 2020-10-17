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
          <tr v-for="column in structure.columns" :key="column.name">
            <td>{{column.name}}</td>
            <td>{{column.type}}</td>
            <td>{{column.defaultValue}}</td>
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
      <slot></slot>
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
import { computed, inject, ref, watch, watchEffect, onMounted, onBeforeUnmount } from 'vue';
import callMain from './callMain';

export default {
  props: {
    table: Object
  },
  setup(props) {
    const connectionId = inject('connectionId');
    const eventTarget = inject('eventTarget');
    
    const structure = ref(null);
    const loading = ref(false);

    const loadStructure = async (table = props.table) => {
      loading.value = true;

      try {
        structure.value = await callMain('fetchStructure', {
          connectionId,
          table: { ...table }
        });
      } catch (error) {
        console.error(error);
        structure.value = null;
      } finally {
        loading.value = false;
      }
    }

    onMounted(() => {
      eventTarget.addEventListener('refresh', loadStructure);
    });

    onBeforeUnmount(() => {
      eventTarget.removeEventListener('refresh', loadStructure);
    });

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

