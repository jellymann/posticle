<template>
  <div class="filter">
    <ul class="filter__filters">
      <li v-for="(filter, index) in filters" :key="index" class="filter__filter">
        <filter-item :filter="filter" :columns="columns"></filter-item>
        <button class="filter__button filter__button--icon" @click="removeFilter(index)" v-if="filters.length > 1">
          <minus-icon />
        </button>
        <button class="filter__button filter__button--icon" @click="addFilter(index)">
          <plus-icon />
        </button>
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
        <button class="filter__button" @click="applyFilter">Apply Filter</button>
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

  &__actions {
    display: flex;
    justify-content: space-between;
  }

  &__actions-left, &__actions-right {
    display: flex;
  }

  &__button {
    @include button;

    &--icon {
      padding: 0 0.25rem;
    }

    & + & {
      margin-left: 0.5rem;
    }
  }
}
</style>

<script>
import { ref, computed, watchEffect } from 'vue';
import FilterItem from './FilterItem.vue';
import PlusIcon from '../images/plus.svg';
import MinusIcon from '../images/minus.svg';

export default {
  components: {
    FilterItem,
    PlusIcon,
    MinusIcon
  },
  props: {
    columns: Array,
    modelValue: Array
  },
  setup(props, { emit }) {
    const createFilter = () => {
      return { column: null, operator: null, text: '' };
    };

    const filters = ref(props.modelValue || [createFilter()]);

    const clearFilter = () => {
      filters.value = [createFilter()];
      applyFilter();
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

    const emitFilters = computed(() => {
      return filters.value
        .filter(filter => { // remove invalid filters
          if (filter.column === 'custom' && filter.text) return true;
          if (!filter.column || !filter.operator) return false;
          if (filter.operator.hasParameter && !filter.text) return false;
          return true;
        })
        .map(filter => ({ // simplify filter objects to send to backend
          column: typeof filter.column === 'string' ? filter.column : { name: filter.column.name },
          operator: filter.operator ? filter.operator.id : null,
          text: filter.text
        }));
    })

    const applyFilter = () => {
      emit('applyFilter', emitFilters.value);
    }

    watchEffect(() => {
      emit('update:modelValue', emitFilters.value);
    });

    return {
      filters,
      clearFilter,
      addFilter,
      removeFilter,
      applyFilter
    };
  }
}
</script>
