<template>
  <tr :class="{ 'is-selected': isSelected }">
    <td class="cell" v-for="(cell, cellIndex) in cells" :key="fields[cellIndex]" @dblclick="editCell(cell)">
      <div class="cell__content">
        <textarea class="cell__input" v-if="cell.isEditing" v-model="cell.value" @mousedown.stop @mousemove.stop />
        <div class="cell__value" v-else>{{cell.value}}</div>
      </div>
    </td>
  </tr>
</template>

<style lang="scss" scoped>
.cell {
  height: 3rem;
  max-width: 300px;
  border-bottom: $panel-border;
  border-right: $panel-border;

  &__content {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
  }

  &__value {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__value, &__input {
    width: 100%;
    padding: 0 0.5rem;
  }

  &__input {
    height: 100%;
    border: 0;
    resize: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

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
    const stopEditing = () => {
      props.cells.forEach(otherCell => {
        otherCell.isEditing = false;
      });
      document.removeEventListener('mousedown', stopEditing);
    }

    const editCell = (cell) => {
      props.cells.forEach(otherCell => {
        otherCell.isEditing = false;
      });
      cell.isEditing = true


      document.addEventListener('mousedown', stopEditing, false);
    }

    return {
      ...props,
      editCell
    };
  }
}
</script>