<template>
  <div class="changes-bar">
    <div class="changes-bar__left">
      <button class="changes-bar__button" @click="$emit('discard')">
        Discard Changes
      </button>
    </div>
    <div class="changes-bar__right">
      <button class="changes-bar__button" @click="$emit('save')">
        Save Changes
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.changes-bar {
  @include status-bar;
  background-color: $edited-background;

  &__right {
    margin-left: auto;
  }
}
</style>

<script>
export default {
  emits: ['discard', 'save'],
};
</script>
