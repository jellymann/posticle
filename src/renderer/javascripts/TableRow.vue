<template>
  <tr>
    <td v-for="(cell, cellIndex) in row" :key="fields[cellIndex]">
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
}
</style>

<script>
export default {
  props: {
    row: Array,
    fields: Array
  },
  setup(props) {
    return {
      ...props
    };
  }
}
</script>
