<template>
  <component :is="currentTab" :table="table">
    <div class="toggle-button">
      <button
        :class="{ 'toggle-button__button': true, 'toggle-button__button--active': currentTab === 'table-content' }"
        @click="currentTab = 'table-content'"
      >
        Content
      </button>
      <button
        :class="{ 'toggle-button__button': true, 'toggle-button__button--active': currentTab === 'table-structure' }"
        @click="currentTab = 'table-structure'"
      >
        Structure
      </button>
    </div>
  </component>
</template>

<style lang="scss" scoped>
.toggle-button {
  &__button {
    @include button;
    outline: none;

    &--active, &--active:hover {
      background: map-get($gray, dark);
      border-color: map-get($gray, dark);
      color: map-get($gray, lightest);
    }

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
import { computed, inject, ref, watch, watchEffect } from 'vue';
import TableContent from './TableContent.vue';
import TableStructure from './TableStructure.vue';

export default {
  components: { TableContent, TableStructure },
  props: {
    table: Object
  },
  setup(props) {
    const currentTab = ref("table-content");

    return {
      currentTab
    }
  }
}
</script>
