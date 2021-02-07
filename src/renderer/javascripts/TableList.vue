<template>
  <div class="scroll">
    <div v-if="loading">
      Loading...
    </div>
    <template v-if="!loading">
      <IconGrid
        v-if="publicTables.length > 0"
        class="grid"
        :items="publicTables.map(tableItem)"
        @open="openTable($event.table)"
      >
        <template #icon="{ item }">
          <table-big-icon :class="`icon ${tableIconClass(item.table)}`" />
        </template>
      </IconGrid>
      <div v-for="schema in otherSchemas" :key="schema.name" :class="{ 'schema': true, 'open ': schema.isOpen }">
        <button @click="toggleSchema(schema)" :class="{ 'schema-button': true, 'schema-button--expanded': schema.isOpen }">
          <Triangle class="schema-button__triangle" />
          <SchemaIcon class="schema-button__icon" />
          <span class="schema-button__label">{{ schema.name }}</span>
        </button>
        <IconGrid
          v-if="schema.isOpen"
          :items="schema.tables.map(tableItem)"
          @open="openTable($event.table)"
        >
          <template #icon="{ item }">
            <table-big-icon :class="`icon ${tableIconClass(item.table)}`" />
          </template>
        </IconGrid>
      </div>
    </template>
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

.grid {
  margin-bottom: 2rem;
}

.schema-button {
  $block: &;
  background: none;
  border: none;
  display: flex;
  padding: 0;
  margin-bottom: 1rem;
  align-items: center;

  &--expanded {
    #{$block}__triangle {
      transform: rotate(90deg);
    }
  }

  &__triangle {
    width: 1rem;
    height: auto;
    fill: map-get($gray, default);
    margin-right: 0.25rem;

    transition: transform 250ms ease-in-out;
  }

  &__icon {
    margin-right: 0.25rem;
  }
}
</style>

<script>
import { inject, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import callMain from './callMain';

import IconGrid from './IconGrid.vue';

import TableBigIcon from '../images/table-big.svg';
import SchemaIcon from '../images/schema.svg';
import Triangle from '../images/triangle.svg';

export default {
  components: {
    IconGrid,
    TableBigIcon,
    SchemaIcon,
    Triangle,
  },
  props: {
    connectionId: { type: String, required: true },
    database: { type: String, required: true },
  },
  setup(props) {
    const router = useRouter();
    const eventTarget = inject('eventTarget');

    const loading = ref(true);
    const publicTables = ref([]);
    const otherSchemas = ref([]);

    const loadTables = async () => {
      try {
        loading.value = true;
        let result = await callMain('fetchTables', { connectionId: props.connectionId, database: props.database });
        publicTables.value = result.publicTables;
        otherSchemas.value = result.otherSchemas;
      } catch(error) {
        console.error(error);
        publicTables.value = [];
        otherSchemas.value = [];
      } finally {
        loading.value = false;
      }
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

    const openTable = (table) => {
      router.push({
        name: 'TableContent',
        params: {
          connectionId: props.connectionId,
          database: props.database,
          schema: table.schema,
          tableType: table.type === 'VIEW' ? 'view' : 'table',
          table: table.name,
        },
      });
    };

    return {
      loading,
      publicTables,
      otherSchemas,
      toggleSchema,
      tableItem,
      tableIconClass,
      openTable,
    };
  }
}
</script>
