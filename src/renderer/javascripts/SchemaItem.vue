<template>
  <a @click.prevent="click" :class="{ 'item': true, [`item--${type}`]: true }">
    <component :is="icon" class="item__icon" />
    <span class="item__name">{{ item.name }}</span>
  </a>
</template>

<style lang="scss" scoped>
.item {
  $block: &;
  cursor: pointer;
  margin: 0.5rem 0;
  display: flex;
  padding: 0.5rem 1rem;

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
      stroke: map-get($gray, dark);
    }
  }

  &--view {
    #{$block}__icon {
      fill: #007AA0;
    }
  }

  &--table {
    #{$block}__icon {
      fill: #B78400;
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
    item: Object,
    type: String
  },
  setup(props, { emit }) {
    const click = () => {
      emit('select');
    }

    const icon = props.type === 'schema' ? 'schema-icon' : 'table-icon';
    const type = props.type === 'schema' ? 'schema' : (
      props.item.type === 'VIEW' ? 'view' : 'table'
    );

    return {
      ...props,
      type,
      icon,
      click
    }
  }
}
</script>
