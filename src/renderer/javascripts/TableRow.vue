<template>
  <tr :class="{ 'is-selected': isSelected }">
    <td v-for="(cell, cellIndex) in cells" :key="fields[cellIndex]">
      {{cell}}
    </td>
  </tr>
</template>

<style lang="scss" scoped>
td {
  height: 3rem;
  white-space: nowrap;
  max-width: 300px;
  overflow: hidden;
  padding: 0.25rem 0.5rem;
  border-bottom: $panel-border;
  border-right: $panel-border;
  text-overflow: ellipsis;

  .is-selected & {
    background-color: $highlight-background;
    color: $highlight-foreground;
  }
}
</style>

<script>
export default {
  props: {
    cells: Array,
    isSelected: Boolean,
    fields: Array
  },
  setup(props) {
    return {
      ...props
    };
  }
}
</script>
