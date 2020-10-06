<template>
  <component :is="currentTab" :table="table">
    <toggle-buttons
      v-model="currentTab"
      :items="[
        {value: 'table-content', label: 'Content'},
        {value: 'table-structure', label: 'Structure'}
      ]"
    />
  </component>
</template>

<script>
import { computed, inject, ref, watch, watchEffect } from 'vue';
import TableContent from './TableContent.vue';
import TableStructure from './TableStructure.vue';
import ToggleButtons from './ToggleButtons.vue';

export default {
  components: { TableContent, TableStructure, ToggleButtons },
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
