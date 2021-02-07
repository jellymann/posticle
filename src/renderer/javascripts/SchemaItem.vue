<template>
  <li :class="`tables__${type}`">
    <router-link :to="tableRoute" :class="itemClass" v-if="type === 'table'">
      <table-icon class="item__icon" />
      <span class="item__name">{{ item.name }}</span>
    </router-link>
    <a @click.prevent="isOpen = !isOpen" :class="itemClass" v-if="type === 'schema'">
      <schema-icon class="item__icon" />
      <span class="item__name">{{ item.name }}</span>
    </a>
    <ul class="schema-tables" v-if="type === 'schema' && isOpen">
      <schema-item
        v-for="table in item.tables"
        :key="table.name"
        :item="table"
        type="table"
      />
    </ul>
  </li>
</template>

<style lang="scss" scoped>
.item {
  $block: &;
  cursor: pointer;
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;

  &:hover, &.router-link-active {
    background-color: $highlight-background;
    color: $highlight-foreground;
  }

  &__name {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__icon {
    margin-right: 0.5rem;
    flex-shrink: 0;
  }

  &--schema {
    #{$block}__icon {
      color: map-get($gray, dark);
    }
  }

  &--view {
    #{$block}__icon {
      color: $view-icon-color;
    }
  }

  &--table {
    #{$block}__icon {
      color: $table-icon-color;
    }
  }
}

.schema-tables {
  list-style: none;
  margin: 0;
  margin-left: 1rem;
  padding: 0;
}
</style>

<script>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import TableIcon from '../images/table.svg';
import SchemaIcon from '../images/schema.svg';

export default {
  name: 'SchemaItem',
  components: {
    TableIcon,
    SchemaIcon,
  },
  props: {
    item: { type: Object, required: true },
    type: { type: String, required: true },
  },
  setup(props) {
    const route = useRoute();

    const connectionId = computed(() => route.params.connectionId);
    const database = computed(() => route.params.database);
    const isOpen = ref(props.type === 'schema' && route.params.schema === props.item.name);

    const itemType = computed(() => {
      if (props.type === 'schema') return 'schema';
      return props.item.type === 'VIEW' ? 'view' : 'table';
    });

    const itemClass = computed(() => `item item--${itemType.value}`);

    const tableRoute = computed(() => ({
      name: route.name === 'TableStructure' ? 'TableStructure' : 'TableContent',
      params: {
        connectionId: connectionId.value,
        database: database.value,
        schema: props.item.schema,
        tableType: itemType.value,
        table: props.item.name,
      },
    }));

    return {
      connectionId,
      database,
      itemType,
      itemClass,
      isOpen,
      tableRoute,
    };
  },
};
</script>
