<template>
  <div v-if="loading">Loading...</div>
    <ul v-else class="tables">
      <li
        v-for="table in publicTables"
        :key="table.name"
        :class="{ 'tables__table': true, 'tables__table--current': table === currentTable }"
      >
        <schema-item :item="table" type="table" @select="selectTable(table)" />
      </li>
      <li
        v-for="schema in otherSchemas"
        :key="schema.name"
        :class="{ 'tables__schema': true, 'tables__schema--open': schema.isOpen }"
      >
        <schema-item :item="schema" type="schema" @select="toggleSchema(schema)" />
        <ul class="tables__schema-tables">
          <li
            v-for="table in schema.tables"
            :key="table.name"
            :class="{ 'tables__table': true, 'tables__table--current': table === currentTable }"
          >
            <schema-item :item="table" type="table" @select="selectTable(table)" />
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

  &__schema {
    &--open {
      #{$block}__schema-tables {
        display: block;
      }
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
import { ref, inject, onMounted, onBeforeUnmount } from 'vue';
import callMain from './callMain';
import SchemaItem from './SchemaItem.vue';

export default {
  components: {
    SchemaItem
  },
  props: {
    modelValue: Object
  },
  setup(props, { emit }) {
    const connectionId = inject('connectionId');
    const eventTarget = inject('eventTarget');

    const currentTable = ref(props.modelValue)
    const loading = ref(true);
    const publicTables = ref([]);
    const otherSchemas = ref([]);

    const loadTables = async () => {
      try {
        loading.value = true;
        let result = await callMain('fetchTables', { connectionId });
        publicTables.value = result.publicTables;
        otherSchemas.value = result.otherSchemas;
      } catch(error) {
        console.error(error);
        publicTables.value = [];
        otherSchemas.value = [];
      } finally {
        loading.value = false;
      };
    }
    loadTables();

    const selectTable = (table) => {
      currentTable.value = table;
      emit('update:modelValue', table);
    }

    const toggleSchema = (schema) => {
      schema.isOpen = !schema.isOpen;
    }

    onMounted(() => {
      eventTarget.addEventListener('refresh', loadTables);
    });

    onBeforeUnmount(() => {
      eventTarget.removeEventListener('refresh', loadTables);
    });

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
