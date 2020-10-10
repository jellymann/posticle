<template>
  <tr :class="{ 'is-selected': isSelected }">
    <td
      :class="{ cell:true, 'cell--is-edited': cell.value !== cell.originalValue }"
      v-for="(cell, cellIndex) in cells"
      :key="fields[cellIndex]"
      @dblclick="editCell(cell)"
    >
      <div class="cell__content">
        <textarea
          class="cell__input"
          ref='input'
          v-if="cell.isEditing"
          v-model="cell.value"
          @mousedown.stop
          @mousemove.stop
        />
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

  &--is-edited {
    background: $edited-background;
  }

  &__content {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    position: relative;
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
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: calc(3rem - 3px);

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
import { ref, nextTick } from 'vue';

export default {
  props: {
    cells: Array,
    isSelected: Boolean,
    fields: Array
  },
  setup(props) {
    const input = ref(null);

    const stopEditing = () => {
      props.cells.forEach(otherCell => {
        otherCell.isEditing = false;
      });
      document.removeEventListener('mousedown', stopEditing);
      document.removeEventListener('keydown', cancelEditing);
    }

    const cancelEditing = (event) => {
      if (event.key !== 'Escape') return;
      props.cells.forEach(cell => {
        if (cell.isEditing) cell.value = cell.originalValue;
        cell.isEditing = false;
      });
      stopEditing();
    }

    const editCell = (cell) => {
      props.cells.forEach(otherCell => {
        otherCell.isEditing = false;
      });
      cell.isEditing = true

      document.addEventListener('mousedown', stopEditing, false);
      document.addEventListener('keydown', cancelEditing, false);

      nextTick(() => {
        input.value.select();
      });
    }

    return {
      ...props,
      editCell,
      input
    };
  }
}
</script>
