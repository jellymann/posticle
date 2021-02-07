<template>
  <div v-if="loading">
    Loading...
  </div>
  <ul v-if="!loading && database" class="tables">
    <schema-item
      v-for="table in publicTables"
      :key="table.name"
      :item="table"
      type="table"
    />
    <schema-item
      v-for="schema in otherSchemas"
      :key="schema.name"
      :item="schema"
      type="schema"
    />
  </ul>
</template>

<style lang="scss" scoped>
.tables {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>

<script>
import { ref, inject, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import callMain from './callMain';
import SchemaItem from './SchemaItem.vue';

export default {
  components: {
    SchemaItem
  },
  setup() {
    const route = useRoute();

    const connectionId = computed(() => route.params.connectionId);
    const database = computed(() => route.params.database);
    const eventTarget = inject('eventTarget');

    const loadedDatabase = ref(null);
    const loading = ref(false);
    const publicTables = ref([]);
    const otherSchemas = ref([]);

    const loadTables = async (force = true) => {
      if (!database.value) return;
      if (!force && loadedDatabase.value === database.value) return;
      try {
        loading.value = true;
        let result = await callMain('fetchTables', { connectionId: connectionId.value, database: database.value });
        publicTables.value = result.publicTables;
        otherSchemas.value = result.otherSchemas;
        loadedDatabase.value = database.value;
      } catch(error) {
        console.error(error);
        publicTables.value = [];
        otherSchemas.value = [];
      } finally {
        loading.value = false;
      }
    }
    loadTables(false);

    watch(database, () => loadTables(false));

    onMounted(() => {
      eventTarget.addEventListener('refresh', loadTables);
    });

    onBeforeUnmount(() => {
      eventTarget.removeEventListener('refresh', loadTables);
    });

    return {
      loading,
      database,
      publicTables,
      otherSchemas,
    };
  }
}
</script>
