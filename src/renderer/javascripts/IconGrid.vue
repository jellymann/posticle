<template>
  <div class="grid">
    <div
      v-for="item in items"
      :key="item.key"
      :class="{ 'item': true, 'selected': selected && item.key === selected.key }"
      @click.stop="selected = item"
      @dblclick.prevent.stop="$emit('open', item)"
    >
      <div class="icon">
        <slot name="icon" :item="item"></slot>
      </div>
      <div class="text">
        <template v-for="segment in segments(item.text)" :key="segment">
          {{ segment }}<wbr/>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 8rem);
  gap: 0.5rem;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.icon {
  padding: 0.25rem;
  margin: 0.25rem;
  border-radius: $border-radius;

  .selected & {
    background-color: map-get($gray, light);
  }
}

.text {
  padding: 0.125rem 0.5rem;
  text-align: center;
  border-radius: $border-radius;

  .selected & {
    background-color: $highlight-background;
    color: $highlight-foreground;
  }
}
</style>

<script>
import { ref } from 'vue';

export default {
  props: {
    items: Array,
  },
  emits: ['open'],
  setup() {
    const selected = ref(null);

    const segments = (text) => {
      return text.split(/(?<=_|\W)/);
    }

    return {
      selected,
      segments,
    };
  },
};
</script>
