<template>
  <div class="toggle-button">
    <template v-if="links">
      <router-link
        v-for="item in items"
        :key="item.label"
        class="toggle-button__button toggle-button__button--link"
        :to="item.to"
      >
        {{ item.label }}
      </router-link>
    </template>
    <template v-else>
      <button
        v-for="item in items"
        :key="item.value"
        :class="{ 'toggle-button__button': true, 'toggle-button__button--active': value === item.value }"
        @click="setValue(item.value)"
      >
        {{ item.label }}
      </button>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.toggle-button {
  display: flex;

  &__button {
    @include button;

    &:not(:first-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-left: none;
    }

    &:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border-right: none;
    }
  }
}
</style>

<script>
import { ref } from 'vue';

export default {
  props: {
    items: { type: Array, required: true },
    modelValue: { type: String, default: null },
    links: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const value = ref(props.modelValue || null);

    const setValue = newValue => {
      value.value = newValue;
      emit('update:modelValue', newValue);
    }

    return {
      value,
      setValue
    };
  }
}
</script>
