<template>
  <div class="dropdown">
    <button class="dropdown__trigger" @click="toggleOpen">
      {{ label }} ▼
    </button>
    <dialog :open="open" class="dropdown__dialog">
      <ul class="menu">
        <li v-for="(option, index) in options" :key="index" class="menu__item">
          <button v-if="option" @click="select(option)">
            {{ option }}
          </button>
          <hr v-else />
        </li>
      </ul>
    </dialog>
  </div>
</template>

<style scoped lang='scss'>
.dropdown {
  position: relative;

  &__trigger {
    @include button;
  }

  &__dialog {
    position: absolute;
    top: 100%;
    left: 0;
    margin: 0;
    padding: 0;
    margin-top: 0.25rem;
    background: $panel-background;
    border-radius: $border-radius;
    border: $panel-border-width solid $panel-border-color;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

.menu {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  border-radius: $border-radius;
  overflow: hidden;

  &__item {
    margin: 0;
    padding: 0;
    width: 100%;

    button {
      background: transparent;
      border: none;
      cursor: pointer;
      display: block;
      width: 100%;
      text-align: left;
      padding: 0.5rem 1rem;

      &:hover {
        background: map-get($gray, light);
      }
    }
  }
}
</style>

<script>
import { ref } from 'vue';
export default {
  props: {
    label: { type: String, required: true },
    options: { type: Array, required: true },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const open = ref(false);

    const toggleOpen = () => {
      open.value = !open.value;
    }

    const select = option => {
      open.value = false;
      emit('select', option)
    }
    
    return {
      open,
      toggleOpen,
      select,
    };
  }
}
</script>
