<template>
  <a @click.prevent="click" :class="{ 'item': true, [`item--${itemType}`]: true }">
    <component :is="icon" class="item__icon" />
    <span class="item__name">{{ item.name }}</span>
  </a>
</template>

<style lang="scss" scoped>
.item {
  $block: &;
  cursor: pointer;
  margin: 0.25rem 0;
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;

  &:hover {
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
</style>

<script>
import TableIcon from '../images/table.svg';
import SchemaIcon from '../images/schema.svg';

export default {
  components: { TableIcon,SchemaIcon },
  props: {
    item: { type: Object, required: true },
    type: { type: String, required: true },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const click = () => {
      emit('select');
    }

    const icon = props.type === 'schema' ? 'schema-icon' : 'table-icon';
    const itemType = props.type === 'schema' ? 'schema' : (
      props.item.type === 'VIEW' ? 'view' : 'table'
    );

    return {
      ...props,
      itemType,
      icon,
      click
    }
  }
}
</script>
