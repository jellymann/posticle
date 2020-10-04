<template>
  <div v-if="loading">Loading...</div>
    <ul v-else class="tables">
      <li
        v-for="table in tables"
        :key="table.name"
        :class="{ 'tables__table': true, 'tables__table--current': table === currentTable }"
      >
        <a @click.prevent="selectTable(table)" class="tables__table-link">
          {{ table.name }}
        </a>
      </li>
    </ul>
</template>

<style lang="scss" scoped>
.tables {
  list-style: none;
  margin: 0;
  padding: 0;

  &__table {
    cursor: pointer;
    margin: 0.5rem 0;
    
    &:hover, &--current {
      background-color: $highlight-background;
      color: $highlight-foreground;
    }
  }

  &__table-link {
    display: block;
    padding: 0.5rem 1rem;
  }
}
</style>

<script>
import { ref, inject } from 'vue';
import callMain from './callMain';

export default {
  props: {
    modelValue: Object
  },
  setup(props, { emit }) {
    const connectionId = inject('connectionId');

    const currentTable = ref(props.modelValue)
    const loading = ref(true);
    const tables = ref([]);

    callMain('fetchTables', { connectionId })
      .then(resultTables => {
        tables.value = resultTables;
      })
      .catch(error => {
        console.error(error);
        tables.value = [];
      })
      .finally(() => {
        loading.value = false;
      });

    const selectTable = (table) => {
      currentTable.value = table;
      emit('update:modelValue', table);
    }

    return {
      loading,
      tables,
      currentTable,
      selectTable
    };
  }
}
</script>
