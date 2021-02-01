<template>
  <div class="scroll">
    <div v-if="loading">Loading...</div>
    <IconGrid
      v-if="!loading"
      :items="databases.map(databaseItem)"
      @open="$emit('openDatabase', $event.key)"
    >
      <template #icon>
        <database-big-icon class="icon"/>
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
}
</style>

<script>
import { inject, ref, onMounted, onBeforeUnmount } from 'vue';
import callMain from './callMain';

import IconGrid from './IconGrid.vue';

import DatabaseBigIcon from '../images/database-big.svg';

export default {
  components: {
    IconGrid,
    DatabaseBigIcon,
  },
  emits: ['openDatabase'],
  setup(_props, { emit }) {
    const connectionId = inject('connectionId');
    const eventTarget = inject('eventTarget');

    const loading = ref(true);
    const databases = ref([]);

    const loadDatabases = async () => {
      try {
        loading.value = true;
        databases.value = await callMain('fetchDatabases', { connectionId });
      } catch(error) {
        console.error(error);
        databases.value = [];
      } finally {
        loading.value = false;
      };
    }
    loadDatabases();

    onMounted(() => {
      eventTarget.addEventListener('refresh', loadDatabases, { passive: true });
    });

    onBeforeUnmount(() => {
      eventTarget.removeEventListener('refresh', loadDatabases);
    });

    const databaseItem = (database) => {
      return {
        key: database,
        text: database,
      };
    };

    return {
      loading,
      databases,
      databaseItem,
    };
  }
}
</script>
