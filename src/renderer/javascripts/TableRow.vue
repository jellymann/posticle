<template>
  <div :class="{ 'row': true, 'is-selected': isSelected, 'is-deleted': row.markForDelete }">
    <div
      v-for="(cell, index) in row.cells"
      :class="{ cell:true, 'cell--is-edited': cell.value !== cell.originalValue }"
      :key="cell.column"
      @dblclick="editCell(cell)"
      :style="{ width: `${columnWidths[index]}rem` }"
    >
      <div class="cell__content">
        <textarea
          class="cell__input"
          ref="input"
          v-if="cell.isEditing"
          v-model="cell.value"
          @mousedown.stop
          @mousemove.stop
          @keydown.stop="handleKeyDown"
        />
        <div class="cell__value" v-else>
          {{ cell.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.row {
  display: flex;
}

.cell {
  border-bottom: $panel-border;
  border-right: $panel-border;
  flex: 0 0 auto;

  &--is-edited {
    background: $edited-background;
  }

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

  .is-deleted & {
    background: $deleted-background;
  }
}
</style>

<script>
import { ref, nextTick, onMounted } from 'vue';

export default {
  props: {
    row: { type: Object, required: true },
    isSelected: Boolean,
    columnWidths: { type: Array, required: true },
  },
  emits: ['finish-edit'],
  setup(props, { emit }) {
    const input = ref(null);

    const stopEditing = () => {
      props.row.cells.forEach(otherCell => {
        otherCell.isEditing = false;
      });
      emit('finish-edit');
      document.removeEventListener('mousedown', stopEditing);
    }

    const focusInput = () => {
      input.value.scrollIntoViewIfNeeded(false);
      input.value.select();
    }

    const handleKeyDown = (event) => {
      switch (event.key) {
      case 'Escape':
        props.row.cells.forEach(cell => {
          if (cell.isEditing) cell.value = cell.originalValue;
          cell.isEditing = false;
        });
        event.preventDefault();
        stopEditing();
        break;
      case 'Enter':
        event.preventDefault();
        stopEditing();
        break;
      case 'Tab':
        {
          event.preventDefault();
          let editNext = false;
          for (let i = 0; i < props.row.cells.length; i++) {
            if (props.row.cells[i].isEditing) {
              props.row.cells[i].isEditing = false;
              editNext = true;
              continue;
            }
            if (editNext) {
              props.row.cells[i].isEditing = true;
              nextTick(focusInput);
              return;
            }
          }
          stopEditing();
        }
        break;
      }
    }

    const editCell = (cell) => {
      props.row.cells.forEach(otherCell => {
        otherCell.isEditing = false;
      });
      cell.isEditing = true

      document.addEventListener('mousedown', stopEditing, false);

      nextTick(focusInput);
    }

    onMounted(() => {
      if (props.row.isNew && !props.row.hasHadFocus) {
        props.row.hasHadFocus = true;
        editCell(props.row.cells[0]);
      }

      if (input.value) {
        input.value.select();
      }
    });

    return {
      editCell,
      input,
      handleKeyDown
    };
  }
}
</script>
