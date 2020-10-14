<template>
  <div v-if="loading">Loading...</div>
    <ul v-else class="tables">
      <li
        v-for="table in publicTables"
        :key="table.name"
        :class="{ 'tables__table': true, 'tables__table--current': table === currentTable }"
      >
        <a @click.prevent="selectTable(table)" class="tables__table-link">
          {{ table.name }}
        </a>
      </li>
      <li
        v-for="schema in otherSchemas"
        :key="schema.name"
        :class="{ 'tables__schema': true, 'tables__schema--open': schema.isOpen }"
      >
        <a @click.prevent="toggleSchema(schema)" class="tables__schema-link">
          {{ schema.name }}
        </a>
        <ul class="tables__schema-tables">
          <li
            v-for="table in schema.tables"
            :key="table.name"
            :class="{ 'tables__table': true, 'tables__table--current': table === currentTable }"
          >
            <a @click.prevent="selectTable(table)" class="tables__table-link">
              {{ table.name }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
</template>

<style lang="scss" scoped>
.tables {
  $block: &;
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

  &__schema {
    &--open {
      #{$block}__schema-tables {
        display: block;
      }
    }
  }

  &__schema-link {
    cursor: pointer;
    margin: 0.5rem 0;
    display: block;
    padding: 0.5rem 1rem;

    &:hover {
      background-color: $highlight-background;
      color: $highlight-foreground;
    }
  }

  &__schema-tables {
    list-style: none;
    margin: 0;
    margin-left: 1rem;
    padding: 0;
    display: none;
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
    const publicTables = ref([]);
    const otherSchemas = ref([]);

    callMain('fetchTables', { connectionId })
      .then(result => {
        publicTables.value = result.publicTables;
        otherSchemas.value = result.otherSchemas;
      })
      .catch(error => {
        console.error(error);
        publicTables.value = [];
        otherSchemas.value = [];
      })
      .finally(() => {
        loading.value = false;
      });

    const selectTable = (table) => {
      currentTable.value = table;
      emit('update:modelValue', table);
    }

    const toggleSchema = (schema) => {
      schema.isOpen = !schema.isOpen;
    }

    return {
      loading,
      publicTables,
      otherSchemas,
      currentTable,
      selectTable,
      toggleSchema
    };
  }
}
</script>
