<template>
  <div class="filter">
    <ul class="filter__filters">
      <li v-for="(filter, index) in filters" :key="index" class="filter__filter">
        <select class="filter__select">
          <option v-for="column in columns" :key="column.column_name" :value="column.column_name">
            {{column.column_name}}
          </option>
        </select>
        <select class="filter__select"></select>
        <input class="filter__input" v-model="filter.text" />
        <button class="filter__button" @click="removeFilter(index)" v-if="filters.length > 1"> - </button>
        <button class="filter__button" @click="addFilter(index)"> + </button>
      </li>
    </ul>
    <div class="filter__actions">
      <div class="filter__actions-left">
        <button class="filter__button">Save Filter...</button>
        <button class="filter__button">Load Filter...</button>
      </div>
      <div class="filter__actions-right">
        <button class="filter__button" @click="clearFilter">Clear Filter</button>
        <button class="filter__button">SQL Preview</button>
        <button class="filter__button">Apply Filter</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter {
  background: $panel-background;
  border-bottom: $panel-border;
  padding: 0.5rem 1rem;

  &__filters {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__filter {
    display: flex;
    margin-bottom: 0.5rem;
  }

  &__select {
    @include button;
    margin-right: 0.5rem;
  }

  &__input {
    flex-grow: 1;
    margin-right: 0.5rem;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
  }

  &__actions-left, &__actions-right {
    display: flex;
  }

  &__button {
    @include button;

    & + & {
      margin-left: 0.5rem;
    }
  }
}
</style>

<script>
import { ref } from 'vue';

export default {
  props: {
    columns: Array,
  },
  setup() {
    const createFilter = () => {
      return { column: 'foo', operator: 'bar', text: '' };
    };

    const filters = ref([createFilter()]);

    const clearFilter = () => {
      filters.value = [createFilter()];
    };

    const addFilter = (index) => {
      filters.value = [
        ...filters.value.slice(0, index + 1),
        createFilter(),
        ...filters.value.slice(index + 1)
      ];
    };

    const removeFilter = (index) => {
      filters.value = [
        ...filters.value.slice(0, index),
        ...filters.value.slice(index + 1)
      ];
    };

    return {
      filters,
      clearFilter,
      addFilter,
      removeFilter
    };
  }
}
</script>
