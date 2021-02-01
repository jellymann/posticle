<template>
  <div class="scroll">
    <div v-if="loading">Loading...</div>
    <IconGrid
      v-if="!loading"
      :items="publicTables.map(tableItem)"
      @open="$emit('openTable', $event.table)"
    >
      <template #icon="{ item }">
        <table-big-icon :class="`icon ${tableIconClass(item.table)}`"/>
      </template>
    </IconGrid>
  </div>
</template>

<style lang="scss" scoped>
.scroll {
  overflow-y: auto;
  padding: 1rem;
}

.icon {
  width: 4rem;
  height: auto;

  fill: $table-icon-color;

  &.view {
    fill: $view-icon-color
  }
}
</style>

<script>
import { inject, ref, onMounted, onBeforeUnmount } from 'vue';
import callMain from './callMain';

import IconGrid from './IconGrid.vue';

import TableBigIcon from '../images/table-big.svg';

export default {
  components: {
    IconGrid,
    TableBigIcon,
  },
  emits: ['openTable'],
  setup(_props, { emit }) {
    const connectionId = inject('connectionId');
    const eventTarget = inject('eventTarget');

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

    const toggleSchema = (schema) => {
      schema.isOpen = !schema.isOpen;
    }

    onMounted(() => {
      eventTarget.addEventListener('refresh', loadTables, { passive: true });
    });

    onBeforeUnmount(() => {
      eventTarget.removeEventListener('refresh', loadTables);
    });

    const tableIconClass = ({ type }) => {
      return type === 'VIEW' ? 'view' : 'table';
    };

    const tableItem = (table) => {
      return {
        key: table.name,
        text: table.name,
        table,
      };
    };

    return {
      loading,
      publicTables,
      otherSchemas,
      toggleSchema,
      tableItem,
      tableIconClass,
    };
  }
}
</script>
